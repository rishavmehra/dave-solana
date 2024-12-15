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

export function useDavedappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDavedappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getDavedappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['davedapp', 'all', { cluster }],
    queryFn: () => program.account.davedapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['davedapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ davedapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useDavedappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useDavedappProgram()

  const accountQuery = useQuery({
    queryKey: ['davedapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.davedapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['davedapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ davedapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['davedapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ davedapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['davedapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ davedapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['davedapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ davedapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
