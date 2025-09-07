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

## 📁 Project Structure
