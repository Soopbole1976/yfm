import { useAppKitAccount } from '@reown/appkit/react'
import PolymarketLogin from './components/PolymarketLogin'
import './App.css'

function App() {
  const { isConnected, address } = useAppKitAccount()

  return (
    <div className="app">
      <PolymarketLogin />
      {isConnected && (
        <div className="dashboard">
          <h2>Welcome to Polymarket</h2>
          <p>Wallet <code>{address?.slice(0, 6)}...{address?.slice(-4)}</code> connected on Polygon</p>
        </div>
      )}
    </div>
  )
}

export default App
