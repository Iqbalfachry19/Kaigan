// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from "@coral-xyz/anchor";

module.exports = async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);

  const program = anchor.workspace.clob;
  
  console.log("Deploying CLOB to devnet...");
  console.log("Program ID:", program.programId.toString());
  
  // You can add market initialization here if needed
  console.log("CLOB program deployed successfully!");
};
