import {
  Connection,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  createInitializeAccountInstruction,
  createAccount,
  ACCOUNT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getOrCreateKeypair } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");

  // Create mint using `createMint` helper function
  const mint = await createMint(
    connection,
    wallet_1, // payer
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey, // freeze authority
    2 // decimals
  );

  // Generate keypair to use as address of token account
  const tokenKeypair = Keypair.generate();
  // Calculate minimum lamports for space required by token account
  const lamports = await connection.getMinimumBalanceForRentExemption(
    ACCOUNT_SIZE
  );

  // Instruction to create new account with space for new token account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet_1.publicKey,
    newAccountPubkey: tokenKeypair.publicKey,
    space: ACCOUNT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  // Instruction to initialize token account
  const initializeAccountInstruction = createInitializeAccountInstruction(
    tokenKeypair.publicKey, // token account address
    mint, // mint address
    wallet_1.publicKey // token account owner
  );

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeAccountInstruction
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [
      wallet_1, // payer
      tokenKeypair, // token address keypair
    ]
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  console.log(
    "Token Account 1: ",
    `https://explorer.solana.com/address/${tokenKeypair.publicKey.toString()}?cluster=devnet`
  );

  const tokenKeypair2 = Keypair.generate();
  const tokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint, // mint address
    wallet_1.publicKey, // token account owner
    tokenKeypair2 // token address
  );

  console.log(
    "Token Account 2: ",
    `https://explorer.solana.com/address/${tokenAccount.toString()}?cluster=devnet`
  );
})();
