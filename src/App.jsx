import MarketBrowser from './components/MarketBrowser'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-area">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#6366f1" />
            <text x="14" y="19" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">P</text>
          </svg>
          <h1>Polymarket <span className="highlight">Excel</span></h1>
        </div>
        <p className="tagline">Browse prediction markets &middot; Export to spreadsheet</p>
      </header>
      <main>
        <MarketBrowser />
      </main>
      <footer>
        <p>Data from Polymarket Gamma API &middot; Prices are indicative</p>
      </footer>
    </div>
  )
}

export default App
