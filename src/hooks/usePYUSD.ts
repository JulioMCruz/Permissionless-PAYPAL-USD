import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { PYUSD_CONFIG, formatPYUSD, usdToPYUSD } from '@/lib/pyusd-config'
import { ERC20_ABI } from '@/lib/erc20-abi'
import { toast } from 'sonner'

export const usePYUSD = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [isTransactionPending, setIsTransactionPending] = useState(false)

  // Read PYUSD balance
  const { data: balance, refetch: refetchBalance, isLoading: isBalanceLoading } = useReadContract({
    address: PYUSD_CONFIG.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    setIsTransactionPending(isWritePending || isConfirming)
  }, [isWritePending, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('Payment successful! ✅')
      refetchBalance()
      setIsTransactionPending(false)
    }
  }, [isSuccess, refetchBalance])

  // Transfer PYUSD to a recipient
  const transferPYUSD = async (to: Address, usdAmount: number) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      const amount = usdToPYUSD(usdAmount)
      
      // Check if user has sufficient balance
      const currentBalance = balance as bigint || BigInt(0)
      if (currentBalance < amount) {
        toast.error('Insufficient PYUSD balance')
        return
      }

      await writeContract({
        address: PYUSD_CONFIG.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount],
      })

      toast.loading('Processing payment...', { id: 'payment-toast' })
    } catch (error: any) {
      console.error('Transfer error:', error)
      toast.error(`Payment failed: ${error.shortMessage || error.message}`)
    }
  }

  // Get formatted balance
  const getFormattedBalance = () => {
    if (!balance) return '0.00'
    return formatPYUSD(balance as bigint)
  }

  // Check if user has sufficient balance for amount
  const hasSufficientBalance = (usdAmount: number) => {
    if (!balance) return false
    const required = usdToPYUSD(usdAmount)
    return (balance as bigint) >= required
  }

  return {
    balance,
    formattedBalance: getFormattedBalance(),
    isBalanceLoading,
    transferPYUSD,
    isTransactionPending,
    hasSufficientBalance,
    refetchBalance,
    transactionHash: hash,
  }
}