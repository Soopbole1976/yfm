import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, searchEvents, formatEventData, formatMarketData } from '../services/polymarket';
import { exportMarketsToExcel, exportEventsToExcel } from '../services/excelExport';

function MarketBrowser() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClosed, setShowClosed] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = search
        ? await searchEvents(search)
        : await fetchEvents({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, active: !showClosed });
      setEvents(formatEventData(raw));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, showClosed, page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    loadEvents();
  }

  function handleExportEvents() {
    if (events.length === 0) return;
    exportEventsToExcel(events, `polymarket_events_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function handleExportMarkets(event) {
    const markets = formatMarketData(event.marketsData || []);
    if (markets.length === 0) return;
    const safeName = event.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    exportMarketsToExcel(markets, `polymarket_${safeName}.xlsx`);
  }

  function handleExportAllMarkets() {
    const allMarkets = [];
    for (const event of events) {
      allMarkets.push(...formatMarketData(event.marketsData || []));
    }
    if (allMarkets.length === 0) return;
    exportMarketsToExcel(allMarkets, `polymarket_all_markets_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="market-browser">
      <div className="browser-header">
        <h2>Polymarket Explorer</h2>
        <p className="subtitle">Browse live prediction markets and export to Excel</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search markets (e.g. 'election', 'bitcoin', 'AI')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="controls">
        <label className="toggle">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => { setShowClosed(e.target.checked); setPage(0); }}
          />
          <span>Show closed markets</span>
        </label>
        <div className="export-buttons">
          <button className="btn btn-export" onClick={handleExportEvents} disabled={events.length === 0}>
            <ExcelIcon /> Export Events Summary
          </button>
          <button className="btn btn-export" onClick={handleExportAllMarkets} disabled={events.length === 0}>
            <ExcelIcon /> Export All Markets
          </button>
        </div>
      </div>

      {error && <div className="error-msg">Error: {error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <span>Loading markets...</span>
        </div>
      ) : (
        <>
          <div className="events-list">
            {events.length === 0 && !loading && (
              <div className="empty-state">No events found. Try a different search.</div>
            )}
            {events.map((event, i) => (
              <div key={event.slug || i} className="event-card">
                <div
                  className="event-header"
                  onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                >
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className={`status ${event.active ? 'active' : 'closed'}`}>
                        {event.active ? 'Active' : 'Closed'}
                      </span>
                      <span>{event.markets} market{event.markets !== 1 ? 's' : ''}</span>
                      <span>Vol: ${Number(event.volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                      <span>Liq: ${Number(event.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button
                      className="btn btn-sm btn-export"
                      onClick={(e) => { e.stopPropagation(); handleExportMarkets(event); }}
                      disabled={!event.marketsData?.length}
                    >
                      <ExcelIcon /> Export
                    </button>
                    <span className={`expand-icon ${expandedEvent === i ? 'open' : ''}`}>&#9662;</span>
                  </div>
                </div>

                {expandedEvent === i && (
                  <div className="event-markets">
                    {(event.marketsData || []).length === 0 ? (
                      <p className="no-markets">No market data available</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th>Yes</th>
                            <th>No</th>
                            <th>Volume</th>
                            <th>Liquidity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(event.marketsData || []).map((m, j) => {
                            let yesPrice = null;
                            try {
                              const prices = JSON.parse(m.outcomePrices || '[]');
                              if (prices.length > 0) yesPrice = parseFloat(prices[0]);
                            } catch { /* ignore */ }
                            return (
                              <tr key={m.conditionId || j}>
                                <td className="question-cell">{m.question || m.groupItemTitle || ''}</td>
                                <td className="price yes">
                                  {yesPrice != null ? `${(yesPrice * 100).toFixed(0)}¢` : '—'}
                                </td>
                                <td className="price no">
                                  {yesPrice != null ? `${((1 - yesPrice) * 100).toFixed(0)}¢` : '—'}
                                </td>
                                <td>${Number(m.volume || m.volumeNum || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                                <td>${Number(m.liquidity || m.liquidityNum || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </button>
            <span className="page-info">Page {page + 1}</span>
            <button className="btn" onClick={() => setPage((p) => p + 1)} disabled={events.length < PAGE_SIZE}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ExcelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#217346" />
      <path d="M4.5 4L8 8.5L4.5 13H6.5L8.8 9.5L11.1 13H13L9.5 8.5L13 4H11L8.8 7.4L6.6 4H4.5Z" fill="white" />
    </svg>
  );
}

export default MarketBrowser;
