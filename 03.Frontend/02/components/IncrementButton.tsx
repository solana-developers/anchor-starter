import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { program, mintPDA } from "@/anchor/setup";

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
        publicKey
      );

      const transaction = await program.methods
        .increment()
        .accounts({
          user: publicKey,
          tokenAccount: associatedTokenAccount,
        })
        .transaction();

      const txSig = await sendTransaction(transaction, connection);
      console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={onClick} isLoading={isLoading}>
      Increment
    </Button>
  );
}
