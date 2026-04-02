import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label
} from 'recharts'
import { buildCurveData, priceAtSupply } from '../bondingMath'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div>Supply: <strong>{payload[0].payload.supply.toLocaleString()}</strong></div>
      <div>Price: <strong>{payload[0].value} ETH</strong></div>
    </div>
  )
}

export default function BondingCurveChart({ supply, maxSupply }) {
  const data = buildCurveData(maxSupply)
  const currentPrice = parseFloat(priceAtSupply(supply).toFixed(6))

  return (
    <div className="card chart-card">
      <h2>Bonding Curve</h2>
      <p className="card-subtitle">Linear curve — price rises as supply increases</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="supply"
            stroke="#666"
            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v}
          >
            <Label value="Token Supply" offset={-10} position="insideBottom" fill="#888" fontSize={12} />
          </XAxis>
          <YAxis stroke="#666" tickFormatter={v => `${v}`} width={70}>
            <Label value="Price (ETH)" angle={-90} position="insideLeft" fill="#888" fontSize={12} offset={10} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={supply}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            label={{ value: `Now: ${currentPrice} ETH`, fill: '#f59e0b', fontSize: 11, position: 'top' }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#curveGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
