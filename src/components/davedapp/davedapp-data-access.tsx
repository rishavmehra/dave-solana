'use client'

import { getDavedappProgram, getDavedappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { title } from 'process'
import { rpc } from '@coral-xyz/anchor/dist/cjs/utils'

interface CreateNotesArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useDavedappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDavedappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getDavedappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['davedapp', 'all', { cluster }],
    queryFn: () => program.account.notes.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })
  
  const createEntry  = useMutation<string, Error, CreateNotesArgs>({
    mutationKey: ['notes', 'create', { cluster }],
    mutationFn: async({title, message, owner }) =>{
      const [noteEntryAddress] = await PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
      return program.methods.initiliseNotes(title, message).rpc();
    },
    onSuccess: (signature) =>{
      transactionToast(signature);
      accounts.refetch();
    },
    onError(error) {
      toast.error(`error creating entry: ${error.message}`)
    }
  });

  return {
    program,
    accounts,
    programId,
    getProgramAccount,
    createEntry
  }
}

export function useDavedappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useDavedappProgram()

  const accountQuery = useQuery({
    queryKey: ['davedapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.notes.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateNotesArgs>({
    mutationKey: ["UpdateNotes", "update", {cluster}],
    mutationFn: async ({title, message}) => {
      return program.methods.initiliseUpdateNotes(title, message).rpc();
    },
  onSuccess: (signature) =>{
    transactionToast(signature)
    accounts.refetch();
  },
  onError: (error) => {
    toast.error(`Failed `)
  }
  })

  const deleteEntry = useMutation({
    mutationKey: ["UpdateNotes", "delete", {cluster, account}],
    mutationFn: (title: string) =>
      program.methods.initiliseDeleteNotes(title).rpc(),
    onSuccess: (tx) =>{
      transactionToast(tx);
      return accounts.refetch();
    }
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
