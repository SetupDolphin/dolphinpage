import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Task {
  id?: number;
  title: string;
  description: string;
  points: number;
  taskType: string;
  verifyData: string;
  template?: string;
}

const AdminTasksPage: FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    description: '',
    points: 0,
    taskType: 'TWITTER_FOLLOW',
    verifyData: '',
    template: ''
  });
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
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        console.error('Invalid tasks data:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();

      if (response.ok && data.task) {
        setNewTask({ title: '', description: '', points: 0, taskType: 'TWITTER_FOLLOW', verifyData: '', template: '' });
        fetchTasks();
        alert('Task Successfully Added!');
      } else {
        alert(`Error: ${data.error || 'Terjadi kesalahan'}`);
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task.');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Quest Airdrop</h1>

        {/* Form Add Quest */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tambah Quest Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Poin</label>
                <input
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipe Task</label>
                <select
                  value={newTask.taskType}
                  onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="TWITTER_FOLLOW">Twitter Follow</option>
                  <option value="TWITTER_REPOST">Twitter Repost</option>
                  <option value="TWITTER_TWEET">Twitter Tweet Template</option>
                  <option value="WEBSITE_VISIT">Website Visit</option>
                  <option value="CODING_CHALLENGE">Coding Challenge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {newTask.taskType === 'TWITTER_FOLLOW' ? 'Username Twitter' :
                   newTask.taskType === 'TWITTER_REPOST' ? 'URL Tweet' :
                   newTask.taskType === 'TWITTER_TWEET' ? 'Template Tweet' :
                   'Website URL'}
                </label>
                <input
                  type="text"
                  value={newTask.verifyData}
                  onChange={(e) => setNewTask({ ...newTask, verifyData: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={
                    newTask.taskType === 'TWITTER_FOLLOW' ? '@username' :
                    newTask.taskType === 'TWITTER_REPOST' ? 'https://twitter.com/...' :
                    newTask.taskType === 'TWITTER_TWEET' ? 'Template tweet...' :
                    'https://example.com'
                  }
                  required
                />
              </div>

              {newTask.taskType === 'TWITTER_TWEET' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Tweet</label>
                  <textarea
                    value={newTask.template}
                    onChange={(e) => setNewTask({ ...newTask, template: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Template tweet yang harus dipost..."
                    required
                  />
                </div>
              )}

              {newTask.taskType === 'CODING_CHALLENGE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template Kode</label>
                    <textarea
                      value={newTask.template}
                      onChange={(e) => setNewTask({ ...newTask, template: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="// Tulis template kode di sini"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Test Cases (JSON)</label>
                    <textarea
                      value={newTask.test_cases}
                      onChange={(e) => setNewTask({ ...newTask, test_cases: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder='[{"input": [], "expected": "output"}]'
                      required
                    />
                  </div>
                </>
              )}
              
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Quest
              </button>
            </div>
          </form>
        </div>

        {/* List Quest */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">List Quest</h2>
            <div className="grid gap-4">
              {Array.isArray(tasks) && tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <p className="text-indigo-600 font-semibold mt-2">{task.points} Points</p>
                      </div>
                      <button
                        onClick={() => task.id && handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No quest added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTasksPage; 