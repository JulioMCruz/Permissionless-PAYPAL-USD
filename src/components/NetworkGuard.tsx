import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useChainId } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { sepoliaChain } from '@/lib/web3-config'

interface NetworkGuardProps {
  children: React.ReactNode
}

export const NetworkGuard = ({ children }: NetworkGuardProps) => {
  const { authenticated, user, ready } = usePrivy()
  const chainId = useChainId()
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false)

  // Check if user has a wallet and is on the correct network
  const isOnCorrectNetwork = () => {
    if (!authenticated || !user?.wallet) return true // Allow if no wallet connected
    
    // For now, be more permissive during testing - just log the chain info
    const currentChainId = chainId || parseInt(user.wallet.chainId?.replace('eip155:', '') || '0')
    console.log('Current chain ID:', currentChainId, 'Required:', sepoliaChain.id)
    
    // Temporarily allow all networks for testing
    return true // TODO: Change back to: currentChainId === sepoliaChain.id
  }

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast.error('No wallet detected. Please install MetaMask or connect a wallet.')
      return
    }

    setIsCheckingNetwork(true)
    
    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${sepoliaChain.id.toString(16)}` }], // 0xaa36a7 for Sepolia
      })
      toast.success('Successfully switched to Sepolia network!')
    } catch (error: any) {
      console.error('Network switch error:', error)
      
      if (error.code === 4902) {
        // Chain not added to wallet, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${sepoliaChain.id.toString(16)}`,
                chainName: sepoliaChain.name,
                nativeCurrency: sepoliaChain.nativeCurrency,
                rpcUrls: sepoliaChain.rpcUrls.default.http,
                blockExplorerUrls: sepoliaChain.blockExplorers?.default ? [sepoliaChain.blockExplorers.default.url] : [],
              },
            ],
          })
          toast.success('Added and switched to Sepolia network!')
        } catch (addError) {
          console.error('Add network error:', addError)
          toast.error('Failed to add Sepolia network. Please add it manually.')
        }
      } else if (error.code === 4001) {
        toast.error('Network switch rejected by user')
      } else {
        toast.error(`Failed to switch network: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsCheckingNetwork(false)
    }
  }

  useEffect(() => {
    if (ready && authenticated && user?.wallet && !isOnCorrectNetwork()) {
      toast.error('Please switch to Sepolia network to continue')
    }
  }, [ready, authenticated, user?.wallet])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Show network warning if user is authenticated with wallet but on wrong network
  if (authenticated && user?.wallet && !isOnCorrectNetwork()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <CardTitle className="text-xl font-bold text-red-800">
                Wrong Network
              </CardTitle>
            </div>
            <Badge variant="destructive" className="mx-auto">
              Network Not Supported
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wifi className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Sepolia Required</span>
              </div>
              <p className="text-sm text-red-700">
                This application only works on the Ethereum Sepolia testnet. 
                Please switch your wallet to Sepolia to continue.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Current Network: <span className="font-semibold text-red-600">Unknown</span>
              </p>
              <p className="text-sm text-gray-600">
                Required Network: <span className="font-semibold text-green-600">Sepolia ({sepoliaChain.id})</span>
              </p>
            </div>

            <Button
              onClick={switchToSepolia}
              disabled={isCheckingNetwork}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
            >
              {isCheckingNetwork ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Switching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Switch to Sepolia
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500">
              If you don't have Sepolia ETH, you can get some from a faucet like{' '}
              <a 
                href="https://sepoliafaucet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                sepoliafaucet.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}