import React from 'react';
import '../styles/global.css';
import Head from 'next/head';
import { WalletContextProvider } from '../contexts/WalletProvider';

const App = ({ Component, pageProps }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClickAnywhere = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
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
        <main className="bg-light-background dark:bg-dark-background w-full h-full p-2">
          <Component {...pageProps} inputRef={inputRef} />
        </main>
      </div>
    </WalletContextProvider>
  );
};

export default App;
