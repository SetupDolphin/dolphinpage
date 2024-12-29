import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';

// Import WalletMultiButton secara dynamic untuk menghindari SSR issues
const WalletButton = dynamic(
  () => import('../components/WalletButton').then(mod => mod.WalletButton),
  { ssr: false }
);

interface PointHistory {
  id: number;
  points: number;
  activity: string;
  created_at: string; // Sesuaikan dengan schema Prisma
}

const PointsPage: FC = () => {
  const { publicKey } = useWallet();
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<PointHistory[]>([]);

  useEffect(() => {
    const handleWalletUpdate = () => {
      if (localStorage.getItem('walletConnected') === 'true') {
        fetchPoints();
        fetchHistory();
      }
    };

    window.addEventListener('walletUpdate', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdate', handleWalletUpdate);
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`/api/points/${publicKey?.toString()}`);
      const data = await response.json();
      setPoints(data.totalPoints);
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/points/history/${publicKey?.toString()}`);
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Points Dashboard</h1>
          <WalletButton />
        </div>

        {publicKey ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl mb-2 text-gray-700">Total Points</h2>
              <p className="text-4xl font-bold text-indigo-600">{points}</p>
            </div>

            <div className="bg-white rounded-lg shadow">
              <h2 className="text-xl p-6 border-b">Point History</h2>
              <div className="divide-y">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className="p-6 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{item.activity}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`font-bold ${item.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-gray-500">No point history yet</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">Please connect your wallet to view points</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsPage; 