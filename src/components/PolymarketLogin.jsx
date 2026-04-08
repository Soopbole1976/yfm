import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import './PolymarketLogin.css'

export default function PolymarketLogin() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="polymarket-login connected">
        <div className="wallet-info">
          <div className="status-badge">
            <span className="status-dot" />
            Connected to Polygon
          </div>
          <p className="wallet-address">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <div className="login-actions">
          <button className="btn btn-primary" onClick={() => open()}>
            Account
          </button>
          <button className="btn btn-secondary" onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="polymarket-login">
      <div className="login-header">
        <h1>Polymarket</h1>
        <p>Connect your wallet to get started</p>
      </div>
      <button className="btn btn-connect" onClick={() => open()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M22 10H2" />
          <path d="M6 14h.01" />
        </svg>
        Connect Wallet
      </button>
      <p className="login-hint">
        Use WalletConnect to link your Polygon wallet
      </p>
    </div>
  )
}
