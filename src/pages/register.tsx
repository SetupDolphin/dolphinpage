import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Swal from 'sweetalert2';
import Link from 'next/link';

const RegisterPage: FC = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referralCode: '',
    walletAddress: ''
  });
  const [step, setStep] = useState<'WALLET' | 'FORM' | 'OTP'>('WALLET');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && publicKey) {
      setFormData(prev => ({
        ...prev,
        walletAddress: publicKey.toString()
      }));
      setStep('FORM');
    }
  }, [mounted, publicKey]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('OTP');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        setStep('FORM');
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.message || 'Email already registered',
          background: '#000',
          color: '#76E4F7'
        });
      }
    } catch (error) {
      setStep('FORM');
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to register',
        background: '#000',
        color: '#76E4F7'
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      if (response.ok) {
        localStorage.setItem('username', `@${formData.username}`);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Registration successful',
          background: '#000',
          color: '#76E4F7'
        });
        router.push('/');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Invalid OTP',
          background: '#000',
          color: '#76E4F7'
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to verify OTP',
        background: '#000',
        color: '#76E4F7'
      });
    }
  };

  // Removed e.preventDefault() from this function
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const BaseLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="border-b border-[#76E4F7] p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 font-mono">
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
        {children}
      </div>
    </div>
  );

  if (step === 'WALLET') {
    return (
      <BaseLayout>
        <div className="border border-[#76E4F7] p-8 w-96 bg-black text-center">
          <h2 className="text-2xl font-mono text-[#76E4F7] mb-6">CONNECT WALLET</h2>
          <p className="mb-6 text-[#76E4F7]">Please connect your wallet to continue registration</p>
          <WalletMultiButton className="!bg-transparent !border !border-[#76E4F7] !text-[#76E4F7] hover:!bg-[#76E4F7] hover:text-[#0F172A] transition" />
        </div>
      </BaseLayout>
    );
  }

  if (step === 'OTP') {
    return (
      <BaseLayout>
        <div className="border border-[#76E4F7] p-8 w-96 bg-black">
          <h2 className="text-2xl font-mono text-[#76E4F7] mb-6">VERIFY EMAIL</h2>
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block text-[#76E4F7] mb-2 font-mono">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full border border-[#76E4F7] text-[#76E4F7] py-2 hover:bg-[#76E4F7] hover:text-[#0F172A] transition font-mono"
            >
              VERIFY
            </button>
          </form>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="border border-[#76E4F7] p-8 w-96 bg-black">
        <h2 className="text-2xl font-mono text-[#76E4F7] mb-6">REGISTER</h2>
        {formData.walletAddress && (
          <div className="mb-4 p-3 border border-[#76E4F7]">
            <label className="block text-[#76E4F7] mb-1 font-mono">Connected Wallet</label>
            <p className="text-sm text-[#76E4F7] break-all">{formData.walletAddress}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#76E4F7] mb-2 font-mono">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange(e, 'username')}
              className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
              required
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#76E4F7] mb-2 font-mono">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e, 'email')}
              className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
              required
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#76E4F7] mb-2 font-mono">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange(e, 'password')}
              className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#76E4F7] mb-2 font-mono">Referral Code (Optional)</label>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleInputChange(e, 'referralCode')}
              className="w-full p-2 bg-black border border-[#76E4F7] text-[#76E4F7] focus:outline-none focus:ring-1 focus:ring-[#76E4F7]"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-[#76E4F7] text-[#76E4F7] py-2 hover:bg-[#76E4F7] hover:text-[#0F172A] transition font-mono"
          >
            REGISTER
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default RegisterPage;