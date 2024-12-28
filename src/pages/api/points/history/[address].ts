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

    // Ambil history points
    const history = await prisma.userPoints.findMany({
      where: {
        walletAddress: address
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching point history:', error);
    return res.status(500).json({ error: 'Error fetching point history' });
  }
} 