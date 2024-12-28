import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../utils/jwt';
import { JWT_CONFIG } from '../config/jwt';

export function adminAuthMiddleware(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.cookies[JWT_CONFIG.COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'Token not found' 
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded || !decoded.admin) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
        });
      }

      // Added user to request
      (req as any).user = decoded;

      return handler(req, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }
  };
} 