import { sign, verify } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

interface TokenPayload {
  username: string;
  admin: boolean;
}

export const createToken = (payload: TokenPayload): string => {
  return sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return verify(token, JWT_CONFIG.SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}; 