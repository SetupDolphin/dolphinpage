import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet as string
      },
      select: {
        username: true
      }
    });

    if (user) {
      return res.status(200).json({ username: user.username });
    }

    return res.status(404).json({ error: 'User not found' });

  } catch (error) {
    console.error('Error checking wallet:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 