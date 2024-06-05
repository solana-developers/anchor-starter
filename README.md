# Anchor Counter Program

This repo is intended to provide an example of:

- How to use Program Derived Addresses (PDA) and Cross Program Invocations(CPIs) in an Anchor program
- How to set up a frontend with the program's IDL to invoke instructions on the program.

The examples are built using Anchor version 0.30.0.

## Anchor Program

Included are 3 versions of a Counter program, each building on the last. The Counter program will only include two instructions:

- `initialize`: Instruction to create a Counter Account
- `increment`: Instruction to increment value stored on the Counter Account

### [01.counter](01-counter/programs/counter/src/lib.rs)

This initial version includes a basic Counter program that creates a Counter Account and increments the value.

### [02.pda-counter](02-pda-counter/programs/counter/src/lib.rs)

This version updates the Counter program to use Program Derived Addresses (PDAs) as the Counter Account's address.

The purpose of this program is simply to demonstrate how to create an account using a PDA as the address.

### [03.counter-pda-token](03-pda-counter-token/programs/counter/src/lib.rs)

This final version updates the Counter program to:

- Create a new token mint with metadata when the Counter Account is initialized
- Mints tokens when the count is incremented

The purpose of this program is to demonstrate how to make CPIs and how to use PDAs for signing.

Additionally, it demonstrates how to invoke the Token Extensions program and initialize the Metadata Extension to store token metadata directly on the Mint account.

## Frontend

Also included is a frontend for interacting with the final counter program.

### [04.frontend](04-frontend/)

The frontend includes an example of how to invoke the `increment` instruction on the Counter program using either:

- The Solana wallet-adapter with connected to a browser Solana wallet
- Scanning a Solana Pay QR Code with a mobile Solana wallet.

The purpose of this is to demonstrate how to use the program IDL to invoke instructions on the program from a frontend.
