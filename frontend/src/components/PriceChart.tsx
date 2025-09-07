"use client";

import { useEffect, useRef } from "react";

// TradingView Chart Configuration
interface TradingViewConfig {
  symbol: string;
  interval: string;
  container_id: string;
  library_path: string;
  locale: string;
  disabled_features: string[];
  enabled_features: string[];
  charts_storage_url: string;
  charts_storage_api_version: string;
  client_id: string;
  user_id: string;
  fullscreen: boolean;
  autosize: boolean;
  studies_overrides: Record<string, any>;
  theme: string;
}

// Custom Data Feed for TradingView
class DataFeed {
  onReady(callback: any) {
    setTimeout(() => {
      callback({
        supports_search: true,
        supports_group_request: false,
        supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W"],
        supports_marks: false,
        supports_timescale_marks: false,
      });
    }, 0);
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: any,
    onResolveErrorCallback: any
  ) {
    setTimeout(() => {
      onSymbolResolvedCallback({
        name: symbolName,
        description: "SOL/USDC Trading Pair",
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        ticker: symbolName,
        exchange: "CLOB DEX",
        minmov: 1,
        pricescale: 1000000, // 6 decimal places for crypto
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W"],
        volume_precision: 4,
        data_status: "streaming",
      });
    }, 0);
  }

  getBars(
    symbolInfo: any,
    resolution: string,
    periodParams: any,
    onHistoryCallback: any,
    onErrorCallback: any
  ) {
    // Mock historical data
    const bars = [];
    const currentTime = Date.now();

    // Generate mock OHLC data for the last 100 periods
    for (let i = 99; i >= 0; i--) {
      const time = currentTime - i * 60 * 1000; // 1-minute intervals
      const basePrice = 25 + Math.sin(i * 0.1) * 2; // Base price with some variation

      bars.push({
        time: time,
        low: basePrice - Math.random() * 0.5,
        high: basePrice + Math.random() * 0.5,
        open: basePrice - Math.random() * 0.2,
        close: basePrice + Math.random() * 0.2,
        volume: Math.floor(Math.random() * 1000) + 500,
      });
    }

    setTimeout(() => {
      onHistoryCallback(bars, { noData: false });
    }, 0);
  }

  subscribeBars(
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: any,
    subscriberUID: string,
    onResetCacheNeededCallback: any
  ) {
    // Mock real-time updates
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const basePrice = 25 + Math.sin(Date.now() * 0.001) * 2;

      onRealtimeCallback({
        time: currentTime,
        low: basePrice - Math.random() * 0.5,
        high: basePrice + Math.random() * 0.5,
        open: basePrice - Math.random() * 0.2,
        close: basePrice + Math.random() * 0.2,
        volume: Math.floor(Math.random() * 1000) + 500,
      });
    }, 5000); // Update every 5 seconds

    return {
      unsubscribe: () => clearInterval(interval),
    };
  }

  unsubscribeBars(subscriberUID: string) {
    // Cleanup will be handled by the unsubscribe function returned in subscribeBars
  }
}

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Load TradingView script dynamically
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        const config: TradingViewConfig = {
          symbol: "SOL/USDC",
          interval: "1",
          container_id: "tradingview-chart",
          library_path: "/tradingview/",
          locale: "en",
          disabled_features: [
            "header_widget",
            "header_symbol_search",
            "header_resolutions",
            "header_interval_dialog_button",
            "show_interval_dialog_on_key_press",
            "header_undo_redo",
            "header_screenshot",
            "header_fullscreen_button",
            "header_settings",
            "header_indicators",
            "header_compare",
            "timeframes_toolbar",
            "volume_force_overlay",
          ],
          enabled_features: [
            "study_templates",
            "use_localstorage_for_settings",
            "save_chart_properties_to_local_storage",
            "create_volume_indicator_by_default",
            "study_dialog_search_control",
          ],
          charts_storage_url: "https://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "clob_dex",
          user_id: "demo_user",
          fullscreen: false,
          autosize: true,
          studies_overrides: {},
          theme: "dark",
        };

        // Create TradingView widget
        chartWidgetRef.current = new window.TradingView.widget(config);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (chartWidgetRef.current) {
        chartWidgetRef.current.remove();
        chartWidgetRef.current = null;
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="">
      <div className="flex items-center justify-between "></div>

      <div className="relative">
        <div
          id="tradingview-chart"
          ref={chartContainerRef}
          className="w-full h-[500px] rounded-lg overflow-hidden"
          style={{ minHeight: "500px" }}
        />
      </div>
    </div>
  );
}

// Extend window object for TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}
