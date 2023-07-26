import { NextApiRequest, NextApiResponse } from "next";
import { PublicKey, Transaction } from "@solana/web3.js";
import { program, mintPDA } from "@/anchor/setup";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return get(res);
  } else if (req.method === "POST") {
    return await post(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

function get(res: NextApiResponse) {
  res.status(200).json({
    label: "Solana Pay",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  });
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { account } = req.body;
  const { reference } = req.query;

  if (!account || !reference) {
    res.status(400).json({
      error: "Required data missing. Account or reference not provided.",
    });
    return;
  }

  try {
    const transaction = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference)
    );
    res.status(200).json({
      transaction,
      message: "Increment counter",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating transaction" });
    return;
  }
}

async function buildTransaction(account: PublicKey, reference: PublicKey) {
  const connection = program.provider.connection;

  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintPDA,
    account
  );

  const instruction = await program.methods
    .increment()
    .accounts({
      user: account,
      tokenAccount: associatedTokenAccount,
    })
    .instruction();

  // Add the reference account to the instruction
  // Used in client to find the transaction once sent
  instruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  const latestBlockhash = await connection.getLatestBlockhash();

  // create new Transaction and add instruction
  const transaction = new Transaction({
    feePayer: account,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(instruction);

  return transaction
    .serialize({ requireAllSignatures: false })
    .toString("base64");
}
