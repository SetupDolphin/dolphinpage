import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import ReactDOM from "react-dom/client";
import { TopBar } from '../components/TopBar';
import { Navigation } from '../components/Navigation';
import { NewsBar } from '../components/NewsBar';

const WalletButton = dynamic(
  () => import('../components/WalletButton').then(mod => mod.WalletButton),
  { ssr: false }
);

// Import CodingChallenge secara dinamis untuk menghindari SSR issues
const CodingChallenge = dynamic(
  () => import('../components/CodingChallenge'),
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
  expected_output?: string;
  test_cases?: string;
}

const AirdropPage: FC = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, string>>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkWalletRegistration();
  }, [publicKey]);

  useEffect(() => {
    const handleWalletUpdate = () => {
      if (localStorage.getItem('walletConnected') === 'true') {
        checkWalletRegistration();
      }
    };

    window.addEventListener('walletUpdate', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdate', handleWalletUpdate);
  }, []);

  const checkWalletRegistration = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(false);
      const response = await fetch(`/api/auth/check-wallet/${publicKey.toString()}`);
      console.log('Test loading',response);
      const data = await response.json();

      if (!data.isRegistered) {
        // Redirect ke halaman register dengan wallet address sebagai parameter
        router.push(`/register?wallet=${publicKey.toString()}`);
      } else {
        setIsRegistered(true);
        fetchTasks();
        fetchSubmissionStatus();
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSubmissionStatus = async () => {
    try {
      const response = await fetch(`/api/submissions/status/${publicKey?.toString()}`);
      const data = await response.json();
      // Convert array ke object untuk lookup yang lebih mudah
      const statusMap = data.submissions.reduce((acc: Record<number, string>, sub: any) => {
        acc[sub.task_id] = sub.status;
        return acc;
      }, {});
      setSubmissions(statusMap);
    } catch (error) {
      console.error('Error fetching submission status:', error);
    }
  };

  const getButtonText = (taskId: number) => {
    const status = submissions[taskId];
    if (status === 'PENDING') return 'Pending Approval';
    if (status === 'APPROVED') return 'Claimed';
    if (status === 'REJECTED') return 'Rejected';
    return 'Claim Points';
  };

  const getButtonStyle = (taskId: number) => {
    const status = submissions[taskId];
    if (status === 'PENDING') return 'bg-yellow-600 cursor-not-allowed';
    if (status === 'APPROVED') return 'bg-green-600 cursor-not-allowed';
    if (status === 'REJECTED') return 'bg-red-600 cursor-not-allowed';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const handleTaskAction = async (task: Task) => {
    if (!publicKey) {
      Swal.fire('Please connect your wallet first!');
      return;
    }

    try {
      if (task.task_type === 'CODING_CHALLENGE') {
        const submitted = await handleCodingChallenge(task);
        if (submitted) {
          await fetchSubmissionStatus(); // Refresh status submission
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task submitted successfully!'
          });
        }
      } else if (task.task_type === 'WEBSITE_VISIT') {
        window.open(task.verify_data, '_blank');
      } else if (task.task_type.startsWith('TWITTER_')) {
        let twitterUrl = '';
        switch (task.task_type) {
          case 'TWITTER_FOLLOW':
            twitterUrl = `https://twitter.com/intent/follow?screen_name=${task.verify_data.replace('@', '')}`;
            break;
          case 'TWITTER_REPOST':
            twitterUrl = `https://twitter.com/intent/retweet?tweet_id=${task.verify_data.split('/').pop()}`;
            break;
          case 'TWITTER_TWEET':
            twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(task.template || '')}`;
            break;
        }
        window.open(twitterUrl, '_blank');
      }
    } catch (error) {
      console.error('Error handling task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to complete task. Please try again.'
      });
    }
  };

  const handleCodingChallenge = async (task: Task) => {
    return new Promise((resolve) => {
      Swal.fire({
        title: task.title,
        html: '<div id="coding-challenge-container"></div>',
        width: '80%',
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
          const handleSubmit = async (code: string) => {
            try {
              const formData = new FormData();
              formData.append('code', code);
              formData.append('taskId', task.id.toString());
              formData.append('walletAddress', publicKey?.toString() || '');

              const response = await fetch('/api/submit-coding-task', {
                method: 'POST',
                body: formData
              });

              if (response.ok) {
                Swal.close();
                resolve(true);
              } else {
                const data = await response.json();
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: data.error || 'Failed to submit solution'
                });
                resolve(false);
              }
            } catch (error) {
              console.error('Error submitting solution:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit solution'
              });
              resolve(false);
            }
          };

          // Render CodingChallenge component
          const container = document.getElementById('coding-challenge-container');
          if (container) {
            const root = ReactDOM.createRoot(container);
            root.render(<CodingChallenge task={task} onSubmit={handleSubmit} />);
          }
        }
      });
    });
  };

  if (!publicKey) {
    return (
      <div className="bg-black min-h-screen">
        <div className="flex flex-col min-h-screen">
          <TopBar />
          <Navigation />
          <NewsBar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="border-[#76E4F7] border-2 p-6 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-[#76E4F7] font-mono text-2xl mb-4">Connect Your Wallet</h2>
                <h4 className="text-[#76E4F7] font-mono text-2xl mb-4">Type "register" on terminal</h4>
                <WalletButton />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <Navigation />
        <NewsBar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="border-[#76E4F7] border-2 p-6 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-[#76E4F7] font-mono text-3xl">
                Airdrop Tasks
              </h1>
              <WalletButton />
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="border border-[#76E4F7] p-6 opacity-0"
                  style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${task.id * 150}ms`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <h3 className="text-[#76E4F7] font-mono text-xl">{task.title}</h3>
                      <p className="text-[#76E4F7]/80 font-mono mt-1">{task.description}</p>
                      <p className="text-[#76E4F7] font-mono mt-2">{task.points} Points</p>
                      
                      <button
                        onClick={() => handleTaskAction(task)}
                        disabled={submissions[task.id] === 'PENDING' || 
                                 submissions[task.id] === 'APPROVED' ||
                                 submissions[task.id] === 'REJECTED'}
                        className={`mt-4 px-4 py-2 font-mono border border-[#76E4F7] 
                          ${submissions[task.id] === 'PENDING' ? 'bg-[#76E4F7]/20 text-[#76E4F7] cursor-not-allowed' : 
                            submissions[task.id] === 'APPROVED' ? 'bg-[#76E4F7]/20 text-[#76E4F7] cursor-not-allowed' :
                            submissions[task.id] === 'REJECTED' ? 'bg-red-600/20 text-red-400 cursor-not-allowed' :
                            'text-[#76E4F7] hover:bg-[#76E4F7] hover:text-[#0F172A] transition-colors'}`}
                      >
                        {getButtonText(task.id)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AirdropPage;