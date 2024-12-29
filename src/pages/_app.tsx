import React from 'react';
import '../styles/global.css';
import Head from 'next/head';
import { WalletContextProvider } from '../contexts/WalletProvider';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
require('@solana/wallet-adapter-react-ui/styles.css');

const App = ({ Component, pageProps, inputRef, onClickAnywhere }) => {
  const [mounted, setMounted] = React.useState(false);
  
  // Inisialisasi wallet
  const wallets = [new PhantomWalletAdapter()];
  const endpoint = clusterApiUrl('devnet'); // atau mainnet sesuai kebutuhan

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            <Head>
              <meta
                name="viewport"
                content="initial-scale=1.0, width=device-width"
                key="viewport"
                maximum-scale="1"
              />
            </Head>

            <div
              className="text-light-foreground dark:text-dark-foreground min-w-max text-xs md:min-w-full md:text-base"
              onClick={onClickAnywhere}
            >
              <main className="">
                <Component {...pageProps} inputRef={inputRef} />
              </main>
            </div>
          </WalletContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
