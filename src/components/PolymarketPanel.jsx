import { usePolymarkets } from '../hooks/usePolymarkets'

function OddsBar({ yes }) {
  const no = 100 - yes
  return (
    <div className="odds-bar">
      <div className="odds-yes" style={{ width: `${yes}%` }} />
      <div className="odds-no" style={{ width: `${no}%` }} />
    </div>
  )
}

function MarketRow({ market }) {
  // Gamma API fields
  const title = market.question || market.title || 'Untitled'
  const volume = parseFloat(market.volume ?? market.volume24hr ?? 0)
  const slug = market.slug || market.conditionId || ''

  // Parse best yes probability from outcomes/outcomePrices
  let yesPct = null
  try {
    const prices = market.outcomePrices
      ? JSON.parse(market.outcomePrices)
      : null
    if (prices && prices.length >= 1) {
      yesPct = Math.round(parseFloat(prices[0]) * 100)
    }
  } catch (_) {}

  const url = slug
    ? `https://polymarket.com/event/${slug}`
    : 'https://polymarket.com'

  return (
    <div className="market-row">
      <div className="market-title">
        <a href={url} target="_blank" rel="noreferrer">{title}</a>
      </div>
      <div className="market-meta">
        {yesPct !== null && (
          <span className="yes-prob">{yesPct}% Yes</span>
        )}
        <span className="volume">${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} vol</span>
      </div>
      {yesPct !== null && <OddsBar yes={yesPct} />}
    </div>
  )
}

export default function PolymarketPanel() {
  const { markets, loading, error } = usePolymarkets(10)

  return (
    <div className="card polymarket-card">
      <div className="card-header">
        <h2>Polymarket — Live Markets</h2>
        <a
          href="https://polymarket.com"
          target="_blank"
          rel="noreferrer"
          className="pm-link"
        >
          polymarket.com ↗
        </a>
      </div>
      <p className="card-subtitle">Top markets by 24h volume · refreshes every 30s</p>

      {loading && !markets.length && (
        <div className="loading-state">
          <span className="spinner" />
          Loading markets…
        </div>
      )}

      {error && (
        <div className="error-state">
          Failed to load: {error}
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="empty-state">No active markets found.</div>
      )}

      <div className="market-list">
        {markets.map((m, i) => (
          <MarketRow key={m.conditionId ?? m.id ?? i} market={m} />
        ))}
      </div>
    </div>
  )
}
