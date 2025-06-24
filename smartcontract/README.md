# PaymentProcessor Smart Contract

A comprehensive smart contract solution for processing restaurant bill payments using PYUSD (PayPal USD) on Ethereum Sepolia testnet.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Compile contracts**:
   ```bash
   npm run compile
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Deploy to Sepolia**:
   ```bash
   npm run deploy:sepolia
   ```

## 📋 Available Scripts

- `npm run compile` - Compile smart contracts
- `npm test` - Run contract tests
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run register:restaurants` - Register sample restaurants
- `npm run verify` - Verify contract on Etherscan
- `npm run export:abi` - Export ABI for frontend integration
- `npm run clean` - Clean build artifacts
- `npm run node` - Start local Hardhat network

## 🏗️ Contract Architecture

### PaymentProcessor.sol

Main contract that handles:

- **Payment Processing**: Accept PYUSD payments for restaurant bills
- **Restaurant Management**: Register and manage restaurant wallets
- **Fee Collection**: Configurable platform fees (default 2.5%)
- **Payment History**: Track all transactions and customer records
- **Access Control**: Owner-only administrative functions
- **Security Features**: ReentrancyGuard, Pausable, emergency controls

### Key Functions

```solidity
// Process a payment
function processPayment(
    address restaurant,
    uint256 amount,
    string calldata billDetails
) external;

// Register a new restaurant
function registerRestaurant(
    address restaurant,
    string calldata name
) external onlyOwner;

// Get payment details
function getPayment(uint256 billId) external view returns (Payment memory);
```

## 🔧 Configuration

### Environment Variables

```env
# Deployment
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Configuration
PYUSD_TOKEN_ADDRESS=0xf290590D47c81820427A108Ce6363607a03Aaf1b
FEE_RECIPIENT_ADDRESS=your_fee_recipient_address
```

### Network Configuration

The contract is configured for Ethereum Sepolia testnet:

- **Chain ID**: 11155111
- **PYUSD Contract**: 0xf290590D47c81820427A108Ce6363607a03Aaf1b
- **Gas Price**: Automatic (EIP-1559)

## 🧪 Testing

The test suite includes comprehensive tests for:

- Contract deployment and initialization
- Restaurant registration and management
- Payment processing and fee calculation
- Access control and security features
- Edge cases and error conditions

Run tests with:
```bash
npm test
```

## 📊 Contract Features

### ✅ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Access control for admin functions
- **Fee Limits**: Platform fee capped at 10%

### ✅ Payment Features

- **PYUSD Integration**: Direct integration with PayPal USD
- **Automatic Fee Calculation**: Configurable platform fees
- **Payment History**: Complete transaction records
- **Bill Details Storage**: JSON bill information on-chain

### ✅ Restaurant Management

- **Registration System**: Owner-controlled restaurant onboarding
- **Active Status**: Enable/disable restaurants
- **Payment Tracking**: Per-restaurant payment history
- **Withdrawal Management**: Direct payments to restaurant wallets

## 📈 Gas Optimization

The contract is optimized for gas efficiency:

- **Immutable Variables**: PYUSD token address
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple operations in single transaction
- **Event Logging**: Efficient off-chain data access

## 🔐 Security Considerations

1. **Private Key Management**: Never commit private keys
2. **Access Control**: Only owner can register restaurants
3. **Fee Validation**: Platform fees are capped at 10%
4. **Emergency Controls**: Pause and emergency withdrawal functions
5. **Input Validation**: All inputs are validated before processing

## 📝 Deployment Process

1. **Prerequisites**: Sepolia ETH, Infura account, Etherscan API key
2. **Environment Setup**: Configure .env file
3. **Compilation**: Ensure contracts compile successfully
4. **Testing**: Run full test suite
5. **Deployment**: Deploy to Sepolia testnet
6. **Verification**: Verify on Etherscan
7. **Restaurant Registration**: Register initial restaurants
8. **Frontend Integration**: Update frontend with contract address

## 📊 Integration Guide

After deployment, integrate with your frontend:

1. **Import ABI**: Use exported ABI from `src/lib/PaymentProcessor-abi.ts`
2. **Contract Address**: Get from `deployment-info.json`
3. **Network Configuration**: Ensure frontend uses Sepolia
4. **PYUSD Approval**: Users must approve PYUSD spending

Example frontend integration:

```typescript
import { PAYMENT_PROCESSOR_ABI } from '@/lib/PaymentProcessor-abi';

const contract = new ethers.Contract(
  contractAddress,
  PAYMENT_PROCESSOR_ABI,
  signer
);

await contract.processPayment(
  restaurantAddress,
  amount,
  JSON.stringify(billDetails)
);
```

## 🐛 Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Ensure wallet has Sepolia ETH for gas
2. **"Restaurant not active"**: Restaurant must be registered first
3. **"Transfer failed"**: Check PYUSD balance and approval
4. **"Fee too high"**: Platform fee cannot exceed 10%

### Getting Help

- Check [Hardhat Documentation](https://hardhat.org/)
- Get Sepolia ETH from [faucets](https://sepoliafaucet.com/)
- View transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/)

## 📄 License

MIT License - see LICENSE file for details.