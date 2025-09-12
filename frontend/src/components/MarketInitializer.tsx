"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "../hooks/useAnchorProvider";
import { getProgram, getMarketPda } from "../lib/anchor";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";

interface MarketInitializerProps {
  onMarketInitialized: () => void;
}

export function MarketInitializer({
  onMarketInitialized,
}: MarketInitializerProps) {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const [loading, setLoading] = useState(false);
  const [marketId, setMarketId] = useState("1");

  const initializeMarket = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!provider) {
      toast.error(
        "Provider not available. Please make sure your wallet is connected."
      );
      return;
    }

    const toastId = toast.loading("Initializing market...");

    try {
      setLoading(true);
      const program = getProgram(provider);

      // For now, use SOL and USDC mint addresses
      const solMint = new PublicKey(
        "So11111111111111111111111111111111111111112"
      );
      const usdcMint = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );

      const tx = await program.initializeMarket(
        parseInt(marketId),
        solMint,
        usdcMint
      );

      toast.success("Market initialized successfully!", { id: toastId });
      onMarketInitialized();
    } catch (error) {
      console.error("Error initializing market:", error);
      toast.error(
        `Failed to initialize market: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Initialize Market
        </h2>
        <p className="text-blue-100 mb-6">
          Set up the trading market to start accepting orders
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Market ID
          </label>
          <input
            type="number"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
            placeholder="1"
          />
        </div>

        <button
          onClick={initializeMarket}
          disabled={loading || !publicKey}
          className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Initializing...
            </div>
          ) : (
            "Initialize Market"
          )}
        </button>
      </div>
    </div>
  );
}
