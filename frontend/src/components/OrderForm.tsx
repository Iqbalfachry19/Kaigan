"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "../hooks/useAnchorProvider";
import { getProgram, Side } from "../lib/anchor";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";

interface OrderFormProps {
  marketId: number;
  onOrderPlaced: () => void;
}

export function OrderForm({ marketId, onOrderPlaced }: OrderFormProps) {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const [loading, setLoading] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("0.00");

  // Calculate total when price or quantity changes
  useEffect(() => {
    if (price && quantity) {
      const totalValue = parseFloat(price) * parseFloat(quantity);
      setTotal(totalValue.toFixed(2));
    } else {
      setTotal("0.00");
    }
  }, [price, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (orderType === "limit" && !price) {
      toast.error("Please enter a price for limit orders");
      return;
    }

    if (!quantity) {
      toast.error("Please enter quantity");
      return;
    }

    const toastId = toast.loading("Placing order...");

    try {
      setLoading(true);
      const program = getProgram(provider);
      const orderId = Math.floor(Math.random() * 1000000); // Use random ID to avoid conflicts

      const orderPrice =
        orderType === "market"
          ? 239100000 // 239.10 USDC in smallest unit (6 decimals)
          : Math.floor(parseFloat(price) * 1000000); // Convert to smallest unit
      const orderQuantity = Math.floor(parseFloat(quantity) * 1000000); // Convert to smallest unit

      const tx = await program.placeOrder(
        orderId,
        side === "buy" ? Side.Buy : Side.Sell,
        orderPrice,
        orderQuantity
      );

      console.log("Order placed successfully! Tx:", tx);
      toast.success(`Order placed successfully!`, { id: toastId });
      setPrice("");
      setQuantity("");
      setTotal("0.00");
      onOrderPlaced();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        `Failed to place order: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Order Type Tabs - Improved Style */}
      <div className="relative">
        <div className="flex bg-gray-700 rounded-lg p-1 border border-gray-600">
          <button
            onClick={() => setOrderType("limit")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 relative ${
              orderType === "limit"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-600"
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 relative ${
              orderType === "market"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-600"
            }`}
          >
            Market
          </button>
        </div>
        {/* Active tab indicator */}
        <div
          className={`absolute bottom-1 left-1 h-1 bg-purple-400 rounded-full transition-all duration-200 ${
            orderType === "market"
              ? "translate-x-full w-[calc(50%-0.5rem)]"
              : "w-[calc(50%-0.5rem)]"
          }`}
        />
      </div>

      {/* Side Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSide("buy")}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            side === "buy"
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`py-3 px-4 rounded-lg font-semibold transition-all ${
            side === "sell"
              ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Price Input (only for limit orders) */}
      {orderType === "limit" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price (USDC)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25.00"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantity (SOL)
        </label>
        <input
          type="number"
          step="0.001"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="1.000"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          required
        />
      </div>

      {/* Total Display */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-white font-semibold text-lg">${total}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !publicKey}
        className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg ${
          side === "buy"
            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-xl"
            : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            Placing Order...
          </div>
        ) : (
          `Place ${side.toUpperCase()} Order`
        )}
      </button>

      {/* Market Info */}
      <div className="text-xs text-gray-500 text-center">
        {orderType === "market" &&
          "Market orders execute at best available price"}
        {orderType === "limit" &&
          "Limit orders execute at specified price or better"}
      </div>
    </div>
  );
}
