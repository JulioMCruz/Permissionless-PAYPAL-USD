# PaymentProcessor Smart Contract Deployment Guide

## Overview

The PaymentProcessor smart contract handles restaurant bill payments using PYUSD on Ethereum Sepolia testnet.

## Contract Features

- ✅ **PYUSD Payments**: Process payments using PayPal USD stablecoin
- ✅ **Restaurant Management**: Register and manage restaurant wallets
- ✅ **Platform Fees**: Configurable fee structure (default 2.5%)
- ✅ **Payment History**: Track all transactions and customer history
- ✅ **Security**: ReentrancyGuard, Pausable, Ownable access controls
- ✅ **Emergency Functions**: Owner-controlled pause and withdrawal features

## Prerequisites

1. **Node.js**: Install Node.js (preferably v18 or v20, not v23 due to Hardhat compatibility)
2. **Wallet**: Have a wallet with Sepolia ETH for deployment
3. **API Keys**: Get Infura and Etherscan API keys
4. **PYUSD**: Ensure PYUSD contract exists on Sepolia at `0xf290590D47c81820427A108Ce6363607a03Aaf1b`

## Setup Instructions

### 1. Environment Configuration

Create `.env` file in the `smartcontract` directory:

```bash
cp .env.example .env
```

Fill in your configuration:

```env
# Deployment Configuration
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract Configuration
PYUSD_TOKEN_ADDRESS=0xf290590D47c81820427A108Ce6363607a03Aaf1b
FEE_RECIPIENT_ADDRESS=your_fee_recipient_address_here

# Gas Configuration
REPORT_GAS=true
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

## Deployment Process

### Step 1: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This will:
- Deploy the PaymentProcessor contract
- Save deployment info to `deployment-info.json`
- Display the contract address and transaction hash

### Step 2: Verify on Etherscan

After deployment, verify the contract:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "0xf290590D47c81820427A108Ce6363607a03Aaf1b" "<FEE_RECIPIENT_ADDRESS>"
```

### Step 3: Register Restaurants

```bash
npm run register:restaurants
```

This will register sample restaurants. Edit `scripts/register-restaurants.js` to add your actual restaurant wallet addresses.

## Contract Functions

### Core Functions

- `processPayment(restaurant, amount, billDetails)` - Process a payment
- `registerRestaurant(address, name)` - Register a new restaurant
- `getPayment(billId)` - Get payment details
- `getCustomerPayments(customer)` - Get customer's payment history

### Admin Functions

- `setPlatformFee(fee)` - Update platform fee (max 10%)
- `setFeeRecipient(address)` - Update fee recipient
- `pause()` / `unpause()` - Emergency controls
- `emergencyWithdraw(token, amount)` - Emergency token recovery

## Integration with Frontend

Update your frontend configuration with the deployed contract address:

```typescript
// In your frontend config
export const PAYMENT_PROCESSOR_CONFIG = {
  address: "0x...", // Deployed contract address from deployment-info.json
  abi: PaymentProcessorABI, // Import the ABI
}
```

## Security Considerations

1. **Private Key Security**: Never commit private keys to version control
2. **Fee Limits**: Platform fee is capped at 10% (1000 basis points)
3. **Access Control**: Only owner can register restaurants and change settings
4. **Reentrancy Protection**: All payment functions are protected
5. **Emergency Controls**: Contract can be paused in emergencies

## Gas Estimates

- Deploy Contract: ~2,500,000 gas
- Register Restaurant: ~100,000 gas  
- Process Payment: ~150,000 gas
- Verify on Etherscan: Free

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Ensure wallet has enough Sepolia ETH
2. **"Restaurant already registered"**: Restaurant address already exists
3. **"Invalid restaurant"**: Restaurant not registered or deactivated
4. **"Transfer failed"**: Customer needs to approve PYUSD spending

### Getting Help

- Check Hardhat docs: https://hardhat.org/
- Sepolia faucet: https://sepoliafaucet.com/
- Etherscan Sepolia: https://sepolia.etherscan.io/

## Contract Addresses

After deployment, important addresses will be saved in `deployment-info.json`:

```json
{
  "contractAddress": "0x...",
  "pyusdTokenAddress": "0xf290590D47c81820427A108Ce6363607a03Aaf1b",
  "feeRecipientAddress": "0x...",
  "network": "sepolia",
  "timestamp": "2024-..."
}
```

Keep this file safe as it contains all deployment information!