"use client";

import { useState, useEffect } from "react";
import { WalletButton } from "../components/WalletButton";
import { MarketInitializer } from "../components/MarketInitializer";
import { OrderForm } from "../components/OrderForm";
import { OrderBook } from "../components/OrderBook";
import { PriceChart } from "../components/PriceChart";
import { TradingStats } from "../components/TradingStats";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "../hooks/useAnchorProvider";
import { isMarketInitialized, getMarketData } from "../lib/anchor";

export default function Home() {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const [marketInitialized, setMarketInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCheckingMarket, setIsCheckingMarket] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"orders" | "history" | "balance">(
    "orders"
  );

  const handleOrderPlaced = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleMarketInitialized = () => {
    setIsInitializing(true);
    // Simulate initialization delay for smooth transition
    setTimeout(() => {
      setMarketInitialized(true);
      setIsInitializing(false);
      setRefreshKey((prev) => prev + 1);
    }, 500);
  };

  // Check market initialization status from blockchain
  useEffect(() => {
    const checkMarketStatus = async () => {
      if (!provider || !publicKey) return;

      try {
        setIsCheckingMarket(true);
        console.log("Checking market initialization status...");

        // Check if market is initialized
        const initialized = await isMarketInitialized(provider, 1);
        console.log("Market initialized:", initialized);

        if (initialized) {
          // Fetch market data
          const data = await getMarketData(provider, 1);
          console.log("Market data:", data);
          setMarketData(data);
          setMarketInitialized(true);
        } else {
          setMarketInitialized(false);
          setMarketData(null);
        }
      } catch (error) {
        console.error("Error checking market status:", error);
        setMarketInitialized(false);
        setMarketData(null);
      } finally {
        setIsCheckingMarket(false);
      }
    };

    checkMarketStatus();
  }, [provider, publicKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-700/50 backdrop-blur-xl bg-black/20 shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              {/* Premium Logo Design */}
              <div className="relative group">
                {/* Main Logo Container */}
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-300 via-blue-400 via-purple-400 to-pink-400 opacity-80 animate-pulse"></div>

                  {/* Icon Symbol */}
                  <div className="relative z-10 flex items-center justify-center">
                    {/* Trading Icon */}
                    <svg
                      className="w-7 h-7 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7V3a1 1 0 00-1-1H4a1 1 0 00-1 1v4m9 0H9m0 0V3m0 4v4m0-4h4"
                      />
                    </svg>
                  </div>

                  {/* Inner Glow */}
                  <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl blur-sm"></div>
                </div>

                {/* Outer Glow Effects */}
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-300/20 via-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>

                {/* Shine Effect */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/80 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Enhanced Brand Text */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 via-purple-300 to-pink-300 bg-clip-text tracking-tight drop-shadow-sm">
                  Kaigan
                </h1>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Trading Stats */}
          <TradingStats />

          {/* Loading state during initialization */}
          {isInitializing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Initializing market...</p>
              </div>
            </div>
          )}
          {/* Market Initialization - Only show if NOT initialized */}
          {!marketInitialized && !isInitializing && !isCheckingMarket && (
            <div className="animate-fade-in">
              <MarketInitializer
                onMarketInitialized={handleMarketInitialized}
              />
            </div>
          )}
          {/* Checking market status */}
          {isCheckingMarket && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">
                  Checking market status...
                </p>
              </div>
            </div>
          )}

          {/* Trading Interface - Only show if market IS initialized */}
          {marketInitialized && !isInitializing && !isCheckingMarket && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Left Column - Price Chart (Diperbesar) */}
              <div className="xl:col-span-6 space-y-4">
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <PriceChart />
                </div>
              </div>

              {/* Middle Column - Order Book */}
              <div className="xl:col-span-3 space-y-4">
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  <OrderBook marketId={1} refreshTrigger={refreshKey} />
                </div>
              </div>

              {/* Right Column - Place Order */}
              <div className="xl:col-span-3 space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-slide-up">
                  <OrderForm marketId={1} onOrderPlaced={handleOrderPlaced} />
                </div>
              </div>
            </div>
          )}

          {/* Tabbed Sections - Open Orders, Trade History, Settled Balance */}
          {marketInitialized && !isInitializing && !isCheckingMarket && (
            <div className="mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Column - Open Orders */}
                <div className="xl:col-span-8">
                  <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex bg-gray-700">
                      <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                          activeTab === "orders"
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-600"
                        }`}
                      >
                        Open Orders
                      </button>
                      <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                          activeTab === "history"
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-600"
                        }`}
                      >
                        Trade History
                      </button>
                      <button
                        onClick={() => setActiveTab("balance")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                          activeTab === "balance"
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-600"
                        }`}
                      >
                        Settled Balance
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {/* Open Orders Tab */}
                      {activeTab === "orders" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              Open Orders
                            </h3>
                            <span className="text-sm text-gray-400">
                              3 active orders
                            </span>
                          </div>
                          <div className="space-y-3">
                            {/* Mock open orders */}
                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    B
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Buy SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03845 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  1.5 SOL
                                </div>
                                <div className="text-xs text-green-400">
                                  Filled: 0.5 SOL
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    S
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Sell SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03865 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  2.0 SOL
                                </div>
                                <div className="text-xs text-yellow-400">
                                  Pending
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    B
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Buy SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03832 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  0.8 SOL
                                </div>
                                <div className="text-xs text-blue-400">
                                  Partial: 0.3 SOL
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trade History Tab */}
                      {activeTab === "history" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              Trade History
                            </h3>
                            <span className="text-sm text-gray-400">
                              Last 24h
                            </span>
                          </div>
                          <div className="space-y-3">
                            {/* Mock trade history */}
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    B
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Bought SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03845 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  +0.5 SOL
                                </div>
                                <div className="text-xs text-gray-400">
                                  2 hours ago
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    S
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Sold SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03855 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  -1.2 SOL
                                </div>
                                <div className="text-xs text-gray-400">
                                  4 hours ago
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    B
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    Bought SOL
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    0.03832 USDC
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  +0.8 SOL
                                </div>
                                <div className="text-xs text-gray-400">
                                  6 hours ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Settled Balance Tab */}
                      {activeTab === "balance" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              Settled Balance
                            </h3>
                            <span className="text-sm text-gray-400">
                              Available funds
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">
                                SOL Balance
                              </div>
                              <div className="text-lg font-bold text-white">
                                2.45 SOL
                              </div>
                              <div className="text-xs text-gray-400">
                                ≈ $94.23
                              </div>
                            </div>

                            <div className="p-4 bg-gray-700/50 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">
                                USDC Balance
                              </div>
                              <div className="text-lg font-bold text-white">
                                125.80 USDC
                              </div>
                              <div className="text-xs text-gray-400">
                                $125.80
                              </div>
                            </div>

                            <div className="p-4 bg-gray-700/50 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">
                                Total Value
                              </div>
                              <div className="text-lg font-bold text-white">
                                $220.03
                              </div>
                              <div className="text-xs text-green-400">
                                +12.34%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Asset Info */}
                <div className="xl:col-span-4">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-4">
                      Asset Info
                    </h3>
                    <div className="space-y-4">
                      {/* SOL Section */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              SOL
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              SOL
                            </div>
                            <div className="text-xs text-gray-400">Solana</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">Locked</div>
                            <div className="text-sm font-bold text-white">
                              0
                            </div>
                          </div>
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">
                              Free Balance
                            </div>
                            <div className="text-sm font-bold text-white">
                              0.00
                            </div>
                          </div>
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">
                              Wallet Balance
                            </div>
                            <div className="text-sm font-bold text-white">
                              0
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* USDC Section */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              USDC
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              USDC
                            </div>
                            <div className="text-xs text-gray-400">
                              USD Coin
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">Locked</div>
                            <div className="text-sm font-bold text-white">
                              0
                            </div>
                          </div>
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">
                              Free Balance
                            </div>
                            <div className="text-sm font-bold text-white">
                              0.00
                            </div>
                          </div>
                          <div className="bg-gray-700/50 flex justify-between rounded p-2">
                            <div className="text-xs text-gray-400">
                              Wallet Balance
                            </div>
                            <div className="text-sm font-bold text-white">
                              0
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
