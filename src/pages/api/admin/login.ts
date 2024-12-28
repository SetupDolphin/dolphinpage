import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { createToken } from '../../../utils/jwt';
import { JWT_CONFIG } from '../../../config/jwt';

// Idealnya credentials disimpan di environment variables
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'password123'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Verifikasi credentials
    if (
      username === ADMIN_CREDENTIALS.username && 
      password === ADMIN_CREDENTIALS.password
    ) {
      // Buat token
      const token = createToken({
        username,
        admin: true
      });

      // Set cookie dengan opsi keamanan
      res.setHeader('Set-Cookie', serialize(JWT_CONFIG.COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 jam
        path: '/',
      }));

      return res.status(200).json({ 
        success: true,
        message: 'Login Success'
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Username or password is wrong' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred during login' 
    });
  }
} 