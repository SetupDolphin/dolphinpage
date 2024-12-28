const fetch = require('node-fetch');

async function addTestPoints(walletAddress) {
  try {
    const response = await fetch('http://localhost:3001/api/points/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        points: 100,
        activity: 'Test Points Added'
      }),
    });
    
    const data = await response.json();
    console.log('Points added successfully:', data);
  } catch (error) {
    console.error('Error adding points:', error);
  }
}

// Contoh penggunaan:
// Ganti dengan wallet address yang ingin ditambahkan pointnya
const testWalletAddress = 'YOUR_WALLET_ADDRESS';
addTestPoints(testWalletAddress); 