"use client";

import { useState } from "react";

interface TradingPair {
  symbol: string;
  baseToken: string;
  quoteToken: string;
  currentPrice: number;
  usdPrice: number;
  priceChange24h: number;
  volume24h: number;
  volume24hUSD: number;
  high24h: number;
  low24h: number;
  activeOrders: number;
  totalLiquidity: string;
}

const TRADING_PAIRS: TradingPair[] = [
  {
    symbol: "SOL/USDC",
    baseToken: "SOL",
    quoteToken: "USDC",
    currentPrice: 239.1,
    usdPrice: 239.1,
    priceChange24h: 0.44,
    volume24h: 497310,
    volume24hUSD: 64782.6,
    high24h: 239.1,
    low24h: 239.1,
    activeOrders: 42,
    totalLiquidity: "1.2M",
  },
  {
    symbol: "BTC/USDC",
    baseToken: "BTC",
    quoteToken: "USDC",
    currentPrice: 43250.75,
    usdPrice: 43250.75,
    priceChange24h: 2.15,
    volume24h: 1250000,
    volume24hUSD: 1250000,
    high24h: 44500.0,
    low24h: 42500.5,
    activeOrders: 156,
    totalLiquidity: "25.8M",
  },
  {
    symbol: "ETH/USDC",
    baseToken: "ETH",
    quoteToken: "USDC",
    currentPrice: 2650.3,
    usdPrice: 2650.3,
    priceChange24h: -1.25,
    volume24h: 890000,
    volume24hUSD: 890000,
    high24h: 2720.0,
    low24h: 2580.75,
    activeOrders: 98,
    totalLiquidity: "15.3M",
  },
  {
    symbol: "RAY/USDC",
    baseToken: "RAY",
    quoteToken: "USDC",
    currentPrice: 0.285,
    usdPrice: 0.285,
    priceChange24h: 5.67,
    volume24h: 125000,
    volume24hUSD: 125000,
    high24h: 0.295,
    low24h: 0.272,
    activeOrders: 23,
    totalLiquidity: "850K",
  },
];

export function TradingStats() {
  const [selectedPair, setSelectedPair] = useState<string>("SOL/USDC");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentStats =
    TRADING_PAIRS.find((pair) => pair.symbol === selectedPair) ||
    TRADING_PAIRS[0];

  const handlePairSelect = (pair: TradingPair) => {
    setSelectedPair(pair.symbol);
    setIsDropdownOpen(false);
    // In a real app, you would also update the chart and order book data here
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-3 max-w-8xl mx-auto">
      <div className="flex items-center justify-between gap-6">
        {/* Trading Pair Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
          >
            <span>{currentStats.symbol}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
              {TRADING_PAIRS.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => handlePairSelect(pair)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedPair === pair.symbol
                      ? "bg-purple-600 text-white"
                      : "text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pair.symbol}</span>
                    <span
                      className={`text-xs ${
                        pair.priceChange24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {pair.priceChange24h >= 0 ? "+" : ""}
                      {pair.priceChange24h}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    $
                    {pair.usdPrice.toFixed(
                      pair.baseToken === "SOL" || pair.baseToken === "RAY"
                        ? 2
                        : 0
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">
              Price ({currentStats.quoteToken})
            </div>
            <div className="text-sm font-bold text-white">
              {currentStats.currentPrice.toFixed(
                currentStats.baseToken === "SOL" ||
                  currentStats.baseToken === "RAY"
                  ? 5
                  : 2
              )}
            </div>
            <div className="text-xs text-gray-300">
              ${currentStats.usdPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 24h Change */}
        <div className="text-right">
          <div className="text-xs text-gray-400">24h Change</div>
          <div
            className={`text-sm font-bold ${
              currentStats.priceChange24h >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {currentStats.priceChange24h >= 0 ? "+" : ""}
            {currentStats.priceChange24h}%
          </div>
        </div>

        {/* 24h Volume */}
        <div className="text-right">
          <div className="text-xs text-gray-400">
            24h Volume ({currentStats.quoteToken})
          </div>
          <div className="text-sm font-bold text-white">
            {currentStats.volume24h.toLocaleString()}
          </div>
          <div className="text-xs text-gray-300">
            ${currentStats.volume24hUSD.toLocaleString()}
          </div>
        </div>

        {/* 24h High */}
        <div className="text-right">
          <div className="text-xs text-gray-400">24h High</div>
          <div className="text-sm font-bold text-green-400">
            {currentStats.high24h.toFixed(
              currentStats.baseToken === "SOL" ||
                currentStats.baseToken === "RAY"
                ? 5
                : 2
            )}
          </div>
          <div className="text-xs text-gray-300">{currentStats.quoteToken}</div>
        </div>

        {/* 24h Low */}
        <div className="text-right">
          <div className="text-xs text-gray-400">24h Low</div>
          <div className="text-sm font-bold text-red-400">
            {currentStats.low24h.toFixed(
              currentStats.baseToken === "SOL" ||
                currentStats.baseToken === "RAY"
                ? 5
                : 2
            )}
          </div>
          <div className="text-xs text-gray-300">{currentStats.quoteToken}</div>
        </div>

        {/* Market Details */}
        <div className="text-right">
          <div className="text-xs text-gray-400">Market Details</div>
          <div className="text-xs text-gray-300">
            {currentStats.activeOrders} orders • {currentStats.totalLiquidity}{" "}
            liquidity
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
