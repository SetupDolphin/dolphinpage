import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, taskId, points, activity } = req.body;

    if (!walletAddress || !taskId || !points || !activity) {
      return res.status(400).json({ 
        error: 'Wallet address, task ID, points, and activity are required' 
      });
    }

    // Cek apakah task sudah diklaim
    const existingClaim = await prisma.taskClaim.findUnique({
      where: {
        wallet_address_task_id: {
          wallet_address: walletAddress,
          task_id: taskId
        }
      }
    });

    if (existingClaim) {
      return res.status(400).json({ 
        error: 'Task already claimed' 
      });
    }

    // Buat klaim baru dan tambahkan points dalam satu transaksi
    const [claim, userPoints] = await prisma.$transaction([
      prisma.taskClaim.create({
        data: {
          wallet_address: walletAddress,
          task_id: taskId
        }
      }),
      prisma.userPoints.create({
        data: {
          walletAddress,
          points,
          activity
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      claim,
      userPoints
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return res.status(500).json({ error: 'Error adding points' });
  }
} 