import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

const rateLimits: { [key: string]: { count: number; timestamp: number } } = {};

async function checkRateLimit(key: string): Promise<number> {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit

  if (!rateLimits[key] || now - rateLimits[key].timestamp > windowMs) {
    rateLimits[key] = { count: 1, timestamp: now };
    return 1;
  }

  rateLimits[key].count++;
  return rateLimits[key].count;
}

export function authMiddleware(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Cek token dari header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verifikasi token
      const decoded = verify(token, process.env.JWT_SECRET!);
      req.user = decoded;

      // Rate limiting check
      const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const rateLimitKey = `${userIp}:${req.url}`;
      
      // Implementasi rate limiting menggunakan Redis atau memory cache
      const requestCount = await checkRateLimit(rateLimitKey);
      if (requestCount > 100) { // 100 requests per 15 minutes
        return res.status(429).json({ error: 'Too many requests' });
      }

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
} 