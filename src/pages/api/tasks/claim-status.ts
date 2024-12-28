import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Ambil semua klaim untuk wallet address ini
    const claims = await prisma.taskClaim.findMany({
      where: {
        wallet_address: walletAddress
      },
      select: {
        task_id: true
      }
    });

    // Buat object dengan task_id sebagai key dan true sebagai value
    const claimStatus = claims.reduce((acc, claim) => ({
      ...acc,
      [claim.task_id]: true
    }), {});

    return res.status(200).json(claimStatus);
  } catch (error) {
    console.error('Error fetching claim status:', error);
    return res.status(500).json({ error: 'Error fetching claim status' });
  }
} 