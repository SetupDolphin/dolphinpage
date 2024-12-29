'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export const WalletButton = () => {
  const { connect, publicKey, disconnect, wallet, select } = useWallet();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkLoginAndWallet = async () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const registeredWallet = localStorage.getItem('registeredWallet');
      setIsLoggedIn(loggedIn);

      if (loggedIn && registeredWallet) {
        try {
          // Jika sudah login tapi wallet belum connect
          if (!publicKey) {
            console.log('Connecting wallet');
            await connect();
          } else if (publicKey.toString() !== registeredWallet) {
            // Jika wallet yang terkoneksi berbeda dengan yang terdaftar
            await disconnect();
            await connect();
          }
        } catch (error) {
          console.error('Auto-connect error:', error);
        }
      }
    };

    checkLoginAndWallet();

    // Listen untuk perubahan login status
    const handleStorage = () => {
      checkLoginAndWallet();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('walletUpdate', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('walletUpdate', handleStorage);
    };
  }, [connect, disconnect, publicKey]);

  if (!mounted) return null;

  return isLoggedIn ? (
    <WalletMultiButton className="!bg-transparent !border !border-[#76E4F7] !text-[#76E4F7] hover:!text-white" />
  ) : null;
}; 