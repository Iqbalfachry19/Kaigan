import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  SystemProgram, 
  Keypair,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { Clob } from "../target/types/clob";
import { expect } from "chai";
describe("clob", () => {
  // Configure the client to use the devnet cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.clob as Program<Clob>;
  
  let marketPda: PublicKey;
  let marketBump: number;
  const marketId = new anchor.BN(1);

  // Token mints - using real wSOL and USDC on devnet
  let baseMint: PublicKey;  // wSOL
  let quoteMint: PublicKey; // USDC
  
  // Vault accounts
  let baseVault: PublicKey;
  let quoteVault: PublicKey;
  
  // User token accounts
  let userBaseToken: PublicKey;  // User's wSOL account
  let userQuoteToken: PublicKey; // User's USDC account

  console.log("🚀 Starting CLOB tests with wSOL/USDC trading pair");
  console.log("📊 Using devnet cluster");
  console.log("💰 Base token: wSOL (So11111111111111111111111111111111111111112)");
  console.log("💵 Quote token: USDC (4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)");

  before(async () => {
    // Use wSOL and USDC mint addresses for devnet
    baseMint = new PublicKey("So11111111111111111111111111111111111111112"); // wSOL
    quoteMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // USDC devnet

    // Create market PDA
    [marketPda, marketBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Create vault PDAs
    [baseVault] = PublicKey.findProgramAddressSync(
      [marketPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), baseMint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    [quoteVault] = PublicKey.findProgramAddressSync(
      [marketPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), quoteMint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Get expected ATA addresses
    const expectedBaseToken = await getAssociatedTokenAddress(
      baseMint,
      provider.wallet.publicKey
    );
    
    const expectedQuoteToken = await getAssociatedTokenAddress(
      quoteMint,
      provider.wallet.publicKey
    );

    // Try to create ATAs, handle errors gracefully
    try {
      userBaseToken = await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        baseMint,
        provider.wallet.publicKey
      );
      console.log("✅ Created wSOL ATA:", userBaseToken.toString());
    } catch (error) {
      console.log("⚠️  Using existing wSOL ATA or creation failed:", expectedBaseToken.toString());
      userBaseToken = expectedBaseToken;
    }

    try {
      userQuoteToken = await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        quoteMint,
        provider.wallet.publicKey
      );
      console.log("✅ Created USDC ATA:", userQuoteToken.toString());
    } catch (error) {
      console.log("⚠️  Using existing USDC ATA or creation failed:", expectedQuoteToken.toString());
      userQuoteToken = expectedQuoteToken;
    }

    // Request airdrop for SOL (wSOL requires SOL)
    // const airdropSignature = await provider.connection.requestAirdrop(
    //   provider.wallet.publicKey,
    //   2 * LAMPORTS_PER_SOL // 2 SOL
    // );
    // await provider.connection.confirmTransaction(airdropSignature);
    
    // For USDC on devnet, we'll need to use a faucet or skip minting
    // Since USDC is a real token on devnet, we can't mint to it directly
    // In a real test scenario, you would need to get USDC from a faucet or DEX
    console.log("Note: For USDC testing, you may need to get tokens from a faucet");
    
    console.log("Base Mint (wSOL):", baseMint.toString());
    console.log("Quote Mint (USDC):", quoteMint.toString());
    console.log("User Base Token Account:", userBaseToken.toString());
    console.log("User Quote Token Account:", userQuoteToken.toString());
  });
   it("Initialize market", async () => {
    const tx = await program.methods
      .initializeMarket(marketId, baseMint, quoteMint)
      .accounts({
        market: marketPda,
        baseVault: baseVault,
        quoteVault: quoteVault,
        baseMint: baseMint,
        quoteMint: quoteMint,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Market initialization tx:", tx);

    // Verify market was created
    const marketAccount = await program.account.market.fetch(marketPda);
    expect(marketAccount.marketId.toString()).to.equal(marketId.toString());
    expect(marketAccount.baseMint.toString()).to.equal(baseMint.toString());
    expect(marketAccount.quoteMint.toString()).to.equal(quoteMint.toString());
  });

    it("Place buy order", async () => {
    const orderId = new anchor.BN(Date.now());
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), orderId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .placeOrder(orderId, { buy: {} }, new anchor.BN(15000000), new anchor.BN(1000000)) // 15 USDC per SOL, 1 SOL quantity
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        baseVault: baseVault,
        quoteVault: quoteVault,
        userBaseToken: userBaseToken,
        userQuoteToken: userQuoteToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Buy order tx:", tx);

    // Verify order was created
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.orderId.toString()).to.equal(orderId.toString());
    expect(orderAccount.side.buy !== undefined).to.be.true;
    expect(orderAccount.price.toString()).to.equal("15000000");
    expect(orderAccount.quantity.toString()).to.equal("1000000");
    expect(orderAccount.status.active !== undefined).to.be.true;
  });
    it("Place sell order", async () => {
    const orderId = new anchor.BN(Date.now() + 1);
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), orderId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .placeOrder(orderId, { sell: {} }, new anchor.BN(16000000), new anchor.BN(500000)) // 16 USDC per SOL, 0.5 SOL quantity
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        baseVault: baseVault,
        quoteVault: quoteVault,
        userBaseToken: userBaseToken,
        userQuoteToken: userQuoteToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Sell order tx:", tx);

    // Verify order was created
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.orderId.toString()).to.equal(orderId.toString());
    expect(orderAccount.side.sell !== undefined).to.be.true;
    expect(orderAccount.price.toString()).to.equal("16000000");
    expect(orderAccount.quantity.toString()).to.equal("500000");
  });

   it("Cancel order", async () => {
    const orderId = new anchor.BN(Date.now() + 2);
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), orderId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Place order first
    await program.methods
      .placeOrder(orderId, { buy: {} }, new anchor.BN(14000000), new anchor.BN(800000)) // 14 USDC per SOL, 0.8 SOL quantity
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        baseVault: baseVault,
        quoteVault: quoteVault,
        userBaseToken: userBaseToken,
        userQuoteToken: userQuoteToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Cancel the order
    const cancelTx = await program.methods
      .cancelOrder()
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        baseVault: baseVault,
        quoteVault: quoteVault,
        userBaseToken: userBaseToken,
        userQuoteToken: userQuoteToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Cancel order tx:", cancelTx);

    // Verify order was cancelled
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.status.cancelled !== undefined).to.be.true;
  });
})
