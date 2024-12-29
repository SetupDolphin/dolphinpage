import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        wallet_address: address as string
      }
    });

    return res.status(200).json({ 
      isRegistered: !!user,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email
      } : null
    });

  } catch (error) {
    console.error('Error checking wallet:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 