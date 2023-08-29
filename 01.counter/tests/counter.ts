import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import {
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { expect } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  // Generate a new keypair to use as the address the counter account
  const counterAccount = new Keypair();

  it("Is initialized!", async () => {
    // Invoke the initialize instruction
    const transactionSignature = await program.methods
      .initialize()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .signers([counterAccount]) // include counter keypair as additional signer
      .rpc({ skipPreflight: true });

    // Fetch the counter account data
    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 0);

    console.log(`Transaction Signature: ${transactionSignature}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 1", async () => {
    // Invoke the increment instruction
    const txSig = await program.methods
      .increment()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    // Fetch the counter account data
    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 1);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 2", async () => {
    // Create a transaction with the increment instruction
    const transaction = await program.methods
      .increment()
      .accounts({ counter: counterAccount.publicKey })
      .transaction();

    // Send the transaction
    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    // Fetch the counter account data
    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 2);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 3", async () => {
    // Create the increment instruction
    const instruction = await program.methods
      .increment()
      .accounts({ counter: counterAccount.publicKey })
      .instruction();

    // Create new transaction and add the increment instruction to the transaction
    const transaction = new Transaction().add(instruction);

    // Send the transaction
    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    // Fetch the counter account data
    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 3);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });
});
