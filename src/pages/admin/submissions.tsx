import { FC, useEffect, useState } from 'react';
import { adminAuthMiddleware } from '../../middleware/adminAuth';
import { useRouter } from 'next/router';

interface Submission {
  id: number;
  task_id: number;
  wallet_address: string;
  proof_image: string;
  twitter_link: string;
  status: string;
  created_at: string;
  task: {
    title: string;
    points: number;
  };
}

const AdminSubmissionsPage: FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const router = useRouter();
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ test: true }),
        });
        
        if (response.status === 401) {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, []);
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const response = await fetch('/api/admin/submissions');
    const data = await response.json();
    setSubmissions(data.submissions);
  };

  const handleApproval = async (submissionId: number, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/approve-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          approved,
        }),
      });

      if (response.ok) {
        fetchSubmissions(); // Refresh list
        alert(approved ? 'Submission approved!' : 'Submission rejected');
      }
    } catch (error) {
      console.error('Error handling approval:', error);
      alert('Failed to process approval');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Task Submissions</h1>
        
        <div className="bg-white rounded-lg shadow">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6 border-b">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{submission.task.title}</h3>
                  <p className="text-sm text-gray-500">
                    Wallet: {submission.wallet_address}
                  </p>
                  <p className="text-sm text-gray-500">
                    Points: {submission.task.points}
                  </p>
                  <a href={submission.twitter_link} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    View Twitter Post
                  </a>
                </div>
                
                <div className="flex items-start gap-4">
                  <img 
                    src={submission.proof_image}
                    alt="Proof" 
                    className="w-32 h-32 object-cover rounded"
                  />
                  
                  {submission.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval(submission.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(submission.id, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {submission.status !== 'PENDING' && (
                    <span className={`px-3 py-1 rounded ${
                      submission.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissionsPage; 