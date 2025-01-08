import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AdminLoginPage: FC = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        router.push('/admin/tasks');
      } else {
        setError('Username or password is wrong');
      }
    } catch (error) {
      setError('An error occurred during login');
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

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="border border-[#76E4F7] p-8 w-96 bg-black">
          <h2 className="text-2xl font-mono text-[#76E4F7] mb-6 text-center">
            ADMIN LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-500 p-3 bg-black">
                <div className="text-sm text-red-500 font-mono">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-[#76E4F7] mb-2 font-mono">
                  USERNAME
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7] placeholder-[#76E4F7] placeholder-opacity-50"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[#76E4F7] mb-2 font-mono">
                  PASSWORD
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7] placeholder-[#76E4F7] placeholder-opacity-50"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full border border-[#76E4F7] text-[#76E4F7] py-2 hover:bg-[#76E4F7] hover:text-[#0F172A] transition font-mono mt-6"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;