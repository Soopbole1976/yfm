const GAMMA_BASE = '/api/gamma';
const CLOB_BASE = '/api/clob';

export async function fetchEvents({ query = '', limit = 20, offset = 0, active = true } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    active: String(active),
    closed: String(!active),
  });
  if (query) params.set('title', query);

  const res = await fetch(`${GAMMA_BASE}/events?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function fetchMarkets({ limit = 50, offset = 0, active = true } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    active: String(active),
    closed: String(!active),
  });

  const res = await fetch(`${GAMMA_BASE}/markets?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  return res.json();
}

export async function fetchMarketBySlug(slug) {
  const res = await fetch(`${GAMMA_BASE}/markets?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Failed to fetch market: ${res.status}`);
  return res.json();
}

export async function searchEvents(query) {
  const params = new URLSearchParams({
    title: query,
    limit: '50',
    active: 'true',
  });

  const res = await fetch(`${GAMMA_BASE}/events?${params}`);
  if (!res.ok) throw new Error(`Failed to search events: ${res.status}`);
  return res.json();
}

export function formatMarketData(markets) {
  return markets.map((m) => ({
    question: m.question || m.title || '',
    outcome: m.groupItemTitle || m.outcome || '',
    outcomePrices: m.outcomePrices || '',
    bestBid: parseBestPrice(m.outcomePrices, 'bid'),
    bestAsk: parseBestPrice(m.outcomePrices, 'ask'),
    volume: parseFloat(m.volume || m.volumeNum || 0),
    volume24hr: parseFloat(m.volume24hr || 0),
    liquidity: parseFloat(m.liquidity || m.liquidityNum || 0),
    startDate: m.startDate || '',
    endDate: m.endDateIso || m.endDate || '',
    active: m.active ?? true,
    closed: m.closed ?? false,
    conditionId: m.conditionId || '',
    slug: m.slug || '',
  }));
}

function parseBestPrice(outcomePrices) {
  if (!outcomePrices) return null;
  try {
    const prices = JSON.parse(outcomePrices);
    if (Array.isArray(prices) && prices.length > 0) {
      return parseFloat(prices[0]);
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function formatEventData(events) {
  return events.map((e) => ({
    title: e.title || '',
    slug: e.slug || '',
    description: e.description || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    active: e.active ?? true,
    closed: e.closed ?? false,
    liquidity: parseFloat(e.liquidity || 0),
    volume: parseFloat(e.volume || 0),
    markets: (e.markets || []).length,
    marketsData: e.markets || [],
  }));
}
