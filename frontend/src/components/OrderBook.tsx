"use client";

import { useEffect, useState } from "react";
import { useAnchorProvider } from "../hooks/useAnchorProvider";
import { getProgram, getMarketPda, getOrderPda } from "../lib/anchor";
import { PublicKey } from "@solana/web3.js";

interface Order {
  orderId: number;
  user: PublicKey;
  market: PublicKey;
  side: { buy?: {} } | { sell?: {} };
  price: number;
  quantity: number;
  filledQuantity: number;
  timestamp: number;
  status: { active?: {} } | { filled?: {} } | { cancelled?: {} };
  bump: number;
}

interface OrderBookProps {
  marketId: number;
  refreshTrigger?: number;
}

export function OrderBook({ marketId, refreshTrigger }: OrderBookProps) {
  const provider = useAnchorProvider();
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total amounts
  const totalBuyAmount = buyOrders.reduce(
    (sum, order) => sum + (order.quantity - order.filledQuantity),
    0
  );
  const totalSellAmount = sellOrders.reduce(
    (sum, order) => sum + (order.quantity - order.filledQuantity),
    0
  );

  useEffect(() => {
    if (!provider) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const program = getProgram(provider);
        const marketPda = getMarketPda(marketId);

        console.log("Fetching orders for market:", marketPda.toString());

        // Try a different approach - fetch all program accounts without size filter
        const allAccounts = await provider.connection.getProgramAccounts(
          new PublicKey("E2WSY8KFFKuN75GvEMtZ7tjkJy3bpkBxJB4YWX5jRSp5"), // Program ID
          {
            commitment: "confirmed",
          }
        );

        console.log("Found", allAccounts.length, "total accounts");

        const orders: Order[] = [];

        for (const account of allAccounts) {
          try {
            const data = account.account.data;
            console.log(
              "Account:",
              account.pubkey.toString(),
              "Size:",
              data.length
            );

            // Skip accounts that are too small to be orders
            if (data.length < 100) continue;

            // Check discriminator for Order accounts
            // Order discriminator is [134, 173, 223, 185, 77, 86, 28, 51]
            const discriminator = Array.from(data.slice(0, 8));
            const orderDiscriminator = [134, 173, 223, 185, 77, 86, 28, 51];

            if (
              !discriminator.every((byte, i) => byte === orderDiscriminator[i])
            ) {
              console.log(
                "Not an order account, discriminator:",
                discriminator
              );
              continue;
            }

            console.log("Found order account:", account.pubkey.toString());

            // Parse order data
            const orderId = Number(data.readBigUInt64LE(8));
            const user = new PublicKey(data.slice(16, 48));
            const market = new PublicKey(data.slice(48, 80));

            // Skip if not our market
            if (!market.equals(marketPda)) {
              console.log(
                "Order not for our market:",
                market.toString(),
                "vs",
                marketPda.toString()
              );
              continue;
            }

            // Parse remaining data
            const sideByte = data[80];
            const side = sideByte === 0 ? { buy: {} } : { sell: {} };
            const price = Number(data.readBigUInt64LE(81));
            const quantity = Number(data.readBigUInt64LE(89));
            const filledQuantity = Number(data.readBigUInt64LE(97));
            const timestamp = Number(data.readBigUInt64LE(105));
            const statusByte = data[113];
            let status;
            if (statusByte === 0) status = { active: {} };
            else if (statusByte === 1) status = { filled: {} };
            else status = { cancelled: {} };
            const bump = data[114];

            const order: Order = {
              orderId,
              user,
              market,
              side,
              price,
              quantity,
              filledQuantity,
              timestamp,
              status,
              bump,
            };

            orders.push(order);
          } catch (error) {
            console.error("Error parsing account:", error);
            continue;
          }
        }

        console.log("Parsed", orders.length, "valid orders");

        // Separate buy and sell orders, filter only active ones
        const activeOrders = orders.filter(
          (order) => order.status.active !== undefined
        );
        const buys = activeOrders.filter(
          (order) => order.side.buy !== undefined
        );
        const sells = activeOrders.filter(
          (order) => order.side.sell !== undefined
        );

        // Sort by price (buy orders descending, sell orders ascending)
        buys.sort((a, b) => b.price - a.price);
        sells.sort((a, b) => a.price - b.price);

        setBuyOrders(buys);
        setSellOrders(sells);

        console.log("Buy orders:", buys.length, "Sell orders:", sells.length);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load order book");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [provider, marketId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center text-gray-500">Loading order book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Orderbook ({buyOrders.length + sellOrders.length} orders)
      </h2>

      {/* Sell Orders - TOP */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Sell Orders ({sellOrders.length})
          </h3>
          <div className="text-sm text-gray-500">
            Total: {(totalSellAmount / 1000000).toFixed(4)} SOL
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {sellOrders.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No sell orders yet
            </div>
          ) : (
            sellOrders.slice(0, 5).map((order, index) => (
              <div
                key={`${order.orderId}-${index}`}
                className="flex justify-between text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded hover:bg-red-900/30 transition-colors cursor-pointer"
              >
                <span className="text-red-600 dark:text-red-400 font-mono">
                  ${(order.price / 1000000).toFixed(2)}
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-mono">
                  {((order.quantity - order.filledQuantity) / 1000000).toFixed(
                    4
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spread Indicator */}
      <div className="flex items-center justify-center py-2 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-red-400 to-transparent"></div>
        <div className="px-4 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full">
          Spread: $
          {sellOrders.length > 0 && buyOrders.length > 0
            ? ((sellOrders[0].price - buyOrders[0].price) / 1000000).toFixed(2)
            : "N/A"}
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-green-400 to-transparent"></div>
      </div>

      {/* Buy Orders - BOTTOM */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            Buy Orders ({buyOrders.length})
          </h3>
          <div className="text-sm text-gray-500">
            Total: {(totalBuyAmount / 1000000).toFixed(4)} SOL
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {buyOrders.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No buy orders yet
            </div>
          ) : (
            buyOrders.slice(0, 5).map((order, index) => (
              <div
                key={`${order.orderId}-${index}`}
                className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded hover:bg-green-900/30 transition-colors cursor-pointer"
              >
                <span className="text-green-600 dark:text-green-400 font-mono">
                  ${(order.price / 1000000).toFixed(2)}
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-mono">
                  {((order.quantity - order.filledQuantity) / 1000000).toFixed(
                    4
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
