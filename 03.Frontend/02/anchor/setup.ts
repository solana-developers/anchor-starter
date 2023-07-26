import { Program } from "@coral-xyz/anchor";
import { IDL, Counter } from "./idl/counter";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const programId = new PublicKey("9C2fNrE8KAf6qG7kDNprPsm2VE3qK77KCDrZQVAjwVjt");

export const program = new Program<Counter>(IDL, programId, {
  connection,
});
