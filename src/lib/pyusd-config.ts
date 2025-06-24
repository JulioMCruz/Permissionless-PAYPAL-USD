import { Address } from 'viem'

// PYUSD Token Configuration for Sepolia Testnet
export const PYUSD_CONFIG = {
  // Contract address for PYUSD on Sepolia
  address: '0xf290590D47c81820427A108Ce6363607a03Aaf1b' as Address,
  symbol: 'PYUSD',
  name: 'PayPal USD',
  decimals: 6, // PYUSD uses 6 decimal places
  image: 'https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png',
} as const

// Helper functions for PYUSD
export const formatPYUSD = (amount: bigint): string => {
  const divisor = BigInt(10 ** PYUSD_CONFIG.decimals)
  const formatted = Number(amount) / Number(divisor)
  return formatted.toFixed(2)
}

export const parsePYUSD = (amount: string): bigint => {
  const multiplier = BigInt(10 ** PYUSD_CONFIG.decimals)
  const parsed = parseFloat(amount)
  return BigInt(Math.floor(parsed * Number(multiplier)))
}

// Convert USD amounts to PYUSD (1:1 parity)
export const usdToPYUSD = (usdAmount: number): bigint => {
  return parsePYUSD(usdAmount.toString())
}