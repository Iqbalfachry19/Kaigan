import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
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

  // Create test mint addresses (in real implementation, use actual SPL tokens)
  const baseMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC
  const quoteMint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL

  before(async () => {
    [marketPda, marketBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  });

  it("Initialize market", async () => {
    const tx = await program.methods
      .initializeMarket(marketId, baseMint, quoteMint)
      .accounts({
        market: marketPda,
        authority: provider.wallet.publicKey,
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
      .placeOrder(orderId, { buy: {} }, new anchor.BN(100), new anchor.BN(10))
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Buy order tx:", tx);

    // Verify order was created
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.orderId.toString()).to.equal(orderId.toString());
    expect(orderAccount.side.buy !== undefined).to.be.true;
    expect(orderAccount.price.toString()).to.equal("100");
    expect(orderAccount.quantity.toString()).to.equal("10");
    expect(orderAccount.status.active !== undefined).to.be.true;
  });

  it("Place sell order", async () => {
    const orderId = new anchor.BN(Date.now() + 1);
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), orderId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .placeOrder(orderId, { sell: {} }, new anchor.BN(105), new anchor.BN(5))
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Sell order tx:", tx);

    // Verify order was created
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.orderId.toString()).to.equal(orderId.toString());
    expect(orderAccount.side.sell !== undefined).to.be.true;
    expect(orderAccount.price.toString()).to.equal("105");
    expect(orderAccount.quantity.toString()).to.equal("5");
  });

  it("Cancel order", async () => {
    const orderId = new anchor.BN(Date.now() + 2);
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"), orderId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Place order first
    await program.methods
      .placeOrder(orderId, { buy: {} }, new anchor.BN(95), new anchor.BN(8))
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
        market: marketPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Cancel the order
    const cancelTx = await program.methods
      .cancelOrder()
      .accounts({
        order: orderPda,
        user: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Cancel order tx:", cancelTx);

    // Verify order was cancelled
    const orderAccount = await program.account.order.fetch(orderPda);
    expect(orderAccount.status.cancelled !== undefined).to.be.true;
  });
});
