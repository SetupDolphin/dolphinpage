import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Task {
  id?: number;
  title: string;
  description: string;
  points: number;
  taskType: string;
  verifyData: string;
  template?: string;
  test_cases?: string;
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
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="border-b border-[#76E4F7] p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
          <Link href="/">
            <a className="border border-[#76E4F7] text-[#76E4F7] px-4 py-1 hover:bg-[#76E4F7] hover:text-[#0F172A] transition">
              HOME
            </a>
          </Link>
          </div>
          <div className="flex space-x-4">
            <button className="border border-[#76E4F7] text-[#76E4F7] px-4 py-1 hover:bg-[#76E4F7] hover:text-[#0F172A] transition">
              X / TWITTER
            </button>
            <button className="border border-[#76E4F7] text-[#76E4F7] px-4 py-1 hover:bg-[#76E4F7] hover:text-[#0F172A] transition">
              TELEGRAM
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-mono text-[#76E4F7] mb-8">MANAGE QUEST AIRDROP</h1>

          {/* Form Add Quest */}
          <div className="border border-[#76E4F7] p-6 mb-8 bg-black">
            <h2 className="text-xl font-mono text-[#76E4F7] mb-6">ADD NEW QUEST</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div>
                  <label className="block text-[#76E4F7] mb-2 font-mono">TITLE</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#76E4F7] mb-2 font-mono">DESCRIPTION</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#76E4F7] mb-2 font-mono">POINTS</label>
                  <input
                    type="number"
                    value={newTask.points}
                    onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                    className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#76E4F7] mb-2 font-mono">TASK TYPE</label>
                  <select
                    value={newTask.taskType}
                    onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                    className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                  >
                    <option value="TWITTER_FOLLOW">Twitter Follow</option>
                    <option value="TWITTER_REPOST">Twitter Repost</option>
                    <option value="TWITTER_TWEET">Twitter Tweet Template</option>
                    <option value="WEBSITE_VISIT">Website Visit</option>
                    <option value="CODING_CHALLENGE">Coding Challenge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#76E4F7] mb-2 font-mono">
                    {newTask.taskType === 'TWITTER_FOLLOW' ? 'TWITTER USERNAME' :
                     newTask.taskType === 'TWITTER_REPOST' ? 'TWEET URL' :
                     newTask.taskType === 'TWITTER_TWEET' ? 'TWEET TEMPLATE' :
                     'WEBSITE URL'}
                  </label>
                  <input
                    type="text"
                    value={newTask.verifyData}
                    onChange={(e) => setNewTask({ ...newTask, verifyData: e.target.value })}
                    className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                    required
                  />
                </div>

                {newTask.taskType === 'TWITTER_TWEET' && (
                  <div>
                    <label className="block text-[#76E4F7] mb-2 font-mono">TWEET TEMPLATE</label>
                    <textarea
                      value={newTask.template}
                      onChange={(e) => setNewTask({ ...newTask, template: e.target.value })}
                      className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                      required
                    />
                  </div>
                )}

                {newTask.taskType === 'CODING_CHALLENGE' && (
                  <>
                    <div>
                      <label className="block text-[#76E4F7] mb-2 font-mono">CODE TEMPLATE</label>
                      <textarea
                        value={newTask.template}
                        onChange={(e) => setNewTask({ ...newTask, template: e.target.value })}
                        className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#76E4F7] mb-2 font-mono">TEST CASES (JSON)</label>
                      <textarea
                        value={newTask.test_cases}
                        onChange={(e) => setNewTask({ ...newTask, test_cases: e.target.value })}
                        className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                        required
                      />
                    </div>
                  </>
                )}
                
                <button
                  type="submit"
                  className="w-full border border-[#76E4F7] text-[#76E4F7] py-2 hover:bg-[#76E4F7] hover:text-[#0F172A] font-mono"
                >
                  ADD QUEST
                </button>
              </div>
            </form>
          </div>

          {/* List Quest */}
          <div className="border border-[#76E4F7] bg-black">
            <div className="p-6">
              <h2 className="text-xl font-mono text-[#76E4F7] mb-6">QUEST LIST</h2>
              <div className="grid gap-4">
                {Array.isArray(tasks) && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="border border-[#76E4F7] p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-mono text-[#76E4F7]">{task.title}</h3>
                          <p className="text-[#76E4F7] opacity-80 mt-1">{task.description}</p>
                          <p className="text-[#76E4F7] font-mono mt-2">{task.points} POINTS</p>
                        </div>
                        <button
                          onClick={() => task.id && handleDelete(task.id)}
                          className="border border-red-500 text-red-500 px-4 py-1 hover:bg-red-500 hover:text-[#0F172A] font-mono"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#76E4F7] text-center py-4 font-mono">NO QUESTS ADDED YET</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTasksPage;