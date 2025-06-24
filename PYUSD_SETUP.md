# PYUSD Integration Setup

This application uses PayPal USD (PYUSD) as the primary payment method on Ethereum Sepolia testnet.

## PYUSD Token Details

- **Contract Address**: `0xf290590D47c81820427A108Ce6363607a03Aaf1b`
- **Symbol**: PYUSD
- **Decimals**: 6
- **Network**: Ethereum Sepolia Testnet
- **Type**: USD-pegged stablecoin (1:1 parity)

## Getting PYUSD on Sepolia

Since this is a testnet implementation, you'll need test PYUSD tokens:

### Option 1: Use a Faucet (if available)
- Check PayPal or testnet faucet providers for PYUSD test tokens

### Option 2: Add Token to Wallet
1. Connect your wallet to Sepolia network
2. Add custom token with address: `0xf290590D47c81820427A108Ce6363607a03Aaf1b`
3. Symbol: PYUSD
4. Decimals: 6

### Option 3: Manual Transfer (if you have PYUSD)
- Transfer PYUSD from another wallet on Sepolia

## Application Features

### Payment Flow
1. **Connect Wallet**: Use Privy authentication to connect your wallet
2. **Check Balance**: View your PYUSD balance in the header
3. **Pay Bills**: Use PYUSD to pay restaurant bills instantly
4. **Review & NFT**: After payment, write reviews and mint NFTs

### Smart Contract Interactions
- **Balance Checking**: Real-time PYUSD balance display
- **Transfers**: Direct PYUSD payments to restaurant wallets
- **Transaction Monitoring**: Live transaction status updates

### Network Requirements
- **Required Network**: Ethereum Sepolia
- **Automatic Switching**: App prompts to switch if on wrong network
- **Gas Fees**: You'll need Sepolia ETH for transaction fees

## Faucets for Testing

### Sepolia ETH (for gas)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)

### PYUSD Test Tokens
- Contact PayPal for testnet PYUSD
- Use DeFi platforms that might have PYUSD on testnet

## Security Note

This is a testnet application. Never use real funds or mainnet configurations. All transactions are on Sepolia testnet only.