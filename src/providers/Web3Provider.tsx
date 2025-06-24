import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { sepoliaChain } from '@/lib/web3-config'

const wagmiConfig = createConfig({
  chains: [sepoliaChain],
  transports: {
    [sepoliaChain.id]: http(),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID

  if (!privyAppId) {
    console.error('VITE_PRIVY_APP_ID is not set')
    return <div>Configuration Error: Missing Privy App ID</div>
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#ea580c',
        },
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: sepoliaChain,
        supportedChains: [sepoliaChain],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}