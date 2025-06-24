import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChefHat, Wallet, LogOut, User, DollarSign } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { usePYUSD } from '@/hooks/usePYUSD'

export const Header = () => {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { isConnected } = useAccount()
  const { formattedBalance, isBalanceLoading } = usePYUSD()

  const handleAuth = () => {
    if (authenticated) {
      logout()
    } else {
      login()
    }
  }

  const getUserDisplayName = () => {
    if (user?.email?.address) {
      return user.email.address.split('@')[0]
    }
    if (user?.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    }
    return 'User'
  }

  const getUserInitials = () => {
    const displayName = getUserDisplayName()
    return displayName.slice(0, 2).toUpperCase()
  }

  if (!ready) {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Silvia's Restaurant Dashboard
              </h1>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Silvia's Restaurant Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {authenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {getUserDisplayName()}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Connected</span>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-8" />

                {user?.wallet && (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Wallet className="h-3 w-3" />
                      Sepolia
                    </Badge>
                    
                    {isConnected && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <DollarSign className="h-3 w-3" />
                        {isBalanceLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                        ) : (
                          `${formattedBalance} PYUSD`
                        )}
                      </Badge>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuth}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAuth}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold flex items-center gap-2 shadow-lg"
              >
                <User className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}