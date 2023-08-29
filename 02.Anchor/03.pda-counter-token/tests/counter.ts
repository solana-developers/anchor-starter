// command to generate on-chain program idl:
// anchor idl init --filepath target/idl/counter.json <PROGRAM_ID>
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
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

  const [mintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintPDA,
    wallet.publicKey
  );

  const METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const [metadataAccountAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPDA.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const tokenMetadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  it("Is initialized!", async () => {
    try {
      const txSig = await program.methods
        .initialize(tokenMetadata.name, tokenMetadata.symbol, tokenMetadata.uri)
        .accounts({
          metadata: metadataAccountAddress,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        })
        .rpc({ skipPreflight: true });

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
    const txSig = await program.methods
      .increment()
      .accounts({ tokenAccount: associatedTokenAccount })
      .rpc();

    const accountData = await program.account.counter.fetch(counterPDA);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);

    const balance = await connection.getTokenAccountBalance(
      associatedTokenAccount
    );
    console.log(`Balance: ${balance.value.uiAmount}`);
  });

  it("Increment 2", async () => {
    const transaction = await program.methods
      .increment()
      .accounts({
        user: wallet.publicKey,
        tokenAccount: associatedTokenAccount,
      })
      .transaction();

    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    const accountData = await program.account.counter.fetch(counterPDA);

    console.log(`Transaction Signature: ${txSig}`);
    console.log(`Count: ${accountData.count}`);

    const balance = await connection.getTokenAccountBalance(
      associatedTokenAccount
    );
    console.log(`Balance: ${balance.value.uiAmount}`);
  });

  it("Increment 3", async () => {
    const instruction = await program.methods
      .increment()
      .accounts({
        user: wallet.publicKey,
        tokenAccount: associatedTokenAccount,
      })
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

    const balance = await connection.getTokenAccountBalance(
      associatedTokenAccount
    );
    console.log(`Balance: ${balance.value.uiAmount}`);
  });
});
