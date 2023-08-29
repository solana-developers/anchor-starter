import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("hello_anchor", () => {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;

  it("Is initialized!", async () => {
    // Generate keypair for the new account
    const newAccountKeypair = new Keypair();

    // Instruction data
    const data = new anchor.BN(42);

    // Send transaction
    const transactionSignature = await program.methods
      .initialize(data)
      .accounts({
        newAccount: newAccountKeypair.publicKey,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newAccountKeypair])
      .rpc();

    console.log("Your transaction signature", transactionSignature);
  });
});
