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
  createTransferInstruction,
  transfer,
} from "@solana/spl-token";
import { getOrCreateKeypair, airdropSolIfNeeded } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");
  const wallet_2 = await getOrCreateKeypair("wallet_2");

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

  const sourceTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_1.publicKey // token account owner
  );

  const destinationTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_2.publicKey // token account owner
  );

  const amount = 1_000_000_000;

  await mintTo(
    connection,
    wallet_1,
    mint,
    sourceTokenAccount,
    wallet_1.publicKey,
    amount
  );

  const instruction = await createTransferInstruction(
    sourceTokenAccount,
    destinationTokenAccount,
    wallet_1.publicKey, // source token account owner
    amount / 2
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

  const txSig = await transfer(
    connection,
    wallet_1, // payer
    sourceTokenAccount,
    destinationTokenAccount,
    wallet_1.publicKey, // source token account owner
    amount / 2
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
  );
})();
