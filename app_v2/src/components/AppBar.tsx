import { FC, useCallback } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature } from '@solana/web3.js';
import { useAutoConnect } from '../contexts/AutoConnectProvider';
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import NetworkSwitcher from './NetworkSwitcher';

export const AppBar: FC = props => {
  
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { balance, getUserSOLBalance } = useUserSOLBalanceStore();

  const onClick = useCallback(async () => {
    if (!publicKey) {
        console.log('error', 'Wallet not connected!');
        notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
        return;
    }

    let signature: TransactionSignature = '';

    try {
        signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(signature, 'confirmed');
        notify({ type: 'success', message: 'Airdrop successful!', txid: signature });

        getUserSOLBalance(publicKey, connection);
    } catch (error: any) {
        notify({ type: 'error', message: `Airdrop failed!`, description: error?.message, txid: signature });
        console.log('error', `Airdrop failed! ${error?.message}`, signature);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  return (
    <div>

      {/* NavBar / Header */}
      <div className="navbar flex flex-row md:mb-2 shadow-lg bg-neutral text-neutral-content">
        <div className="navbar-start">
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost">

            <svg className="inline-block w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        

          <div className="hidden sm:inline w-16 h-16 md:p-2.0">
            <img
              src="/logo.svg"
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>


        </div>

        {/* Nav Links */}
        {publicKey && <div className="hidden md:inline md:navbar-center">
          <div className="inline-flex justify-center">
            {publicKey && <p className='my-auto'>SOL Balance: {(balance || 0).toLocaleString()}</p>}
            <button
                className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 my-auto ml-4 bg-[#9c9c9c]"
                onClick={onClick}
            >
                <span>Airdrop 1 </span>
            </button>
          </div>
        </div>}

        {/* Wallet & Settings */}
        <div className="navbar-end">
          <WalletMultiButton className="btn btn-ghost mr-4" />

          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-square btn-ghost text-right">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <ul tabIndex={0} className="p-2 shadow menu dropdown-content bg-base-100 rounded-box sm:w-52">
              <li>
                <div className="form-control">
                  <label className="cursor-pointer label">
                    <a>Autoconnect</a>
                    <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} className="toggle" />
                  </label>

                  <NetworkSwitcher />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
};
