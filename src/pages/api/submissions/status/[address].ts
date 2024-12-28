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

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        wallet_address: address as string
      },
      select: {
        task_id: true,
        status: true
      }
    });

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error('Error fetching submission status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 