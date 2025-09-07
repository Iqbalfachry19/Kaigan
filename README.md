# 🚀 Kaigan DEX

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TradingView](https://img.shields.io/badge/TradingView-131B2A?style=for-the-badge&logo=tradingview&logoColor=white)](https://www.tradingview.com/)

> Decentralized Exchange built on Solana with advanced trading features and professional UI

## 📊 Overview

Kaigan DEX is a cutting-edge decentralized exchange built on the Solana blockchain, featuring:

- ⚡ **Lightning-fast trades** on Solana's high-performance network
- 📈 **Professional TradingView charts** with technical indicators
- 🎯 **CLOB (Central Limit Order Book)** for efficient order matching
- 🔐 **Secure wallet integration** with Phantom and other Solana wallets
- 📊 **Real-time market data** and trading statistics
- 🎨 **Modern, responsive UI** built with Next.js and Tailwind CSS

## 🌟 Key Features

### 🚀 Trading Features
- **Limit & Market Orders** - Full order type support
- **Real-time Order Book** - Live bid/ask updates
- **Order History** - Complete trading history tracking
- **Advanced Charts** - TradingView integration with indicators

### 💰 Wallet Integration
- **Phantom Wallet** - Primary Solana wallet support
- **Multi-wallet Support** - Compatible with all Solana wallets
- **Secure Transactions** - Anchor framework integration

### 📊 Analytics & Stats
- **Live Market Data** - Real-time price feeds
- **Trading Statistics** - Volume, liquidity, and performance metrics
- **Portfolio Tracking** - Balance and position monitoring

### 🎨 User Experience
- **Responsive Design** - Works perfectly on all devices
- **Dark Theme** - Professional trading interface
- **Smooth Animations** - Fluid user interactions
- **Intuitive Navigation** - Easy-to-use interface

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Charts**: [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/) - Professional charting library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/) - Elegant toast notifications

### Blockchain
- **Network**: [Solana](https://solana.com/) - High-performance blockchain
- **Framework**: [Anchor](https://www.anchor-lang.com/) - Solana framework for Rust programs
- **Language**: Rust - Smart contract development
- **SDK**: [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) - JavaScript SDK

### Development Tools
- **Language**: TypeScript - Type-safe JavaScript
- **Linting**: ESLint - Code quality enforcement
- **Package Manager**: npm/yarn - Dependency management

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Solana CLI** (for development)
- **Anchor CLI** (for smart contract development)
- **Phantom Wallet** (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaigan-dex
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Install Solana CLI** (if not already installed)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
   ```

4. **Install Anchor CLI**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

### Smart Contract Setup

1. **Navigate to the Anchor project**
   ```bash
   cd programs/clob
   ```

2. **Build the smart contract**
   ```bash
   anchor build
   ```

3. **Deploy to localnet** (for development)
   ```bash
   anchor deploy
   ```

### Running the Application

1. **Start Solana localnet** (in a separate terminal)
   ```bash
   solana-test-validator
   ```

2. **Start the development server**
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)



## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id_here
```

### Smart Contract Configuration

Update `Anchor.toml` for your network:

```toml
[provider]
cluster = "devnet"  # or "mainnet-beta"
wallet = "~/.config/solana/id.json"
```

## 🎯 Usage

### Connecting a Wallet

1. Click the "Select Wallet" button in the header
2. Choose your preferred Solana wallet (Phantom recommended)
3. Approve the connection in your wallet

### Placing Orders

1. Navigate to the "Place Order" section
2. Select order type (Limit or Market)
3. Choose side (Buy or Sell)
4. Enter price (for limit orders) and quantity
5. Click "Place Order" to submit

### Viewing Charts

- Use the interactive TradingView chart in the left panel
- Zoom and pan using mouse controls
- Add technical indicators from the toolbar

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Solana](https://solana.com/) - High-performance blockchain
- [TradingView](https://www.tradingview.com/) - Professional charting
- [Anchor](https://www.anchor-lang.com/) - Solana framework
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

If you have any questions or need help:

- Create an [issue](https://github.com/your-repo/issues) on GitHub
- Join our [Discord](https://discord.gg/your-server) community
- Check the [documentation](https://docs.kaigan-dex.com)

---

**Built with ❤️ on Solana** | **Trade with confidence on Kaigan DEX** 🚀