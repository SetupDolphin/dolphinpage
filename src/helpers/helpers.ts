export const getDeviceId = () => {
  // Implementasi device ID generation
  // Bisa menggunakan fingerprint.js atau metode lain
  return 'device-' + Math.random().toString(36).substr(2, 9);
};

export const saveWalletConnection = async (walletAddress: string, deviceId: string) => {
  // Implementasi penyimpanan ke database
  // Bisa menggunakan API call ke backend
  const response = await fetch('/api/wallet-connection', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, deviceId }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}; 

// export const getDeviceId = (): string => {
//   const storageKey = 'device_id';
//   let deviceId = localStorage.getItem(storageKey);
  
//   if (!deviceId) {
//     deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     localStorage.setItem(storageKey, deviceId);
//   }
  
//   return deviceId;
// } 