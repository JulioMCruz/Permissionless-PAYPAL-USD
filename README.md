# 🍽️ Restaurant Payment Dashboard with PYUSD

A comprehensive Web3 restaurant bill management system powered by PayPal USD (PYUSD) on Ethereum Sepolia testnet. This application combines modern React frontend with smart contract payment processing for seamless restaurant bill payments.

## 🌟 Features

- **🔐 Web3 Authentication**: Privy-powered wallet connection with email/wallet login
- **💳 PYUSD Payments**: Direct payments using PayPal USD stablecoin (1:1 USD parity)
- **📱 Restaurant Dashboard**: Comprehensive bill tracking and payment management
- **🏪 Multi-Restaurant Support**: Support for multiple restaurant partners
- **⭐ Review & NFT System**: Post-payment reviews with NFT creation
- **💰 Real-time Balance**: Live PYUSD balance display and transaction monitoring
- **🔒 Security**: Smart contract-based payments with platform fee collection

## 🏗️ Architecture Overview

### Frontend Architecture

```
src/
├── components/                 # React components
│   ├── Header.tsx             # Auth & balance display
│   ├── PaymentModal.tsx       # PYUSD payment interface
│   ├── RestaurantDashboard.tsx # Main dashboard
│   ├── NetworkGuard.tsx       # Sepolia network enforcement
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── usePYUSD.ts           # Custom PYUSD operations hook
├── lib/
│   ├── pyusd-config.ts       # PYUSD token configuration
│   ├── erc20-abi.ts          # Standard ERC20 ABI
│   ├── web3-config.ts        # Web3 & network configuration
│   └── PaymentProcessor-abi.ts # Smart contract ABI
├── providers/
│   └── Web3Provider.tsx      # Privy + Wagmi providers
└── pages/
    ├── Index.tsx             # Main dashboard page
    ├── ReviewPage.tsx        # Post-payment review page
    └── NotFound.tsx          # 404 page
```

### Smart Contract Architecture

```
smartcontract/
├── contracts/
│   ├── PaymentProcessor.sol   # Main payment processing contract
│   └── test/MockERC20.sol    # Test token for development
├── scripts/
│   ├── deploy.js             # Sepolia deployment script
│   ├── register-restaurants.js # Restaurant registration
│   └── export-abi.js         # ABI export for frontend
├── test/
│   └── PaymentProcessor.test.js # Comprehensive test suite
└── hardhat.config.js         # Hardhat configuration
```

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Web3**: Privy (auth) + Wagmi (Ethereum) + Viem (low-level)
- **State**: React hooks + TanStack Query
- **Routing**: React Router DOM
- **Notifications**: Sonner toast library

### Smart Contract
- **Framework**: Hardhat + OpenZeppelin
- **Language**: Solidity ^0.8.24
- **Network**: Ethereum Sepolia Testnet
- **Token**: PYUSD (PayPal USD) - `0xf290590D47c81820427A108Ce6363607a03Aaf1b`

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Lovable (frontend) + Hardhat (contracts)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- A wallet with Sepolia ETH for gas fees
- PYUSD tokens on Sepolia for testing

### 1. Clone & Install

```bash
git clone <repository-url>
cd Permissionless-PAYPAL-USD
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Configure your `.env`:

```env
# Privy Configuration
VITE_PRIVY_APP_ID=your_privy_app_id_here

# Ethereum Sepolia Configuration  
VITE_ETHEREUM_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# PYUSD Token Configuration
VITE_PYUSD_CONTRACT_ADDRESS=0xf290590D47c81820427A108Ce6363607a03Aaf1b

# Environment
VITE_ENVIRONMENT=development
```

### 3. Start Development

```bash
# Start frontend
npm run dev

# In another terminal, compile smart contracts
cd smartcontract
npm install
npm run compile
```

## 💳 Smart Contract Integration

### PaymentProcessor Contract

The main smart contract handles all payment processing and restaurant management:

**Contract Address** (Sepolia): `0x...` *(Deploy using instructions below)*

#### Key Functions

```solidity
// Process a restaurant bill payment
function processPayment(
    address restaurant,
    uint256 amount, 
    string calldata billDetails
) external;

// Register a new restaurant (owner only)
function registerRestaurant(
    address restaurant,
    string calldata name
) external onlyOwner;

// Get payment history
function getPayment(uint256 billId) external view returns (Payment memory);
```

#### Contract Features

- **✅ PYUSD Integration**: Direct integration with PayPal USD token
- **✅ Platform Fees**: Configurable fee structure (default 2.5%, max 10%)
- **✅ Restaurant Management**: Registration and activation system
- **✅ Payment History**: Complete transaction and customer tracking
- **✅ Security**: ReentrancyGuard, Pausable, Ownable access controls
- **✅ Emergency Functions**: Owner-controlled pause and withdrawal

### Smart Contract Deployment

```bash
cd smartcontract

# Setup environment
cp .env.example .env
# Edit .env with your deployment configuration

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan
npm run verify

# Register restaurants
npm run register:restaurants
```

## 🔐 PYUSD Token Details

- **Contract Address**: `0xf290590D47c81820427A108Ce6363607a03Aaf1b`
- **Symbol**: PYUSD
- **Decimals**: 6
- **Network**: Ethereum Sepolia Testnet
- **Parity**: 1:1 USD stablecoin

### Getting PYUSD for Testing

1. **Faucets**: Check for PYUSD testnet faucets
2. **DEX**: Use Sepolia DEX platforms if available
3. **Manual**: Transfer from another Sepolia wallet with PYUSD

## 🌐 Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: Use Infura, Alchemy, or public RPC
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com (for ETH gas)

### Network Enforcement
The application enforces Sepolia-only usage:
- Automatic network detection
- Network switching prompts
- Blocking for unsupported networks

## 🎯 User Flow

1. **🔗 Connect Wallet**: Use Privy to connect wallet or login with email
2. **🌐 Network Check**: App ensures user is on Sepolia network
3. **💰 Check Balance**: View PYUSD balance in header
4. **🧾 View Bills**: Browse pending restaurant bills
5. **💳 Pay with PYUSD**: One-click payments using smart contract
6. **📝 Review & NFT**: Write reviews and mint NFTs post-payment
7. **📊 Track History**: View payment history and favorite restaurants

## 🛡️ Security Features

### Frontend Security
- Environment variable validation
- Network enforcement (Sepolia only)
- Input sanitization and validation
- Secure wallet connection via Privy
- Real-time balance and allowance checking

### Smart Contract Security  
- **OpenZeppelin Standards**: Built on battle-tested contracts
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only administrative functions
- **Pausable**: Emergency stop functionality
- **Fee Limits**: Maximum platform fee cap (10%)
- **Emergency Withdrawal**: Owner recovery functions

## 🧪 Development & Testing

### Frontend Testing
```bash
npm run lint        # ESLint checking
npm run typecheck   # TypeScript validation
npm run build       # Production build test
```

### Smart Contract Testing
```bash
cd smartcontract
npm test           # Run comprehensive test suite
npm run coverage   # Test coverage analysis
```

### Local Development
```bash
# Start local Hardhat network
cd smartcontract
npm run node

# Deploy to local network
npm run deploy:localhost
```

## 📊 Project Statistics

- **Smart Contract Lines**: ~300 lines of Solidity
- **Frontend Components**: 15+ React components
- **Test Coverage**: 90%+ smart contract coverage
- **Security Features**: 5+ layers of protection
- **Supported Features**: Payments, Reviews, NFTs, Restaurant Management

## 🚀 Deployment

### Frontend Deployment (Lovable)
1. Visit [Lovable Project](https://lovable.dev/projects/54873fce-eaf2-4217-97da-4883696810e0)
2. Click Share → Publish
3. Configure custom domain if needed

### Smart Contract Deployment (Sepolia)
```bash
cd smartcontract
npm run deploy:sepolia
npm run verify
npm run register:restaurants
```

## 📝 Configuration Files

### Key Configuration Files
- **Frontend**: `.env`, `vite.config.ts`, `tailwind.config.ts`
- **Smart Contract**: `.env`, `hardhat.config.js`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`
- **Package**: `package.json` (root and smartcontract)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

- **Documentation**: Check `/smartcontract/DEPLOYMENT.md` for detailed guides
- **PYUSD Setup**: See `PYUSD_SETUP.md` for token configuration
- **Issues**: Report bugs via GitHub issues
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan**: https://sepolia.etherscan.io

## 🎉 Acknowledgments

- **PayPal**: For PYUSD stablecoin innovation
- **Privy**: For seamless Web3 authentication
- **OpenZeppelin**: For secure smart contract standards
- **Ethereum**: For decentralized infrastructure
- **Lovable**: For rapid frontend development platform

---

**🔥 Ready to revolutionize restaurant payments with Web3 and PYUSD!** 🚀