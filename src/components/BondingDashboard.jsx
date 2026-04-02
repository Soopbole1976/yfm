import { useState } from 'react'
import './BondingDashboard.css'

const BONDS = [
  {
    id: 1,
    asset: 'ETH',
    icon: '⟠',
    bondPrice: 18.42,
    marketPrice: 20.10,
    discount: 8.36,
    vestingDays: 5,
    purchased: '12,400 YFM',
    roi: '8.36%',
  },
  {
    id: 2,
    asset: 'DAI',
    icon: '◈',
    bondPrice: 18.91,
    marketPrice: 20.10,
    discount: 5.92,
    vestingDays: 5,
    purchased: '9,800 YFM',
    roi: '5.92%',
  },
  {
    id: 3,
    asset: 'ETH-YFM LP',
    icon: '⟠◈',
    bondPrice: 17.55,
    marketPrice: 20.10,
    discount: 12.69,
    vestingDays: 5,
    purchased: '31,200 YFM',
    roi: '12.69%',
  },
  {
    id: 4,
    asset: 'USDC',
    icon: '$',
    bondPrice: 19.44,
    marketPrice: 20.10,
    discount: 3.28,
    vestingDays: 5,
    purchased: '6,500 YFM',
    roi: '3.28%',
  },
]

const MY_BONDS = [
  {
    id: 1,
    asset: 'ETH-YFM LP',
    icon: '⟠◈',
    bondedAmount: '0.42 LP',
    claimable: '14.87 YFM',
    pending: '208.3 YFM',
    fullyVested: '2026-04-07',
    progress: 62,
  },
  {
    id: 2,
    asset: 'DAI',
    icon: '◈',
    bondedAmount: '500 DAI',
    claimable: '4.2 YFM',
    pending: '22.1 YFM',
    fullyVested: '2026-04-05',
    progress: 84,
  },
]

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function BondRow({ bond, onBond }) {
  const discountClass = bond.discount > 0 ? 'positive' : 'negative'
  return (
    <tr>
      <td>
        <span className="asset-icon">{bond.icon}</span>
        <span className="asset-name">{bond.asset}</span>
      </td>
      <td>${bond.bondPrice.toFixed(2)}</td>
      <td>${bond.marketPrice.toFixed(2)}</td>
      <td className={discountClass}>
        {bond.discount > 0 ? '+' : ''}{bond.discount.toFixed(2)}%
      </td>
      <td>{bond.vestingDays}d</td>
      <td>{bond.purchased}</td>
      <td>
        <button className="bond-btn" onClick={() => onBond(bond)}>
          Bond
        </button>
      </td>
    </tr>
  )
}

function MyBondRow({ bond, onClaim }) {
  return (
    <tr>
      <td>
        <span className="asset-icon">{bond.icon}</span>
        <span className="asset-name">{bond.asset}</span>
      </td>
      <td>{bond.bondedAmount}</td>
      <td className="positive">{bond.claimable}</td>
      <td>{bond.pending}</td>
      <td>
        <div className="vesting-bar">
          <div className="vesting-fill" style={{ width: `${bond.progress}%` }} />
        </div>
        <div className="vesting-date">{bond.fullyVested}</div>
      </td>
      <td>
        <button
          className="claim-btn"
          disabled={parseFloat(bond.claimable) === 0}
          onClick={() => onClaim(bond)}
        >
          Claim
        </button>
      </td>
    </tr>
  )
}

export default function BondingDashboard() {
  const [notification, setNotification] = useState(null)

  const notify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleBond = (bond) => notify(`Bond initiated for ${bond.asset}`)
  const handleClaim = (bond) => notify(`Claimed ${bond.claimable} for ${bond.asset} bond`)
  const handleClaimAll = () => notify('Claimed all vested YFM')

  return (
    <div className="bonding-dashboard">
      {notification && <div className="notification">{notification}</div>}

      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Bonding</h1>
          <p>Purchase YFM at a discount by providing assets to the treasury</p>
        </div>
        <div className="header-badge">
          <span className="dot" />
          Live
        </div>
      </header>

      <div className="stats-grid">
        <StatCard label="Treasury Value" value="$48,210,430" sub="+2.4% (24h)" />
        <StatCard label="YFM Price" value="$20.10" sub="+5.2% (24h)" />
        <StatCard label="Total Bonded" value="$3,842,100" sub="Last 7 days" />
        <StatCard label="Runway" value="412 days" sub="At current rate" />
      </div>

      <section className="dashboard-section">
        <h2>Available Bonds</h2>
        <div className="table-wrapper">
          <table className="bonds-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Bond Price</th>
                <th>Market Price</th>
                <th>Discount</th>
                <th>Vesting</th>
                <th>Purchased</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {BONDS.map((bond) => (
                <BondRow key={bond.id} bond={bond} onBond={handleBond} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>My Bonds</h2>
          <button className="claim-all-btn" onClick={handleClaimAll}>
            Claim All
          </button>
        </div>
        {MY_BONDS.length === 0 ? (
          <p className="empty-state">No active bonds</p>
        ) : (
          <div className="table-wrapper">
            <table className="bonds-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Bonded</th>
                  <th>Claimable</th>
                  <th>Pending</th>
                  <th>Vesting Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MY_BONDS.map((bond) => (
                  <MyBondRow key={bond.id} bond={bond} onClaim={handleClaim} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
