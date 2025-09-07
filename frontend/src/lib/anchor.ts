import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { BN } from "bn.js";

const PROGRAM_ID = new PublicKey("E2WSY8KFFKuN75GvEMtZ7tjkJy3bpkBxJB4YWX5jRSp5");

// Account discriminators from the IDL
const ACCOUNT_DISCRIMINATORS = {
  market: [175, 175, 109, 31, 56, 222, 53, 138],
  order: [134, 173, 223, 185, 77, 86, 28, 51],
};

// Instruction discriminators from the IDL
const INSTRUCTION_DISCRIMINATORS = {
  initialize_market: [35, 35, 189, 193, 155, 48, 170, 203],
  place_order: [51, 194, 155, 175, 109, 130, 96, 106],
  cancel_order: [95, 129, 237, 240, 8, 49, 223, 132],
  fill_order: [232, 122, 115, 25, 199, 143, 136, 162],
  get_orderbook: [190, 188, 5, 239, 206, 181, 224, 12],
};

export interface MarketData {
  marketId: number;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  authority: PublicKey;
  createdAt: number;
  isActive: boolean;
}

export class CLOBProgram {
  private provider: AnchorProvider;
  private programId: PublicKey;

  constructor(provider: AnchorProvider) {
    this.provider = provider;
    this.programId = PROGRAM_ID;
  }

  // Check if market is already initialized
  async isMarketInitialized(marketId: number): Promise<boolean> {
    try {
      const marketPda = this.getMarketPda(marketId);
      const accountInfo = await this.provider.connection.getAccountInfo(marketPda);
      return accountInfo !== null;
    } catch (error) {
      console.error("Error checking market initialization:", error);
      return false;
    }
  }

  // Get market data from blockchain
  async getMarketData(marketId: number): Promise<MarketData | null> {
    try {
      const marketPda = this.getMarketPda(marketId);
      const accountInfo = await this.provider.connection.getAccountInfo(marketPda);

      if (!accountInfo) {
        return null;
      }

      const data = accountInfo.data;

      // Check discriminator
      const discriminator = Array.from(data.slice(0, 8));
      const marketDiscriminator = ACCOUNT_DISCRIMINATORS.market;

      if (!discriminator.every((byte, i) => byte === marketDiscriminator[i])) {
        console.log("Not a market account, discriminator:", discriminator);
        return null;
      }

      // Parse market data
      const parsedMarketId = Number(data.readBigUInt64LE(8));
      const baseMint = new PublicKey(data.slice(16, 48));
      const quoteMint = new PublicKey(data.slice(48, 80));
      const authority = new PublicKey(data.slice(80, 112));
      const createdAt = Number(data.readBigUInt64LE(112));
      const isActive = data[120] === 1;

      return {
        marketId: parsedMarketId,
        baseMint,
        quoteMint,
        authority,
        createdAt,
        isActive,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return null;
    }
  }

  async initializeMarket(marketId: number, baseMint: PublicKey, quoteMint: PublicKey) {
    const marketPda = this.getMarketPda(marketId);
    
    const data = Buffer.concat([
      Buffer.from(INSTRUCTION_DISCRIMINATORS.initialize_market),
      new BN(marketId).toArrayLike(Buffer, 'le', 8),
      baseMint.toBuffer(),
      quoteMint.toBuffer(),
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: marketPda, isSigner: false, isWritable: true },
        { pubkey: this.provider.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: PublicKey.default, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });

    const tx = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(tx);
    console.log("Market initialized:", signature);
    return signature;
  }

  async placeOrder(orderId: number, side: 'buy' | 'sell', price: number, quantity: number) {
    const orderPda = this.getOrderPda(orderId);
    const marketPda = this.getMarketPda(1); // Default market ID
    
    const sideEnum = side === 'buy' ? 0 : 1; // 0 for Buy, 1 for Sell
    
    const data = Buffer.concat([
      Buffer.from(INSTRUCTION_DISCRIMINATORS.place_order),
      new BN(orderId).toArrayLike(Buffer, 'le', 8),
      Buffer.from([sideEnum]),
      new BN(price).toArrayLike(Buffer, 'le', 8),
      new BN(quantity).toArrayLike(Buffer, 'le', 8),
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: this.provider.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: marketPda, isSigner: false, isWritable: false },
        { pubkey: PublicKey.default, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });

    const tx = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(tx);
    console.log("Order placed:", signature);
    return signature;
  }

  async cancelOrder(orderId: number) {
    const orderPda = this.getOrderPda(orderId);
    
    const data = Buffer.concat([
      Buffer.from(INSTRUCTION_DISCRIMINATORS.cancel_order),
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: this.provider.wallet.publicKey, isSigner: true, isWritable: true },
      ],
      programId: this.programId,
      data,
    });

    const tx = new Transaction().add(instruction);
    const signature = await this.provider.sendAndConfirm(tx);
    console.log("Order cancelled:", signature);
    return signature;
  }

  async getOrder(orderId: number): Promise<any | null> {
    const orderPda = this.getOrderPda(orderId);
    
    try {
      const accountInfo = await this.provider.connection.getAccountInfo(orderPda);
      if (!accountInfo) return null;

      const data = accountInfo.data;
      
      // Check discriminator
      const discriminator = Array.from(data.slice(0, 8));
      const orderDiscriminator = ACCOUNT_DISCRIMINATORS.order;
      
      if (!discriminator.every((byte, i) => byte === orderDiscriminator[i])) {
        return null;
      }

      // Parse order data
      const parsedOrderId = Number(data.readBigUInt64LE(8));
      const user = new PublicKey(data.slice(16, 48));
      const market = new PublicKey(data.slice(48, 80));
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

      return {
        orderId: parsedOrderId,
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
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  getMarketPda(marketId: number) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), new Uint8Array(new BigUint64Array([BigInt(marketId)]).buffer)],
      this.programId
    );
    return pda;
  }

  getOrderPda(orderId: number) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), new Uint8Array(new BigUint64Array([BigInt(orderId)]).buffer)],
      this.programId
    );
    return pda;
  }
}

export function getProgram(provider: AnchorProvider) {
  if (!provider) {
    throw new Error("Provider is not available");
  }
  
  console.log("Creating CLOB program instance...");
  const program = new CLOBProgram(provider);
  console.log("CLOB program created successfully");
  return program;
}

export function getMarketPda(marketId: number) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), new Uint8Array(new BigUint64Array([BigInt(marketId)]).buffer)],
    PROGRAM_ID
  );
  return pda;
}

export function getOrderPda(orderId: number) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("order"), new Uint8Array(new BigUint64Array([BigInt(orderId)]).buffer)],
    PROGRAM_ID
  );
  return pda;
}

// Standalone functions for market checking
export async function isMarketInitialized(provider: AnchorProvider, marketId: number = 1): Promise<boolean> {
  try {
    const program = new CLOBProgram(provider);
    return await program.isMarketInitialized(marketId);
  } catch (error) {
    console.error("Error checking market initialization:", error);
    return false;
  }
}

export async function getMarketData(provider: AnchorProvider, marketId: number = 1): Promise<MarketData | null> {
  try {
    const program = new CLOBProgram(provider);
    return await program.getMarketData(marketId);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return null;
  }
}
