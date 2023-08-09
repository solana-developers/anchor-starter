import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  createAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
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

  // Get associated token account address
  const associatedTokenAccountAddress = await getAssociatedTokenAddress(
    mint, // mint address
    wallet_1.publicKey // token account owner
  );

  // Manually derive associated token account address
  const [PDA, bump] = PublicKey.findProgramAddressSync(
    [
      wallet_1.publicKey.toBuffer(), // token account owner
      TOKEN_PROGRAM_ID.toBuffer(), // token program address
      mint.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log(`Associated Token Address: ${associatedTokenAccountAddress}`);
  console.log(`Associated Token Address: ${PDA}`);

  // Instruction to create associated token account
  const instruction = createAssociatedTokenAccountInstruction(
    wallet_1.publicKey, // payer
    associatedTokenAccountAddress, // token account address
    wallet_1.publicKey, // owner
    mint
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

  console.log(
    "Token Account 1: ",
    `https://explorer.solana.com/address/${associatedTokenAccountAddress.toString()}?cluster=devnet`
  );

  const associatedTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint, // mint address
    wallet_2.publicKey // token account owner
  );

  const [PDA2, bump2] = PublicKey.findProgramAddressSync(
    [
      wallet_2.publicKey.toBuffer(), // token account owner
      TOKEN_PROGRAM_ID.toBuffer(), // token program address
      mint.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("\n");
  console.log(`Associated Token Address: ${associatedTokenAccount}`);
  console.log(`Associated Token Address: ${PDA2}`);

  console.log(
    "Token Account 2: ",
    `https://explorer.solana.com/address/${associatedTokenAccount.toString()}?cluster=devnet`
  );
})();
