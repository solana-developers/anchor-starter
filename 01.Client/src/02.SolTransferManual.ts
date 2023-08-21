import {
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
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

  // Define the amount to transfer
  const transferAmount = 0.1; // 0.1 SOL

  // Instruction index for the SystemProgram transfer instruction
  const transferInstructionIndex = 2;

  // Create a buffer for the data to be passed to the transfer instruction
  const instructionData = Buffer.alloc(4 + 8); // uint32 + uint64
  // Write the instruction index to the buffer
  instructionData.writeUInt32LE(transferInstructionIndex, 0);
  // Write the transfer amount to the buffer
  instructionData.writeBigUInt64LE(
    BigInt(transferAmount * LAMPORTS_PER_SOL),
    4
  );

  // Manually create a transfer instruction for transferring SOL from wallet_1 to wallet_2
  const transferInstruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet_1.publicKey, isSigner: true, isWritable: true },
      { pubkey: wallet_2.publicKey, isSigner: false, isWritable: true },
    ],
    programId: SystemProgram.programId,
    data: instructionData,
  });

  // Add the transfer instruction to a new transaction
  const transaction = new Transaction().add(transferInstruction);

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
