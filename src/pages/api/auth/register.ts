import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateOTP, sendOTPEmail } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, referralCode } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Generate referral code unik
    const newReferralCode = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        referral_code: newReferralCode,
        referred_by: referralCode || null,
        wallet_address: req.body.walletAddress || null
      }
    });

    // Generate dan simpan OTP
    const otp = generateOTP();
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 menit
      }
    });

    // Kirim OTP ke email
    await sendOTPEmail(email, otp);

    return res.status(201).json({ 
      message: 'Registration successful. Please check your email for OTP.',
      userId: user.id 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 