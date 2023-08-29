use anchor_lang::prelude::*;

// This is your program's public key
declare_id!("7UMEGk3CQ1P4fg7xHm1ZnKGZWP1jT3XobP3oiW1JRtB8");

// Define the program instructions
#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

// Define the accounts required by the program instruction
#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Define the layout of the NewAccount account.
#[account]
pub struct NewAccount {
    data: u64,
}
