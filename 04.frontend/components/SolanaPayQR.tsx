import { useEffect, useMemo, useRef, useState } from "react";
import { Flex } from "@chakra-ui/react";
import {
  createQR,
  encodeURL,
  TransactionRequestURLFields,
  findReference,
  FindReferenceError,
} from "@solana/pay";
import { Keypair } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import useToastHook from "@/hooks/useToastHook";

export default function MintQR() {
  const { connection } = useConnection();
  const qrRef = useRef<HTMLDivElement>(null);

  const reference = useMemo(() => Keypair.generate().publicKey, []);
  const mostRecentNotifiedTransaction = useRef<string | undefined>(undefined);

  const displayToast = useToastHook();

  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 100 : Math.min(window.outerWidth - 10, 512)
  );

  useEffect(() => {
    const listener = () => setSize(Math.min(window.outerWidth - 10, 512));
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

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

    // Create QR code encoded with Solana Pay URL
    const qr = createQR(solanaUrl, size, "transparent");
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  }, [reference, size]);

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
        displayToast(signatureInfo.signature);
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

  return <Flex ref={qrRef} />;
}
