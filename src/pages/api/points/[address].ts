import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Hitung total points
    const result = await prisma.userPoints.aggregate({
      where: {
        walletAddress: address
      },
      _sum: {
        points: true
      }
    });

    return res.status(200).json({ 
      totalPoints: result._sum.points || 0 
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    return res.status(500).json({ error: 'Error fetching points' });
  }
} 