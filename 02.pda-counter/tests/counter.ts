import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import assert from "assert";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  it("Is initialized!", async () => {
    try {
      const txSig = await program.methods.initialize().rpc();

      const accountData = await program.account.counter.fetch(counterPDA);
      assert(accountData.count.toNumber() === 0);

      console.log(`Transaction Signature: ${txSig}`);
      console.log(`Count: ${accountData.count}`);
    } catch (error) {
      // If PDA Account already created, then we expect an error
      assert(error);
    }
  });

  it("Increment 1", async () => {
    const txSig = await program.methods.increment().rpc();

    const accountData = await program.account.counter.fetch(counterPDA);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 2", async () => {
    const transaction = await program.methods.increment().transaction();

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    const accountData = await program.account.counter.fetch(counterPDA);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });
});
