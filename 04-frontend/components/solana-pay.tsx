"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  createQR,
  encodeURL,
  TransactionRequestURLFields,
  findReference,
  FindReferenceError,
} from "@solana/pay";
import { Keypair } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import toast, { Toaster } from "react-hot-toast";

export default function SolanaPay() {
  const { connection } = useConnection();
  const qrRef = useRef<HTMLDivElement>(null);

  const reference = useMemo(() => Keypair.generate().publicKey, []);
  const mostRecentNotifiedTransaction = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Create API URL
    const { location } = window;
    const apiUrl = `${location.protocol}//${
      location.host
    }/api/increment?reference=${reference.toBase58()}`;

    // Create Solana Pay URL
    const urlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    };
    const solanaUrl = encodeURL(urlParams);

    console.log("Solana Pay URL", solanaUrl);
    // Create QR code encoded with Solana Pay URL
    const qr = createQR(solanaUrl, 350, "white");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  }, [reference]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Find transactions on the network that include the reference address
        const signatureInfo = await findReference(connection, reference, {
          until: mostRecentNotifiedTransaction.current,
          finality: "confirmed",
        });
        mostRecentNotifiedTransaction.current = signatureInfo.signature;

        // Toast notification
        toast.success(
          <a
            href={`https://solana.fm/tx/${signatureInfo.signature}?cluster=devnet-alpha`}
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
      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        console.error("Unknown error", e);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [reference]);

  return (
    <>
      <div ref={qrRef} className="overflow-hidden rounded-2xl" />
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
}
