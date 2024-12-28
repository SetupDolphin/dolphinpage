import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, string>>({});
  
  useEffect(() => {
    fetchTasks();
    if (publicKey) {
      fetchSubmissionStatus();
    }
  }, [publicKey]);

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
      alert('Please connect your wallet first!');
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
        alert('Task submitted successfully! Waiting for admin approval.');
      }
    } catch (error) {
      console.error('Error handling task:', error);
      alert('Failed to complete task. Please try again.');
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
          alert('Please provide both screenshot and Twitter link');
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
            alert('Submission successful! Waiting for admin approval.');
            resolve(true);
          } else {
            alert(responseData.error || 'Failed to submit proof');
            resolve(false);
          }
        } catch (error) {
          console.error('Error submitting proof:', error);
          alert('Failed to submit proof. Please try again.');
          resolve(false);
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Airdrop Tasks</h1>
          <WalletMultiButton />
        </div>

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
                             submissions[task.id] === 'APPROVED'}
                    className={`mt-4 px-4 py-2 text-white rounded-md ${getButtonStyle(task.id)}`}
                  >
                    {getButtonText(task.id)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirdropPage;