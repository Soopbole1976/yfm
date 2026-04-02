import { useState } from 'react'
import { buyCost, sellReturn, priceAtSupply, marketCap, reserveAtSupply } from '../bondingMath'

export default function BuySellPanel({ supply, onTrade }) {
  const [tab, setTab] = useState('buy')
  const [amount, setAmount] = useState(100)

  const currentPrice = priceAtSupply(supply)
  const cost = tab === 'buy'
    ? buyCost(supply, amount)
    : sellReturn(supply, amount)
  const newSupply = tab === 'buy' ? supply + amount : supply - amount
  const newPrice = priceAtSupply(Math.max(0, newSupply))
  const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100
  const cap = marketCap(supply)
  const reserve = reserveAtSupply(supply)

  function handleTrade() {
    if (tab === 'sell' && amount > supply) return
    onTrade(tab, amount)
  }

  return (
    <div className="card trade-card">
      <h2>Trade</h2>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">Current Price</span>
          <span className="stat-value">{currentPrice.toFixed(6)} ETH</span>
        </div>
        <div className="stat">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">{cap.toFixed(4)} ETH</span>
        </div>
        <div className="stat">
          <span className="stat-label">Reserve</span>
          <span className="stat-value">{reserve.toFixed(4)} ETH</span>
        </div>
        <div className="stat">
          <span className="stat-label">Supply</span>
          <span className="stat-value">{supply.toLocaleString()}</span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'buy' ? 'active buy' : ''}`}
          onClick={() => setTab('buy')}
        >
          Buy
        </button>
        <button
          className={`tab ${tab === 'sell' ? 'active sell' : ''}`}
          onClick={() => setTab('sell')}
        >
          Sell
        </button>
      </div>

      <div className="trade-inputs">
        <label>
          Amount of tokens
          <input
            type="number"
            min={1}
            max={tab === 'sell' ? supply : 100000}
            value={amount}
            onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </label>

        <div className="trade-preview">
          <div className="preview-row">
            <span>{tab === 'buy' ? 'Cost' : 'You receive'}</span>
            <span className="highlight">{cost.toFixed(6)} ETH</span>
          </div>
          <div className="preview-row">
            <span>New price</span>
            <span>{newPrice.toFixed(6)} ETH</span>
          </div>
          <div className="preview-row">
            <span>Price impact</span>
            <span className={priceImpact >= 0 ? 'positive' : 'negative'}>
              {priceImpact >= 0 ? '+' : ''}{priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>

        <button
          className={`trade-btn ${tab}`}
          onClick={handleTrade}
          disabled={tab === 'sell' && amount > supply}
        >
          {tab === 'buy' ? `Buy ${amount} tokens` : `Sell ${amount} tokens`}
        </button>
        {tab === 'sell' && amount > supply && (
          <p className="error">Insufficient supply to sell</p>
        )}
      </div>
    </div>
  )
}
