import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  TOKEN_PROGRAM_ID,
  createAccount,
  ACCOUNT_SIZE,
  createInitializeAccountInstruction,
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
    tokenKeypair.publicKey,
    mint,
    wallet_1.publicKey,
    TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeAccountInstruction
  );

  try {
    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      wallet_1, // payer
      tokenKeypair,
    ]);

    console.log(
      "Transaction Signature:",
      `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
    );
  } catch (error) {
    console.error("Transaction unsuccessful: ", error);
  }

  console.log(
    "Token Account 1: ",
    `https://explorer.solana.com/address/${tokenKeypair.publicKey.toString()}?cluster=devnet`
  );

  const tokenKeypair2 = Keypair.generate();
  const tokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_1.publicKey, // token account owner
    tokenKeypair2 // token address
  );

  console.log(
    "Token Account 2: ",
    `https://explorer.solana.com/address/${tokenAccount.toString()}?cluster=devnet`
  );
})();
