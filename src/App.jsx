import { useState } from 'react'
import BondingCurveChart from './components/BondingCurveChart'
import BuySellPanel from './components/BuySellPanel'
import PolymarketPanel from './components/PolymarketPanel'
import { INITIAL_SUPPLY, priceAtSupply } from './bondingMath'
import './App.css'

const MAX_SUPPLY = 50000

export default function App() {
  const [supply, setSupply] = useState(INITIAL_SUPPLY)
  const [trades, setTrades] = useState([])

  function handleTrade(type, amount) {
    setSupply(prev => {
      const next = type === 'buy' ? prev + amount : Math.max(0, prev - amount)
      const price = priceAtSupply(next)
      setTrades(t => [
        { type, amount, price: price.toFixed(6), time: new Date().toLocaleTimeString() },
        ...t.slice(0, 9)
      ])
      return next
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Bonding Dashboard</h1>
          <span className="header-badge">Polymarket</span>
        </div>
        <div className="header-right">
          <span className="live-dot" />
          <span className="live-label">Live</span>
        </div>
      </header>

      <main className="dashboard">
        <div className="col col-left">
          <BondingCurveChart supply={supply} maxSupply={MAX_SUPPLY} />
          <BuySellPanel supply={supply} onTrade={handleTrade} />
        </div>

        <div className="col col-right">
          <PolymarketPanel />

          {trades.length > 0 && (
            <div className="card trade-history">
              <h2>Trade History</h2>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Price</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={i}>
                      <td className={t.type === 'buy' ? 'positive' : 'negative'}>
                        {t.type.toUpperCase()}
                      </td>
                      <td>{t.amount.toLocaleString()}</td>
                      <td>{t.price} ETH</td>
                      <td>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
