import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Davedapp} from '../target/types/davedapp'

describe('davedapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Davedapp as Program<Davedapp>

  const davedappKeypair = Keypair.generate()

  it('Initialize Davedapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        davedapp: davedappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([davedappKeypair])
      .rpc()

    const currentCount = await program.account.davedapp.fetch(davedappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Davedapp', async () => {
    await program.methods.increment().accounts({ davedapp: davedappKeypair.publicKey }).rpc()

    const currentCount = await program.account.davedapp.fetch(davedappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Davedapp Again', async () => {
    await program.methods.increment().accounts({ davedapp: davedappKeypair.publicKey }).rpc()

    const currentCount = await program.account.davedapp.fetch(davedappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Davedapp', async () => {
    await program.methods.decrement().accounts({ davedapp: davedappKeypair.publicKey }).rpc()

    const currentCount = await program.account.davedapp.fetch(davedappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set davedapp value', async () => {
    await program.methods.set(42).accounts({ davedapp: davedappKeypair.publicKey }).rpc()

    const currentCount = await program.account.davedapp.fetch(davedappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the davedapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        davedapp: davedappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.davedapp.fetchNullable(davedappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
