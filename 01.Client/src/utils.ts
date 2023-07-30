import * as fs from "fs";
import dotenv from "dotenv";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

dotenv.config();

// This function will return an existing keypair if it's present in the environment variables, or generate a new one if not
export async function getOrCreateKeypair(walletName: string): Promise<Keypair> {
  // Check if secretKey for `walletName` exist in .env file
  const envWalletKey = process.env[walletName];

  let keypair: Keypair;

  // If no secretKey exist in the .env file for `walletName`
  if (!envWalletKey) {
    // Generate a new keypair
    keypair = Keypair.generate();

    // Save to .env file
    fs.appendFileSync(
      ".env",
      `\n${walletName}=${JSON.stringify(Array.from(keypair.secretKey))}`
    );

    console.log(`${walletName} keypair written to .env file...`);
  }
  // If secretKey already exists in the .env file
  else {
    // Create a Keypair from the secretKey
    const secretKey = new Uint8Array(JSON.parse(envWalletKey));
    keypair = Keypair.fromSecretKey(secretKey);
  }

  // Log public key and return the keypair
  console.log(`${walletName} PublicKey: ${keypair.publicKey.toBase58()}`);
  return keypair;
}
