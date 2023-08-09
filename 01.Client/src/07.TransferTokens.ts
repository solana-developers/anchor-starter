import {
  Connection,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  createTransferInstruction,
  transfer,
} from "@solana/spl-token";
import { getOrCreateKeypair } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");
  const wallet_2 = await getOrCreateKeypair("wallet_2");

  // Create mint using `createMint` helper function
  const mint = await createMint(
    connection,
    wallet_1, // payer
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey, // freeze authority
    2 // decimals
  );

  // Create associated token account for wallet_1
  const sourceTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint, // mint address
    wallet_1.publicKey // token account owner
  );

  // Create associated token account for wallet_2
  const destinationTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_2.publicKey // token account owner
  );

  await mintTo(
    connection,
    wallet_1, // payer
    mint, // mint address
    sourceTokenAccount, // destination
    wallet_1.publicKey, // mint authority
    100 // amount
  );

  const instruction = await createTransferInstruction(
    sourceTokenAccount, // transfer from
    destinationTokenAccount, // transfer to
    wallet_1.publicKey, // source token account owner
    50 // amount
  );

  const transaction = new Transaction().add(instruction);

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [
      wallet_1, // payer
    ]
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  const transactionSignature2 = await transfer(
    connection,
    wallet_1, // payer
    sourceTokenAccount, // transfer from
    destinationTokenAccount, // transfer to
    wallet_1.publicKey, // source token account owner
    50
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${transactionSignature2}?cluster=devnet`
  );
})();
