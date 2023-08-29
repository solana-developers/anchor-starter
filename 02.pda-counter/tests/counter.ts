import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { expect } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  it("Is initialized!", async () => {
    try {
      const txSig = await program.methods.initialize().rpc();

      const accountData = await program.account.counter.fetch(counterPDA);
      expect(accountData.count.toNumber() === 0);

      console.log(`Transaction Signature: ${txSig}`);
      console.log(`Count: ${accountData.count}`);
    } catch (error) {
      // If PDA Account already created, then we expect an error
      expect(error);
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

  it("Increment 3", async () => {
    const instruction = await program.methods
      .increment()
      .accounts({ counter: counterPDA })
      .instruction();

    const transaction = new Transaction().add(instruction);

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
