import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  createMint,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  createInitializeMint2Instruction,
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

  // Generate keypair to use as address of token account
  const mintKeypair = Keypair.generate();
  // Calculate minimum lamports for space required by mint account
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const decimal = 9;

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
    decimal,
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey // freeze authority
  );

  // Build transaction with instructions to create new account and initialize mint account
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMintInstruction
  );

  try {
    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      wallet_1, // payer
      mintKeypair, // mint address keypair
    ]);

    console.log(
      "Transaction Signature:",
      `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
    );
  } catch (error) {
    console.error("Transaction unsuccessful: ", error);
  }

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
    decimal // decimals
  );

  console.log(
    "Mint Account 2: ",
    `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
  );
})();
