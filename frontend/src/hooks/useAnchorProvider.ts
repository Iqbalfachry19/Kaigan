import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";

export function useAnchorProvider() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  return useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      return null;
    }

    return new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
      {
        commitment: "confirmed",
      }
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);
}
