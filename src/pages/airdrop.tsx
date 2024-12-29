import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';

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
      // Buka link website atau Twitter sesuai tipe task
      if (task.task_type === 'WEBSITE_VISIT') {
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

      // Tampilkan modal untuk submit bukti
      const submitted = await handleTaskSubmission(task);
      if (submitted) {
        Swal.fire('Task submitted successfully! Waiting for admin approval.');
        window.location.reload(); // Refresh halaman setelah submit berhasil
      }
    } catch (error) {
      console.error('Error handling task:', error);
      Swal.fire('Failed to complete task. Please try again.');
    }
  };

  const handleTaskSubmission = async (task: Task) => {
    return new Promise((resolve) => {
      const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 class="text-lg font-bold mb-4">Submit Task Proof</h3>
            <p class="mb-4">Please provide the following:</p>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Twitter Link</label>
              <input type="text" id="twitter-link" class="w-full border p-2 rounded" 
                placeholder="https://twitter.com/..." />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Screenshot Proof</label>
              <input type="file" accept="image/*" class="w-full" id="proof-upload" />
              <p class="text-sm text-gray-500 mt-1">Please provide a screenshot of your action</p>
            </div>

            <div class="flex justify-end gap-2">
              <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onclick="closeModal()">Cancel</button>
              <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="submitProof()">Submit</button>
            </div>
          </div>
        </div>
      `;

      const modal = document.createElement('div');
      modal.innerHTML = modalHtml;
      document.body.appendChild(modal);

      (window as any).closeModal = () => {
        modal.remove();
        resolve(false);
      };

      (window as any).submitProof = async () => {
        const fileInput = document.getElementById('proof-upload') as HTMLInputElement;
        const twitterLink = (document.getElementById('twitter-link') as HTMLInputElement).value;
        const file = fileInput?.files?.[0];

        if (!file || !twitterLink) {
          Swal.fire('Please provide both screenshot and Twitter link');
          return;
        }

        const formData = new FormData();
        formData.append('proof', file);
        formData.append('twitterLink', twitterLink);
        formData.append('taskId', task.id.toString());
        formData.append('walletAddress', publicKey?.toString() || '');

        // Log data yang akan dikirim
        console.log('Sending data:', {
          file: file.name,
          twitterLink,
          taskId: task.id,
          walletAddress: publicKey?.toString()
        });

        try {
          const response = await fetch('/api/submit-task', {
            method: 'POST',
            body: formData
          });

          // Log response untuk debug
          console.log('Response status:', response.status);
          const responseData = await response.json();
          console.log('Response data:', responseData);

          if (response.ok) {
            modal.remove();
            Swal.fire('Submission successful! Waiting for admin approval.');
            window.location.reload(); // Refresh halaman setelah submit berhasil
            resolve(true);
          } else {
            Swal.fire(responseData.error || 'Failed to submit proof');
            resolve(false);
          }
        } catch (error) {
          console.error('Error submitting proof:', error);
          Swal.fire('Failed to submit proof. Please try again.');
          resolve(false);
        }
      };
    });
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-xl">Loading...</div>
  //     </div>
  //   );
  // }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {publicKey ? "Airdrop Tasks" : "Airdrop Tasks"}
          </h1>
          <WalletMultiButton />
        </div>

        {publicKey ? (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <p className="text-indigo-600 font-semibold mt-2">{task.points} Points</p>
                    
                    <button
                      onClick={() => handleTaskAction(task)}
                      disabled={submissions[task.id] === 'PENDING' || 
                               submissions[task.id] === 'APPROVED' ||
                               submissions[task.id] === 'REJECTED'}
                      className={`mt-4 px-4 py-2 text-white rounded-md ${getButtonStyle(task.id)}`}
                    >
                      {getButtonText(task.id)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">Please connect your wallet address to view tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirdropPage;