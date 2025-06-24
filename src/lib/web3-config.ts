import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'

export const sepoliaChain = sepolia

export const wagmiConfig = {
  chains: [sepoliaChain],
  transports: {
    [sepoliaChain.id]: import.meta.env.VITE_ETHEREUM_SEPOLIA_RPC_URL || sepoliaChain.rpcUrls.default.http[0]
  }
}

export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID as string,
  config: {
    appearance: {
      theme: 'light' as const,
      accentColor: '#ea580c',
      logo: undefined,
    },
    loginMethods: ['email', 'wallet'],
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
    },
    defaultChain: sepoliaChain,
    supportedChains: [sepoliaChain],
  }
}