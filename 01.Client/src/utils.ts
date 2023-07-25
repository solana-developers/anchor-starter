import * as fs from "fs"
import dotenv from "dotenv"
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js"

dotenv.config()

// This function will return an existing keypair if it's present in the environment variables, or generate a new one if not
export async function getOrCreateKeypair(walletName: string): Promise<Keypair> {
  // Check if secretKey for `walletName` exist in .env file
  const envWalletKey = process.env[walletName]

  let keypair: Keypair

  // If no secretKey exist in the .env file for `walletName`
  if (!envWalletKey) {
    console.log(`Writing ${walletName} keypair to .env file...`)

    // Generate a new keypair
    keypair = Keypair.generate()

    // Save to .env file
    fs.appendFileSync(
      ".env",
      `\n${walletName}=${JSON.stringify(Array.from(keypair.secretKey))}`
    )
  }
  // If secretKey already exists in the .env file
  else {
    // Create a Keypair from the secretKey
    const secretKey = new Uint8Array(JSON.parse(envWalletKey))
    keypair = Keypair.fromSecretKey(secretKey)
  }

  // Log public key and return the keypair
  console.log(`${walletName} PublicKey: ${keypair.publicKey.toBase58()}`)
  return keypair
}

// This function will request an airdrop of 2 SOL to the given public key if its balance is less than 1 SOL
export async function airdropSolIfNeeded(publicKey: PublicKey) {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  // Get the current balance of the public key
  const currentBalance = await connection.getBalance(publicKey)
  const balanceInSOL = currentBalance / LAMPORTS_PER_SOL
  console.log("Current balance is", balanceInSOL)

  // Check if the balance is less than 1 SOL
  const insufficientFunds = balanceInSOL < 1

  if (insufficientFunds) {
    try {
      // 2 SOL is maximum amount you can request in an airdrop on devnet
      console.log("Balance is less than 1 SOL. Airdropping 2 SOL...")
      const amountInLamports = 2 * LAMPORTS_PER_SOL

      // Request the airdrop
      const txSignature = await connection.requestAirdrop(
        publicKey,
        amountInLamports
      )

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()

      // Confirm the airdrop transaction
      await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature: txSignature },
        "confirmed"
      )

      // Check and log the new balance
      const newBalance = await connection.getBalance(publicKey)
      console.log("New balance is", newBalance / LAMPORTS_PER_SOL)
    } catch (e) {
      // Log an error message if the airdrop fails (likely due to rate limits)
      console.log("Airdrop Unsuccessful, likely rate-limited. Try again later.")
    }
  }
}
