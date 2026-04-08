import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon } from '@reown/appkit/networks'

// Get a project ID at https://cloud.reown.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const networks = [polygon]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
