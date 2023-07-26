import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Counter } from "./counter";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("9C2fNrE8KAf6qG7kDNprPsm2VE3qK77KCDrZQVAjwVjt");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program<Counter>(IDL, programId, {
  connection,
});

export const [mintPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("mint")],
  program.programId
);

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  program.programId
);

export type CounterData = IdlAccounts<Counter>["counter"];
