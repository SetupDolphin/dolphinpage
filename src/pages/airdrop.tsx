import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { verifyTwitterAction } from '../utils/twitterVerification';

// Dynamic import for WalletMultiButton
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
  task_type: string;
  verify_data: string;
  template?: string;
  claimed: boolean;
}

const AirdropPage: FC = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        // Jika user terkoneksi, cek status klaim untuk setiap task
        if (publicKey) {
          const claimStatuses = await fetch('/api/tasks/claim-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: publicKey.toString()
            })
          }).then(res => res.json());

          const formattedTasks = data.tasks.map((task: any) => ({
            ...task,
            claimed: claimStatuses[task.id] || false
          }));
          setTasks(formattedTasks);
        } else {
          setTasks(data.tasks.map((task: any) => ({ ...task, claimed: false })));
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Refresh tasks ketika wallet berubah
  useEffect(() => {
    fetchTasks();
  }, [publicKey]);

  // If component is not mounted, show placeholder
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Airdrop Tasks</h1>
            <div className="w-[200px] h-[40px] bg-gray-200 rounded-md"></div>
          </div>
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <h2 className="text-xl mb-4">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  const completeTask = async (taskId: number) => {
    try {
      if (!publicKey) {
        alert('Please connect your wallet first!');
        return;
      }

      const response = await fetch('/api/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          taskId,
          points: tasks.find(t => t.id === taskId)?.points || 0,
          activity: tasks.find(t => t.id === taskId)?.title
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state untuk menandai task sebagai claimed
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, claimed: true } : task
        ));
        alert('Task completed successfully!');
      } else {
        if (data.error === 'Task already claimed') {
          alert('You have already claimed this task!');
          // Update local state jika ternyata sudah diklaim
          setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, claimed: true } : task
          ));
        } else {
          alert('Failed to complete task: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  const verifyTwitterTask = async (task: Task) => {
    try {
      const response = await fetch('/api/verify-twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: task.task_type,
          verify_data: task.verify_data,
          template: task.template
        }),
      });

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Error verifying Twitter task:', error);
      return false;
    }
  };

  const handleTaskAction = async (task: Task) => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      console.log('Task:', task); // Debug log
      
      if (!task.task_type) {
        console.error('Task type is undefined for task:', task);
        return;
      }

      switch (task.task_type) {
        case 'WEBSITE_VISIT':
          const url = task.verify_data.startsWith('http') ? task.verify_data : `https://${task.verify_data}`;
          window.open(url.replace('localhost', window.location.hostname), '_blank');
          await completeTask(task.id);
          break;

        case 'TWITTER_FOLLOW':
          window.open(`https://twitter.com/intent/follow?screen_name=${task.verify_data.replace('@', '')}`, '_blank');
          await completeTask(task.id);
          break;
          
        case 'TWITTER_REPOST':
          window.open(`https://twitter.com/intent/retweet?tweet_id=${task.verify_data.split('/').pop()}`, '_blank');
          await completeTask(task.id);
          break;
          
        case 'TWITTER_TWEET':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(task.template || '')}`, '_blank');
          await completeTask(task.id);
          break;

        default:
          console.error('Unknown task type:', task.task_type);
      }
    } catch (error) {
      console.error('Error handling task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Airdrop Tasks</h1>
          <WalletMultiButton />
        </div>

        {!publicKey ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <h2 className="text-xl mb-4">Connect Your Wallet to Start</h2>
            <p className="text-gray-600">Complete tasks to earn points and rewards</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <p className="text-indigo-600 font-semibold mt-2">{task.points} Points</p>
                      
                      {!task.claimed ? (
                        <button
                          onClick={() => handleTaskAction(task)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {task.task_type === 'WEBSITE_VISIT' ? 'Visit Website' :
                           task.task_type === 'TWITTER_FOLLOW' ? 'Follow on Twitter' :
                           task.task_type === 'TWITTER_REPOST' ? 'Repost Tweet' :
                           task.task_type === 'TWITTER_TWEET' ? 'Post Tweet' :
                           'Complete Task'}
                        </button>
                      ) : (
                        <span className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-md">
                          Already Claimed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <h2 className="text-xl mb-4">Wanna more task?? Be chill</h2>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirdropPage;