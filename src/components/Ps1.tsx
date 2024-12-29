import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import config from '../../config.json';

export const Ps1 = () => {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState(config.ps1_username);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Set initial username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Listen untuk event storage
    const handleStorage = () => {
      const newUsername = localStorage.getItem('username');
      if (newUsername) {
        setUsername(newUsername);
      }
    };

    // Listen untuk custom event username update
    const handleUsernameUpdate = (event: CustomEvent) => {
      const newUsername = event.detail.username;
      if (newUsername) {
        setUsername(newUsername);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('usernameUpdate', handleUsernameUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('usernameUpdate', handleUsernameUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      if (!publicKey) {
        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername || config.ps1_username);
        return;
      }

      try {
        const response = await fetch(`/api/auth/check-wallet?wallet=${publicKey.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const formattedUsername = data.username.startsWith('@') 
            ? data.username 
            : `@${data.username}`;
          setUsername(formattedUsername);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
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
