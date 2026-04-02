// Linear bonding curve: price(supply) = BASE + SLOPE * supply
// Reserve (ETH locked) = integral of price from 0 to supply
//   = BASE * supply + 0.5 * SLOPE * supply^2

export const BASE_PRICE = 0.001   // price in ETH when supply = 0
export const SLOPE = 0.000001     // price increase per token minted
export const INITIAL_SUPPLY = 1000

export function priceAtSupply(supply) {
  return BASE_PRICE + SLOPE * supply
}

export function reserveAtSupply(supply) {
  return BASE_PRICE * supply + 0.5 * SLOPE * supply * supply
}

// Cost to buy `amount` tokens when current supply is `supply`
export function buyCost(supply, amount) {
  return reserveAtSupply(supply + amount) - reserveAtSupply(supply)
}

// ETH returned for selling `amount` tokens when current supply is `supply`
export function sellReturn(supply, amount) {
  if (amount > supply) return 0
  return reserveAtSupply(supply) - reserveAtSupply(supply - amount)
}

// Build chart data points along the curve up to maxSupply
export function buildCurveData(maxSupply, points = 100) {
  const step = maxSupply / points
  return Array.from({ length: points + 1 }, (_, i) => {
    const s = i * step
    return { supply: Math.round(s), price: parseFloat(priceAtSupply(s).toFixed(6)) }
  })
}

export function marketCap(supply) {
  return priceAtSupply(supply) * supply
}
