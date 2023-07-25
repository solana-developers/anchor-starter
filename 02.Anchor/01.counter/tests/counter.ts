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
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  const counterAccount = Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const txSig = await program.methods
      .initialize()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .signers([counterAccount])
      .rpc();

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 0);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 1", async () => {
    const txSig = await program.methods
      .increment()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 1);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 2", async () => {
    const transaction = await program.methods
      .increment()
      .accounts({ counter: counterAccount.publicKey, user: wallet.publicKey })
      .transaction();

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 2);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });

  it("Increment 3", async () => {
    const instruction = await program.methods
      .increment()
      .accounts({ counter: counterAccount.publicKey, user: wallet.publicKey })
      .instruction();

    const transaction = new Transaction().add(instruction);

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber() === 3);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);
  });
});
