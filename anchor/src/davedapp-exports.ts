// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import DavedappIDL from '../target/idl/davedapp.json'
import type { Davedapp } from '../target/types/davedapp'

// Re-export the generated IDL and type
export { Davedapp, DavedappIDL }

// The programId is imported from the program IDL.
export const DAVEDAPP_PROGRAM_ID = new PublicKey(DavedappIDL.address)

// This is a helper function to get the Davedapp Anchor program.
export function getDavedappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...DavedappIDL, address: address ? address.toBase58() : DavedappIDL.address } as Davedapp, provider)
}

// This is a helper function to get the program ID for the Davedapp program depending on the cluster.
export function getDavedappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Davedapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return DAVEDAPP_PROGRAM_ID
  }
}
