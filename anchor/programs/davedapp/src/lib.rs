#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod davedapp {
  use super::*;

  pub fn initilise_notes(
    ctx: Context<InitialiseNotes>,
    title: String,
    message: String,
  ) -> Result<()>{
    let notes = &mut ctx.accounts.notes;
    notes.owner = *ctx.accounts.signer.key;
    notes.title = title;
    notes.message = message;
    Ok(())
  }

  pub fn initilise_update_notes(
    ctx: Context<InitialiseUpdateNotes>,
    _title: String,
    message: String,
  ) -> Result<()> {
    let notes = &mut *ctx.accounts.notes;
    notes.message =message;
    Ok(())
  }

  pub fn initilise_delete_notes(
    _ctx: Context<InitialiseDeleteNotes>,
    _title: String,
  ) -> Result<()> {
    Ok(())
  }
}


#[derive(Accounts)]
#[instruction(title:String)]
pub struct InitialiseUpdateNotes<'info>{
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    mut,
    realloc = 8 + Notes::INIT_SPACE,
    realloc::payer = signer,
    realloc::zero = true,
    seeds = [title.as_ref(), signer.key.as_ref()],
    bump
  )]
  pub notes: Account<'info, Notes>,

  pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct InitialiseDeleteNotes<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    mut,
    seeds = [title.as_bytes(), signer.key.as_ref()],
    bump,
    close = signer
  )]
  pub notes: Account<'info, Notes>,

  pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct  InitialiseNotes<'info>{
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    payer = signer,
    space = 8 + Notes::INIT_SPACE,
    seeds = [title.as_bytes(), signer.key.as_ref()],
    bump
  )]
  pub notes :Account<'info,   Notes>,

  pub system_program: Program<'info, System>,
} 

#[account]
#[derive(InitSpace)]
pub struct Notes{
  owner: Pubkey,
  #[max_len(50)]
  title: String,
  #[max_len(500)]
  message: String
}