import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import config from '../../config.json';

export const Ps1 = () => {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState(config.ps1_username);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      if (!publicKey) {
        // Jika tidak ada wallet yang terkoneksi, gunakan default username
        setUsername(config.ps1_username);
        return;
      }

      try {
        const response = await fetch(`/api/auth/check-wallet?wallet=${publicKey.toString()}`);
        if (response.ok) {
          const data = await response.json();
          // Pastikan username memiliki format @username
          const formattedUsername = data.username.startsWith('@') 
            ? data.username 
            : `@${data.username}`;
          setUsername(formattedUsername);
          // Simpan ke localStorage untuk persistence
          localStorage.setItem('username', formattedUsername);
        } else {
          // Jika user tidak ditemukan, gunakan default
          setUsername(config.ps1_username);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername(config.ps1_username);
      }
    };

    if (mounted) {
      checkWallet();
    }
  }, [publicKey, mounted]);

  if (!mounted) return null;

  return (
    <div>
      <span className="text-light-yellow dark:text-dark-yellow">
        {username}
      </span>
      <span className="text-light-gray dark:text-dark-gray">@</span>
      <span className="text-light-green dark:text-dark-green">
        {config.ps1_hostname}
      </span>
      <span className="text-light-gray dark:text-dark-gray">:$ ~ </span>
    </div>
  );
};

export default Ps1;
