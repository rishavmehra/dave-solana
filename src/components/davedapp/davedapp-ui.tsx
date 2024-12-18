'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useDavedappProgram, useDavedappProgramAccount } from './davedapp-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function DavedappCreate() {
  const { createEntry } = useDavedappProgram();
  const { publicKey } = useWallet();
  const [ title, setTitle ] = useState("");
  const [ message, setMessage ] = useState("");
  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = () =>{
    if (publicKey && isFormValid) {
      // @ts-ignore
      createEntry.mutateAsync({title, message ,owner: publicKey });
    }
  };

  if (!publicKey){
    return <p>Connect your wallet</p>
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        // @ts-ignore
        onChange={(e)=>setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        placeholder="Message"
        value={message}
        // @ts-ignore
        onChange={(e)=>setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <br/>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create Note {createEntry.isPending && "..."}
      </button>
    </div>
  )

}

export function DavedappList() {
  const { accounts, getProgramAccount } = useDavedappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <DavedappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function DavedappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry} = useDavedappProgramAccount({
    account,
  })

  const {publicKey}  = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSubmit = () =>{
    if (publicKey && isFormValid) {
      // @ts-ignore
      updateEntry.mutateAsync({title, message ,owner: publicKey });
    }
  };

  if (!publicKey){
    return <p>Connect your wallet</p>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner  loading-lg" />
  ): (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
            <h2
              className="card-title justify-center text-3xl cursor-pointer"
              onClick={()=>accountQuery.refetch}
            >
              {accountQuery.data?.title}
            </h2>
            <p>{accountQuery.data?.message}</p>
            <div className='card-actions justify-around'>
              <textarea
                placeholder="update message here"
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
              />
              <button
                className='btn btn-xs lg:btn-xs btn-primary'
                onClick={handleSubmit}
                disabled={updateEntry.isPending || !isFormValid}
              >
              update Note {updateEntry.isPending&& "..."}
              </button>
            </div>
            <div className='text-center space-y-4'>
              <p>
                <ExplorerLink
                  path={`account/${account}`}
                  label={ellipsify(account.toString())}
                />
              </p>
              <button
                className='btn btn-xs btn-secondary btn-outline'
                onClick={()=>{
                  if (
                    !window.confirm(
                      "Are you sure want to close this account?"
                    )
                  ){
                    return;
                  }
                  const title = accountQuery.data?.title;
                  if (title){
                    return deleteEntry.mutateAsync(title)
                  }
                }}
              >
                Close
              </button>
            </div>
        </div> 
      </div>
    </div>
  )

}
