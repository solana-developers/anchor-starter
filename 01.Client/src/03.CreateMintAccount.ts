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
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getOrCreateKeypair } from "./utils";

(async () => {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Use existing keypairs or generate new ones if they don't exist
  const wallet_1 = await getOrCreateKeypair("wallet_1");

  // Generate keypair to use as address of token account
  const mintKeypair = Keypair.generate();
  // Calculate minimum lamports for space required by mint account
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  // Instruction to create new account with space for new mint account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet_1.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  // Instruction to initialize mint account
  const initializeMintInstruction = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    2, // decimals
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey // freeze authority
  );

  // Build transaction with instructions to create new account and initialize mint account
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMintInstruction
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [
      wallet_1, // payer
      mintKeypair, // mint address keypair
    ]
  );

  console.log(
    "Transaction Signature:",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  console.log(
    "Mint Account 1: ",
    `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
  );

  // Create mint using `createMint` helper function
  const mint = await createMint(
    connection,
    wallet_1, // payer
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey, // freeze authority
    2 // decimals
  );

  console.log(
    "Mint Account 2: ",
    `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
  );
})();
