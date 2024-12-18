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
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      // @ts-ignore
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p className="text-center text-xl text-gray-500">Connect your wallet</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Create a Note</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-4"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full mb-4"
      />
      <button
        className="btn w-full btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create Note {createEntry.isPending && "..."}
      </button>
    </div>
  );
}

export function DavedappList() {
  const { accounts, getProgramAccount } = useDavedappProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg mx-auto block"></span>;
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info text-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg mx-auto block"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.data?.map((account) => (
            <DavedappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Accounts</h2>
          <p className="text-gray-500">Create one above to get started.</p>
        </div>
      )}
    </div>
  );
}

function DavedappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useDavedappProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;
  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      // @ts-ignore
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p className="text-center text-xl text-gray-500">Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg mx-auto block" />
  ) : (
    <div className="card card-bordered border-base-300 shadow-lg rounded-lg text-neutral-content">
      <div className="card-body">
        <h2
          className="card-title text-center text-xl font-bold cursor-pointer"
          onClick={() => accountQuery.refetch()}
        >
          {accountQuery.data?.title}
        </h2>
        <p className="text-gray-600 text-center">{accountQuery.data?.message}</p>
        <div className="mt-4">
          <textarea
            placeholder="Update message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="textarea textarea-bordered w-full mb-4"
          />
          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={updateEntry.isPending || !isFormValid}
          >
            Update Note {updateEntry.isPending && "..."}
          </button>
        </div>
        <div className="mt-6 text-center">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
          />
        </div>
        <button
          className="btn btn-secondary btn-outline w-full mt-4"
          onClick={() => {
            if (
              !window.confirm(
                "Are you sure you want to close this account?"
              )
            ) {
              return;
            }
            const title = accountQuery.data?.title;
            if (title) {
              return deleteEntry.mutateAsync(title);
            }
          }}
        >
          Close Account
        </button>
      </div>
    </div>
  );
}
