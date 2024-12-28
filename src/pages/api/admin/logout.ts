import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { JWT_CONFIG } from '../../../config/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear cookie
  res.setHeader('Set-Cookie', serialize(JWT_CONFIG.COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  }));

  return res.status(200).json({ 
    success: true,
    message: 'Logout Success' 
  });
} 