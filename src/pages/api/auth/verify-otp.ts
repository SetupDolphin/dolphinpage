import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sign } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body;

    // Cari OTP yang valid
    const validOTP = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (!validOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update user status
    const user = await prisma.user.update({
      where: { email },
      data: { is_verified: true }
    });

    // Hapus OTP yang sudah digunakan
    await prisma.oTP.delete({
      where: { id: validOTP.id }
    });

    // Generate JWT token
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly`);

    return res.status(200).json({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 