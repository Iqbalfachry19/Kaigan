"use client";

import { useEffect, useState } from "react";
import { useAnchorProvider } from "../hooks/useAnchorProvider";
import {
  getProgram,
  getMarketPda,
  Side,
  OrderStatus,
  OrderData,
} from "../lib/anchor";
import { PublicKey } from "@solana/web3.js";

interface OrderBookProps {
  marketId: number;
  refreshTrigger?: number;
}

interface PriceLevel {
  price: number;
  totalQuantity: number;
  orderCount: number;
}

type TabType = "combined" | "side-by-side" | "buy-only" | "sell-only";

export function OrderBook({ marketId, refreshTrigger }: OrderBookProps) {
  const provider = useAnchorProvider();
  const [buyOrders, setBuyOrders] = useState<OrderData[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("combined");

  // Calculate total amounts
  const totalBuyAmount = buyOrders.reduce(
    (sum, order) => sum + (order.quantity - order.filledQuantity),
    0
  );
  const totalSellAmount = sellOrders.reduce(
    (sum, order) => sum + (order.quantity - order.filledQuantity),
    0
  );

  // Aggregate orders by price level with cumulative totals
  const aggregateOrdersByPrice = (
    orders: OrderData[],
    isSellSide: boolean = false
  ): PriceLevel[] => {
    const priceMap = new Map<number, PriceLevel>();

    // First pass: aggregate by price
    orders.forEach((order) => {
      const remainingQuantity = order.quantity - order.filledQuantity;
      if (remainingQuantity > 0) {
        const existing = priceMap.get(order.price);
        if (existing) {
          existing.totalQuantity += remainingQuantity;
          existing.orderCount += 1;
        } else {
          priceMap.set(order.price, {
            price: order.price,
            totalQuantity: remainingQuantity,
            orderCount: 1,
          });
        }
      }
    });

    const priceLevels = Array.from(priceMap.values());

    // Sort and calculate cumulative totals
    if (isSellSide) {
      // For sell orders: sort ascending and accumulate from best (lowest) price
      priceLevels.sort((a, b) => a.price - b.price);
      let cumulativeTotal = 0;
      priceLevels.forEach((level) => {
        cumulativeTotal += level.totalQuantity;
        (level as any).cumulativeTotal = cumulativeTotal;
      });
    } else {
      // For buy orders: sort descending and accumulate from best (highest) price
      priceLevels.sort((a, b) => b.price - a.price);
      let cumulativeTotal = 0;
      priceLevels.forEach((level) => {
        cumulativeTotal += level.totalQuantity;
        (level as any).cumulativeTotal = cumulativeTotal;
      });
    }

    return priceLevels;
  };

  // Get aggregated price levels
  const sellPriceLevels = aggregateOrdersByPrice(sellOrders, true);
  const buyPriceLevels = aggregateOrdersByPrice(buyOrders, false);

  // Calculate current price (midpoint between best bid and best ask)
  const currentPrice =
    sellPriceLevels.length > 0 && buyPriceLevels.length > 0
      ? (buyPriceLevels[0].price + sellPriceLevels[0].price) / 2
      : null;

  useEffect(() => {
    if (!provider) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const program = getProgram(provider);
        const marketPda = getMarketPda(marketId);

        console.log("Fetching orders for market:", marketPda.toString());

        const orders = await program.getAllOrdersForMarket(marketId);

        console.log("Found", orders.length, "total orders");

        const parsedOrders: OrderData[] = [];

        for (const account of orders) {
          try {
            const data = account.account.data;
            console.log(
              "Account:",
              account.pubkey.toString(),
              "Size:",
              data.length,
              "Discriminator:",
              Array.from(data.slice(0, 8))
            );

            // Skip accounts that are too small to be orders
            if (data.length < 100) {
              console.log(
                "Account too small to be order:",
                account.pubkey.toString(),
                "Size:",
                data.length,
                "Expected min: 100"
              );
              continue;
            }

            // Check discriminator for Order accounts
            const discriminator = Array.from(data.slice(0, 8));
            const orderDiscriminator = [134, 173, 223, 185, 77, 86, 28, 51];

            if (
              !discriminator.every((byte, i) => byte === orderDiscriminator[i])
            ) {
              console.log(
                "Not an order account, discriminator:",
                discriminator,
                "Expected:",
                orderDiscriminator,
                "Account:",
                account.pubkey.toString()
              );
              continue;
            }

            console.log("Found order account:", account.pubkey.toString());

            // Parse order data according to IDL structure
            const orderId = Number(data.readBigUInt64LE(8));
            const user = new PublicKey(data.slice(16, 48));
            const market = new PublicKey(data.slice(48, 80));

            // Skip if not our market
            if (!market.equals(marketPda)) {
              console.log(
                "Order not for our market:",
                market.toString(),
                "vs expected:",
                marketPda.toString(),
                "Account:",
                account.pubkey.toString()
              );
              continue;
            }

            // Parse remaining data
            const side = data[80] as Side;
            const price = Number(data.readBigUInt64LE(81));
            const quantity = Number(data.readBigUInt64LE(89));
            const filledQuantity = Number(data.readBigUInt64LE(97));
            const timestamp = Number(data.readBigUInt64LE(105));
            const status = data[113] as OrderStatus;
            const bump = data[114];

            const order: OrderData = {
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

            parsedOrders.push(order);
          } catch (error) {
            console.error("Error parsing account:", error);
            continue;
          }
        }

        console.log("Parsed", parsedOrders.length, "valid orders");

        // Separate buy and sell orders, filter only active ones
        const activeOrders = parsedOrders.filter(
          (order) => order.status === OrderStatus.Active
        );
        const buys = activeOrders.filter((order) => order.side === Side.Buy);
        const sells = activeOrders.filter((order) => order.side === Side.Sell);

        // Sort by price (buy orders descending, sell orders ascending)
        buys.sort((a, b) => b.price - a.price);
        sells.sort((a, b) => a.price - b.price);

        setBuyOrders(buys);
        setSellOrders(sells);

        console.log("Final filtered orders:");
        console.log("Active orders:", activeOrders.length);
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

  const tabs: { id: TabType; icon: string; title: string }[] = [
    { id: "combined", icon: "📊", title: "Combined View" },
    { id: "buy-only", icon: "📈", title: "Buy Orders Only" },
    { id: "sell-only", icon: "📉", title: "Sell Orders Only" },
  ];

  const renderCombinedView = () => (
    <>
      {/* Sell Orders - TOP */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-500">
            Price (USDC)
          </h3>
          <div className="text-sm text-gray-500">Amt. (SOL)</div>
          <div className="text-sm text-gray-500">Total (USDC)</div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {sellPriceLevels.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No sell orders yet
            </div>
          ) : (
            sellPriceLevels.slice(0, 5).map((level, index) => (
              <div
                key={`sell-${level.price}-${index}`}
                className="flex justify-between items-center text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded hover:bg-red-900/30 transition-colors cursor-pointer"
              >
                <div className="flex flex-col flex-1">
                  <span className="text-red-600 dark:text-red-400 font-mono">
                    ${(level.price / 1000000).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {level.orderCount} order{level.orderCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-col  flex-1">
                  <span className="text-gray-700 dark:text-gray-300 font-mono">
                    {(level.totalQuantity / 1000000).toFixed(4)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-mono">
                    Σ {((level as any).cumulativeTotal / 1000000).toFixed(4)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Price - CENTER */}
      <div className="flex items-center justify-center py-4 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-red-400 to-transparent"></div>
        <div className="px-6 py-2 mx-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {currentPrice ? `$${(currentPrice / 1000000).toFixed(2)}` : "N/A"}
            </div>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-green-400 to-transparent"></div>
      </div>

      {/* Buy Orders - BOTTOM */}
      <div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {buyPriceLevels.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No buy orders yet
            </div>
          ) : (
            buyPriceLevels.slice(0, 5).map((level, index) => (
              <div
                key={`buy-${level.price}-${index}`}
                className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded hover:bg-green-900/30 transition-colors cursor-pointer"
              >
                <div className="flex flex-col  flex-1">
                  <span className="text-green-600 dark:text-green-400 font-mono">
                    ${(level.price / 1000000).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {level.orderCount} order{level.orderCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-col  flex-1">
                  <span className="text-gray-700 dark:text-gray-300 font-mono">
                    {(level.totalQuantity / 1000000).toFixed(4)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-mono">
                    Σ {((level as any).cumulativeTotal / 1000000).toFixed(4)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  const renderBuyOnlyView = () => (
    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-green-600 dark:text-green-400 font-medium">
          Price (USDC)
        </span>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Amount (SOL)
        </span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {buyPriceLevels.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            No buy orders yet
          </div>
        ) : (
          buyPriceLevels.slice(0, 10).map((level, index) => (
            <div
              key={`buy-only-${level.price}-${index}`}
              className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-800"
            >
              <div className="flex flex-col">
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  ${(level.price / 1000000).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  {level.orderCount} order{level.orderCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-right">
                <div className="text-gray-700 dark:text-gray-300 font-mono font-semibold">
                  {(level.totalQuantity / 1000000).toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Σ {((level as any).cumulativeTotal / 1000000).toFixed(4)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSellOnlyView = () => (
    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-red-600 dark:text-red-400 font-medium">
          Price (USDC)
        </span>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Amount (SOL)
        </span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sellPriceLevels.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            No sell orders yet
          </div>
        ) : (
          sellPriceLevels.slice(0, 10).map((level, index) => (
            <div
              key={`sell-only-${level.price}-${index}`}
              className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800"
            >
              <div className="flex flex-col">
                <span className="text-red-600 dark:text-red-400 font-mono font-semibold">
                  ${(level.price / 1000000).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  {level.orderCount} order{level.orderCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-right">
                <div className="text-gray-700 dark:text-gray-300 font-mono font-semibold">
                  {(level.totalQuantity / 1000000).toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Σ {((level as any).cumulativeTotal / 1000000).toFixed(4)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "combined":
        return renderCombinedView();
      case "buy-only":
        return renderBuyOnlyView();
      case "sell-only":
        return renderSellOnlyView();
      default:
        return renderCombinedView();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-center items-center space-x-2 mx-2">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Orderbook
        </h2>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
              className={`flex-1 py-2 px-4 text-base font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
}
