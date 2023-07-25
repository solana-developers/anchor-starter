import {
  Connection,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  createAccount,
  createMintToInstruction,
  mintTo,
} from "@solana/spl-token";
import { getOrCreateKeypair, airdropSolIfNeeded } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");

  console.log(`\n`);

  // Request an airdrop of SOL to wallet_1 if its balance is less than 1 SOL
  await airdropSolIfNeeded(wallet_1.publicKey);

  // Create mint using `createMint` helper function
  const mint = await createMint(
    connection,
    wallet_1, // payer
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey, // freeze authority
    9 // decimals
  );

  const associatedTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_1.publicKey // token account owner
  );

  const amount = 1_000_000_000;

  const instruction = await createMintToInstruction(
    mint,
    associatedTokenAccount, // destination
    wallet_1.publicKey, // mint authority
    amount // amount
  );

  const transaction = new Transaction().add(instruction);

  try {
    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      wallet_1, // payer
    ]);

    console.log(
      "Transaction Signature:",
      `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
    );
  } catch (error) {
    console.error("Transaction unsuccessful: ", error);
  }

  const txSig = await mintTo(
    connection,
    wallet_1,
    mint,
    associatedTokenAccount,
    wallet_1.publicKey,
    amount
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
  );
})();
