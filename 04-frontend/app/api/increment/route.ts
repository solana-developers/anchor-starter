import { NextResponse } from "next/server";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { program, mintPDA } from "@/anchor/setup";

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      label: "Solana Pay",
      icon: "https://raw.githubusercontent.com/ZYJLiu/opos-asset/main/assets/OPOS_Social_Square.png",
    },
    { status: 200 }
  );
}

export async function POST(request: Request): Promise<Response> {
  const { account } = await request.json();
  const reference = new URL(request.url).searchParams.get("reference");

  if (!account || !reference) {
    return new Response(
      JSON.stringify({
        error: "Required data missing. Account or reference not provided.",
      }),
      { status: 400 }
    );
  }

  try {
    const transaction = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference)
    );
    return NextResponse.json(
      {
        transaction: transaction,
        message: "Increment Counter",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error Building Transaction" },
      { status: 500 }
    );
  }
}

async function buildTransaction(account: PublicKey, reference: PublicKey) {
  const connection = program.provider.connection;

  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mintPDA,
    account,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  const instruction = await program.methods
    .increment()
    .accounts({
      user: account,
      tokenAccount: associatedTokenAccount,
    })
    .instruction();

  // Add the reference account to the instruction
  // Used by frontend to find the transaction once sent
  instruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  // create new Transaction and add instruction
  const transaction = new Transaction({
    feePayer: account,
    blockhash: blockhash,
    lastValidBlockHeight: lastValidBlockHeight,
  }).add(instruction);

  return transaction
    .serialize({ requireAllSignatures: false })
    .toString("base64");
}
