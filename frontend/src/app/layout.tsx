import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../components/WalletProvider";
import { Toaster } from "react-hot-toast";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kaigan - Decentralized Trading Platform",
  description:
    "Trade cryptocurrencies on Solana with our decentralized CLOB exchange",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                border: "1px solid #374151",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#f9fafb",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#f9fafb",
                },
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
