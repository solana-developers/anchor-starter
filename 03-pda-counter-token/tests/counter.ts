// command to generate on-chain program idl:
// anchor idl init --filepath target/idl/counter.json <PROGRAM_ID>
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import assert from "assert";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Counter account PDA
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  // Mint account PDA, also used as mint authority
  const [mintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  // Associated token account address
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintPDA,
    wallet.publicKey
  );

  // Metadata program id
  const METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Metadata account PDA for mint
  const [metadataAccountAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPDA.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  // Data to initialize token metadata account
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
      assert(accountData.count.toNumber() === 0);

      console.log(`Transaction Signature: ${txSig}`);
      console.log(`Count: ${accountData.count}`);
    } catch (error) {
      // If PDA accounts already created, then we expect an error
      assert(error);
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
});
