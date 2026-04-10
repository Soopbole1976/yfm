import * as XLSX from 'xlsx';

export function exportMarketsToExcel(markets, filename = 'polymarket_data.xlsx') {
  const rows = markets.map((m) => ({
    'Question': m.question,
    'Outcome': m.outcome,
    'Yes Price': m.bestBid != null ? `$${m.bestBid.toFixed(2)}` : 'N/A',
    'No Price': m.bestBid != null ? `$${(1 - m.bestBid).toFixed(2)}` : 'N/A',
    'Volume (Total)': `$${Number(m.volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    'Volume (24hr)': `$${Number(m.volume24hr).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    'Liquidity': `$${Number(m.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    'Active': m.active ? 'Yes' : 'No',
    'Closed': m.closed ? 'Yes' : 'No',
    'End Date': m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A',
    'Slug': m.slug,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key] || '').length)
    ) + 2,
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Markets');

  XLSX.writeFile(wb, filename);
}

export function exportEventsToExcel(events, filename = 'polymarket_events.xlsx') {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = events.map((e) => ({
    'Event': e.title,
    'Markets': e.markets,
    'Volume': `$${Number(e.volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    'Liquidity': `$${Number(e.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    'Active': e.active ? 'Yes' : 'No',
    'End Date': e.endDate ? new Date(e.endDate).toLocaleDateString() : 'N/A',
  }));

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  summaryWs['!cols'] = Object.keys(summaryRows[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...summaryRows.map((r) => String(r[key] || '').length)
    ) + 2,
  }));
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Events Summary');

  // Detailed markets sheet with all markets from all events
  const allMarkets = [];
  for (const event of events) {
    for (const m of event.marketsData || []) {
      let yesPrice = null;
      try {
        const prices = JSON.parse(m.outcomePrices || '[]');
        if (prices.length > 0) yesPrice = parseFloat(prices[0]);
      } catch { /* ignore */ }

      allMarkets.push({
        'Event': event.title,
        'Question': m.question || m.title || '',
        'Outcome': m.groupItemTitle || m.outcome || '',
        'Yes Price': yesPrice != null ? `$${yesPrice.toFixed(2)}` : 'N/A',
        'No Price': yesPrice != null ? `$${(1 - yesPrice).toFixed(2)}` : 'N/A',
        'Volume': `$${Number(m.volume || m.volumeNum || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        'Liquidity': `$${Number(m.liquidity || m.liquidityNum || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        'Active': m.active ? 'Yes' : 'No',
      });
    }
  }

  if (allMarkets.length > 0) {
    const marketsWs = XLSX.utils.json_to_sheet(allMarkets);
    marketsWs['!cols'] = Object.keys(allMarkets[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...allMarkets.map((r) => String(r[key] || '').length)
      ) + 2,
    }));
    XLSX.utils.book_append_sheet(wb, marketsWs, 'All Markets');
  }

  XLSX.writeFile(wb, filename);
}
