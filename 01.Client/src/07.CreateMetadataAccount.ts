import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
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
    mintKeypair.publicKey, // mint address
    2, // decimals
    wallet_1.publicKey, // mint authority
    wallet_1.publicKey // freeze authority
  );

  // Derive the Metadata account address
  const [metadataAccountAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"), // hard-coded string "metadata"
      METADATA_PROGRAM_ID.toBuffer(), // metadata program address
      mintKeypair.publicKey.toBuffer(), // mint address
    ],
    METADATA_PROGRAM_ID
  );

  // Metadata for the Token
  const tokenMetadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  // Create the Metadata account for the Mint
  const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccountAddress,
      mint: mintKeypair.publicKey,
      mintAuthority: wallet_1.publicKey,
      payer: wallet_1.publicKey,
      updateAuthority: wallet_1.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          creators: null, // used by NFTs
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          uri: tokenMetadata.uri,
          sellerFeeBasisPoints: 0, // royalty fee for NFTs
          collection: null, // used by NFTs
          uses: null, // used by NFTs
        },
        collectionDetails: null, // used by NFTs
        isMutable: true, // allow updating the metadata account
      },
    }
  );

  // Build transaction with instructions to create new account and initialize mint account
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMintInstruction,
    createMetadataInstruction
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
    "Mint Account:",
    `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
  );
})();
