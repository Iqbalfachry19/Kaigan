"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 rounded-lg h-10 px-6 text-white font-medium animate-pulse">
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-10 !px-6 !text-white !font-medium !transition-all !duration-200" />
    </div>
  );
}
