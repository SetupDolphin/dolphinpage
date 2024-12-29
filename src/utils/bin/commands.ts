// List of commands that do not require API calls

import * as bin from './index';
import config from '../../../config.json';
import { getDeviceId, saveWalletConnection } from '../../helpers/helpers';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import ReactDOM from 'react-dom';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Daftar command yang tersedia sebelum login
const publicCommands = ['help', 'login', 'register', 'clear'];

// Help command yang menampilkan command sesuai status login
export const help = async (args: string[]): Promise<string> => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Filter commands berdasarkan status login
  const availableCommands = Object.keys(bin).sort().filter(cmd => {
    if (isLoggedIn) return true;
    return publicCommands.includes(cmd);
  });

  let c = '';
  for (let i = 1; i <= availableCommands.length; i++) {
    if (i % 7 === 0) {
      c += availableCommands[i - 1] + '\n';
    } else {
      c += availableCommands[i - 1] + ' ';
    }
  }

  if (!isLoggedIn) {
    return `Welcome! Available commands before login:
\n${c}\n
[tab]: trigger completion.
[ctrl+l]/clear: clear terminal.\n
Please login first using 'login <username> <password>'`;
  }

  return `Welcome! Here are all the available commands:
\n${c}\n
[tab]: trigger completion.
[ctrl+l]/clear: clear terminal.\n
Type 'sumfetch' to display summary.`;
};

// Wrapper untuk command yang memerlukan login
const requireLogin = (cmd: Function) => async (args: string[]): Promise<string> => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return 'Please login first using "login <username> <password>"';
  }
  return cmd(args);
};

// Redirection
export const repo = async (args: string[]): Promise<string> => {
  window.open(`${config.repo}`);
  return 'Opening Github repository...';
};

// About
export const about = requireLogin(async (args: string[]): Promise<string> => {
  return `Hi, I am ${config.name}...`;
});

export const resume = async (args: string[]): Promise<string> => {
  window.open(`${config.resume_url}`);
  return 'Opening resume...';
};

// Donate
export const donate = async (args: string[]): Promise<string> => {
  return `thank you for your interest. 
here are the ways you can support my work:
- <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.donate_urls.paypal}" target="_blank">paypal</a></u>
- <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.donate_urls.patreon}" target="_blank">patreon</a></u>
`;
};

// Contact
export const email = async (args: string[]): Promise<string> => {
  window.open(`mailto:${config.email}`);
  return `Opening mailto:${config.email}...`;
};

export const github = async (args: string[]): Promise<string> => {
  window.open(`https://github.com/${config.social.github}/`);

  return 'Opening github...';
};

export const linkedin = async (args: string[]): Promise<string> => {
  window.open(`https://www.linkedin.com/in/${config.social.linkedin}/`);

  return 'Opening linkedin...';
};

// Search
export const google = async (args: string[]): Promise<string> => {
  window.open(`https://google.com/search?q=${args.join(' ')}`);
  return `Searching google for ${args.join(' ')}...`;
};

export const duckduckgo = async (args: string[]): Promise<string> => {
  window.open(`https://duckduckgo.com/?q=${args.join(' ')}`);
  return `Searching duckduckgo for ${args.join(' ')}...`;
};

export const bing = async (args: string[]): Promise<string> => {
  window.open(`https://bing.com/search?q=${args.join(' ')}`);
  return `Wow, really? You are using bing for ${args.join(' ')}?`;
};

export const reddit = async (args: string[]): Promise<string> => {
  window.open(`https://www.reddit.com/search/?q=${args.join(' ')}`);
  return `Searching reddit for ${args.join(' ')}...`;
};

// Typical linux commands
export const echo = async (args: string[]): Promise<string> => {
  return args.join(' ');
};

export const whoami = async (args: string[]): Promise<string> => {
  return `${config.ps1_username}`;
};

export const ls = async (args: string[]): Promise<string> => {
  return `a
bunch
of
fake
directories`;
};

export const cd = async (args: string[]): Promise<string> => {
  return `unfortunately, i cannot afford more directories.
if you want to help, you can type 'donate'.`;
};

export const date = async (args: string[]): Promise<string> => {
  return new Date().toString();
};

export const vi = async (args: string[]): Promise<string> => {
  return `woah, you still use 'vi'? just try 'vim'.`;
};

export const submitsol = async (args: string[]): Promise<string> => {
  return `woah, you still use 'vi'? just try 'vim'.`;
};

export const vim = async (args: string[]): Promise<string> => {
  return `'vim' is so outdated. how about 'nvim'?`;
};

export const nvim = async (args: string[]): Promise<string> => {
  return `'nvim'? too fancy. why not 'emacs'?`;
};

export const emacs = async (args?: string[]): Promise<string> => {
  return `you know what? just use vscode.`;
};

export const sudo = async (args?: string[]): Promise<string> => {
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank'); // ...I'm sorry
  return `Permission denied: with little power comes... no responsibility? `;
};

// Banner
export const banner = (args?: string[]): string => {
  return `
d8888b.  .d88b.  db      d888888b d88888b d8888b. .88b  d88. 
88  '8D .8P  Y8. 88      '~~88~~' 88      88  '8D 88'YbdP'88 
88   88 88    88 88         88    88ooooo 88oobY' 88  88  88 
88   88 88    88 88         88    88~~~~~ 88'8b   88  88  88 
88  .8D '8b  d8' 88booo.    88    88.     88 '88. 88  88  88 
Y8888D'  'Y88P'  Y88888P    YP    Y88888P 88   YD YP  YP  YP 
                                                             
                                                             

Type 'help' to see the list of available commands.
Type 'sumfetch' to display summary.
Type 'repo' or click <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.repo}" target="_blank">here</a></u> for the Github repository.
`;
};

// Airdrop command
export const airdrop = requireLogin(async (args: string[]): Promise<string> => {
  try {
    // Use router.push for navigation
    window.location.replace('/airdrop');
    // Or you can use:
    // window.location.href = '/airdrop';
    
    return 'Redirecting to Airdrop page...';
  } catch (err) {
    console.error('Navigation error:', err);
    return 'Failed to navigate to Airdrop page. Please try again.';
  }
});

export const register = async (args: string[]): Promise<string> => {
  try {
    // Use router.push for navigation
    window.location.replace('/register');
    // Or you can use:
    // window.location.href = '/airdrop';
    
    return 'Redirecting to Register page...';
  } catch (err) {
    console.error('Navigation error:', err);
    return 'Failed to navigate to Register page. Please try again.';
  }
}

// Points history command
export const points = requireLogin(async (args: string[]): Promise<string> => {
  if (!window.solana?.isConnected) {
    return 'Please connect your wallet first!';
  }
  
  window.open(`${config.points_history_url}`);
  return 'Opening Points History page...';
});

// Profile command
export const profile = requireLogin(async (args: string[]): Promise<string> => {
  if (!window.solana?.isConnected) {
    return 'Please connect your wallet first!';
  }
  
  window.open(`${config.profile_url}`);
  return 'Opening Profile page...';
});

// Login command
export const login = async (args: string[]): Promise<string> => {
  if (args.length < 2) {
    return `Usage: login (username) (password)`;
  }

  const [username, password] = args;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    // Tambahkan log untuk debug response
    console.log('Login Response:', await response.clone().json());

    if (response.ok) {
      const data = await response.json();
      
      // Log data yang diterima
      console.log('Login Data:', data);
      
      // Simpan data dengan username yang benar
      localStorage.setItem('username', data.username);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('registeredWallet', data.wallet_address);
      localStorage.setItem('authToken', data.token);

      // Log localStorage setelah disimpan
      console.log('LocalStorage after login:', {
        username: localStorage.getItem('username'),
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        registeredWallet: localStorage.getItem('registeredWallet')
      });

      // Trigger custom event untuk update username
      window.dispatchEvent(new CustomEvent('usernameUpdate', {
        detail: { username: data.username }
      }));
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));

      // Auto connect wallet jika wallet address terdaftar
      const wallet = window.solana;
      if (wallet && data.wallet_address) {
        try {
          await wallet.connect();
          const currentWallet = wallet.publicKey.toString();
          
          if (currentWallet === data.wallet_address) {
            localStorage.setItem('walletConnected', 'true');
            window.dispatchEvent(new Event('walletUpdate'));
            return `Login successful! Welcome back ${data.username}. Wallet auto-connected.`;
          } else {
            await wallet.disconnect();
            return `Login successful! Welcome back ${data.username}. Please connect wallet: ${data.wallet_address}`;
          }
        } catch (error) {
          return `Login successful! Welcome back ${data.username}. Please connect your registered wallet: ${data.wallet_address}`;
        }
      }
      
      return `Login successful! Welcome back ${data.username}. Please connect your registered wallet: ${data.wallet_address}`;
    } else {
      return 'Invalid username or password';
    }
  } catch (error) {
    console.error('Login error:', error);
    return 'Login failed. Please try again.';
  }
};

// Logout command
export const logout = async (args: string[]): Promise<string> => {
  const wallet = window.solana;
  if (wallet?.isConnected) {
    await wallet.disconnect();
  }
  
  // Clear localStorage
  localStorage.clear();
  
  // Trigger storage event untuk update UI
  window.dispatchEvent(new Event('storage'));
  
  // Force reload untuk memastikan semua state ter-reset
  setTimeout(() => {
    window.location.reload();
  }, 500);
  
  return 'Logged out successfully';
};

// Connect wallet command
export const connect = requireLogin(async (args: string[]): Promise<string> => {
  const wallet = window.solana;
  const registeredWallet = localStorage.getItem('registeredWallet');
  const authToken = localStorage.getItem('authToken');
  
  if (!localStorage.getItem('isLoggedIn')) {
    return 'Please login first using "login" command';
  }

  if (!wallet) {
    return 'Please install Phantom wallet';
  }

  try {
    await wallet.connect();
    const currentWallet = wallet.publicKey.toString();

    if (registeredWallet && currentWallet !== registeredWallet) {
      await wallet.disconnect();
      return `Please connect with your registered wallet address: ${registeredWallet}`;
    }

    // Update global wallet state
    localStorage.setItem('walletConnected', 'true');
    
    // Trigger wallet update event
    window.dispatchEvent(new Event('walletUpdate'));
    
    // Update wallet connection di server
    await fetch('/api/auth/update-wallet-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ wallet: currentWallet })
    });

    return 'Wallet connected successfully';
  } catch (error) {
    return 'Failed to connect wallet. Please try again.';
  }
});
