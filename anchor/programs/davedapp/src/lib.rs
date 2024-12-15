#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod davedapp {
    use super::*;

  pub fn close(_ctx: Context<CloseDavedapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.davedapp.count = ctx.accounts.davedapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.davedapp.count = ctx.accounts.davedapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeDavedapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.davedapp.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeDavedapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Davedapp::INIT_SPACE,
  payer = payer
  )]
  pub davedapp: Account<'info, Davedapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseDavedapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub davedapp: Account<'info, Davedapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub davedapp: Account<'info, Davedapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Davedapp {
  count: u8,
}