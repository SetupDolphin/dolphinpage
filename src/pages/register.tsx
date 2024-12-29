import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Swal from 'sweetalert2';

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

  // Mounted effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wallet effect
  useEffect(() => {
    if (mounted && publicKey) {
      setFormData(prev => ({
        ...prev,
        walletAddress: publicKey.toString()
      }));
      setStep('FORM');
    }
  }, [mounted, publicKey]);

  if (!mounted) {
    return null;
  }

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
          text: error.message || 'Email already registered'
        });
      }
    } catch (error) {
      setStep('FORM');
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to register'
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
          text: 'Registration successful'
        });
        router.push('/');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Invalid OTP'
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to verify OTP'
      });
    }
  };

  // Render functions setelah semua hooks
  if (step === 'WALLET') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h2 className="text-2xl font-bold mb-6">Connect Your Wallet</h2>
          <p className="mb-6 text-gray-600">Please connect your wallet to continue registration</p>
          <WalletMultiButton className="!bg-blue-600 !border-0 hover:!bg-blue-700" />
        </div>
      </div>
    );
  }

  if (step === 'OTP') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6">Verify Email</h2>
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Form registration
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {formData.walletAddress && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <label className="block text-gray-700 mb-1">Connected Wallet</label>
            <p className="text-sm text-gray-600 break-all">{formData.walletAddress}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Referral Code (Optional)</label>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 