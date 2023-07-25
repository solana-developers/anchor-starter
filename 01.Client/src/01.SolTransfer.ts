import {
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
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

  // Define the amount to transfer
  const transferAmount = 0.1; // 0.1 SOL

  // Create a transfer instruction for transferring SOL from wallet_1 to wallet_2
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: wallet_1.publicKey,
    toPubkey: wallet_2.publicKey,
    lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
  });

  // Add the transfer instruction to a new transaction
  const transaction = new Transaction().add(transferInstruction);

  try {
    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      wallet_1,
    ]);

    console.log(
      "Transaction Signature:",
      `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
    );
  } catch (error) {
    console.error("Transaction unsuccessful: ", error);
  }

  // Retrieve and log the new balance of each wallet after the transfer
  const balance1 = await connection.getBalance(wallet_1.publicKey);
  console.log("wallet_1 new balance:", balance1 / LAMPORTS_PER_SOL);

  const balance2 = await connection.getBalance(wallet_2.publicKey);
  console.log("wallet_2 new balance:", balance2 / LAMPORTS_PER_SOL);
})();
