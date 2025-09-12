import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { BN } from "bn.js";
import bs58 from "bs58";
const PROGRAM_ID = new PublicKey("FhxmHdczQUm3unCvVN6EWpbv5s3ivf5jJZ5U6fyc1gwn");

// Account discriminators from the IDL
const ACCOUNT_DISCRIMINATORS = {
  market: [219, 190, 213, 55, 0, 227, 198, 154],
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

// Enums from IDL
export enum Side {
  Buy = 0,
  Sell = 1,
}

export enum OrderStatus {
  Active = 0,
  Filled = 1,
  Cancelled = 2,
}

// Updated interface to match IDL Market struct
export interface MarketData {
  marketId: number;
  authority: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  bump: number;
}

export interface OrderData {
  orderId: number;
  user: PublicKey;
  market: PublicKey;
  side: Side;
  price: number;
  quantity: number;
  filledQuantity: number;
  timestamp: number;
  status: OrderStatus;
  bump: number;
}

export class CLOBProgram {
  private provider: AnchorProvider;
  private programId: PublicKey;
  account: any;

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

      // Parse market data according to IDL structure
      const marketIdParsed = Number(data.readBigUInt64LE(8));
      const authority = new PublicKey(data.slice(16, 48));
      const baseMint = new PublicKey(data.slice(48, 80));
      const quoteMint = new PublicKey(data.slice(80, 112));
      const bump = data[112];

      return {
        marketId: marketIdParsed,
        authority,
        baseMint,
        quoteMint,
        bump,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return null;
    }
  }

  // Fixed initialize_market instruction to match IDL
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
        { pubkey: baseMint, isSigner: false, isWritable: false },
        { pubkey: quoteMint, isSigner: false, isWritable: false },
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

  async placeOrder(orderId: number, side: Side, price: number, quantity: number) {
    const orderPda = this.getOrderPda(orderId);
    const marketPda = this.getMarketPda(1); // Default market ID
    
    const data = Buffer.concat([
      Buffer.from(INSTRUCTION_DISCRIMINATORS.place_order),
      new BN(orderId).toArrayLike(Buffer, 'le', 8),
      Buffer.from([side]), // Single byte for enum
      new BN(price).toArrayLike(Buffer, 'le', 8),
      new BN(quantity).toArrayLike(Buffer, 'le', 8),
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: this.provider.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: marketPda, isSigner: false, isWritable: false },
        { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
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

  async getOrder(orderId: number): Promise<OrderData | null> {
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

      // Parse order data according to IDL structure
      const orderIdParsed = Number(data.readBigUInt64LE(8));
      const user = new PublicKey(data.slice(16, 48));
      const market = new PublicKey(data.slice(48, 80));
      const side = data[80] as Side;
      const price = Number(data.readBigUInt64LE(81));
      const quantity = Number(data.readBigUInt64LE(89));
      const filledQuantity = Number(data.readBigUInt64LE(97));
      const timestamp = Number(data.readBigUInt64LE(105));
      const status = data[113] as OrderStatus;
      const bump = data[114];

      return {
        orderId: orderIdParsed,
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

  async getAllOrdersForMarket(marketId: number): Promise<{ pubkey: PublicKey; account: { data: Buffer } }[]> {
    try {
      const marketPda = this.getMarketPda(marketId);
      const orderDiscriminator = ACCOUNT_DISCRIMINATORS.order;
      
      // Debug logging
      console.log("Market PDA:", marketPda.toString());
      console.log("Market PDA Buffer base64:", marketPda.toBuffer().toString('base64'));
      console.log("Order discriminator base64:", Buffer.from(orderDiscriminator).toString('base64'));
      
      // Get all program accounts
      const accounts = await this.provider.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Buffer.from(orderDiscriminator)),
            },
          },
          {
            memcmp: {
              offset: 48, // offset to market field
            bytes: bs58.encode(marketPda.toBuffer()),
            },
          },
        ],
      });

      console.log(`Found ${accounts.length} order accounts for market ${marketId}`);
      
      return accounts.map(account => ({
        pubkey: account.pubkey,
        account: {
          data: account.account.data,
        },
      }));
    } catch (error) {
      console.error("Error fetching all orders for market:", error);
      return [];
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