import {
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { getOrCreateKeypair } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");
  const wallet_2 = await getOrCreateKeypair("wallet_2");

  const preBalance1 = await connection.getBalance(wallet_1.publicKey);
  console.log("wallet_1 prebalance:", preBalance1 / LAMPORTS_PER_SOL);

  const preBalance2 = await connection.getBalance(wallet_2.publicKey);
  console.log("wallet_2 prebalance:", preBalance2 / LAMPORTS_PER_SOL);

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_000_000,
  });

  // Define the amount to transfer
  const transferAmount = 0.1; // 0.1 SOL

  // Create a transfer instruction for transferring SOL from wallet_1 to wallet_2
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: wallet_1.publicKey,
    toPubkey: wallet_2.publicKey,
    lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
  });

  // Add the transfer instruction to a new transaction
  const transaction = new Transaction().add(
    modifyComputeUnits,
    transferInstruction
  );

  // Send the transaction to the network
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet_1] // signer
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  // Retrieve and log the new balance of each wallet after the transfer
  const postBalance1 = await connection.getBalance(wallet_1.publicKey);
  console.log("wallet_1 postbalance:", postBalance1 / LAMPORTS_PER_SOL);

  const postBalance2 = await connection.getBalance(wallet_2.publicKey);
  console.log("wallet_2 postbalance:", postBalance2 / LAMPORTS_PER_SOL);
})();
