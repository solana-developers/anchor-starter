import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  TOKEN_PROGRAM_ID,
  createAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
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

  // Get associated token account address
  const associatedTokenAccountAddress = await getAssociatedTokenAddress(
    mint,
    wallet_1.publicKey
  );

  const [PDA] = PublicKey.findProgramAddressSync(
    [
      wallet_1.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
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

  console.log(
    "Token Account 1: ",
    `https://explorer.solana.com/address/${associatedTokenAccountAddress.toString()}?cluster=devnet`
  );

  const associatedTokenAccount = await createAccount(
    connection,
    wallet_1, // payer
    mint,
    wallet_2.publicKey // token account owner
  );

  const [PDA2] = PublicKey.findProgramAddressSync(
    [
      wallet_2.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
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
