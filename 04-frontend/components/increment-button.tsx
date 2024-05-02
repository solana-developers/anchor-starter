"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { program, mintPDA } from "@/anchor/setup";
import { Button } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

export default function IncrementButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!publicKey) return;

    setIsLoading(true);

    try {
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintPDA,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction = await program.methods
        .increment()
        .accounts({
          user: publicKey,
          tokenAccount: associatedTokenAccount,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      toast.success(
        <a
          href={`https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`}
          target="_blank"
        >
          View on SolanaFM
        </a>,
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="w-24"
        onClick={onClick}
        isLoading={isLoading}
        isDisabled={!publicKey}
      >
        {isLoading ? "" : "Increment"}
      </Button>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
}
