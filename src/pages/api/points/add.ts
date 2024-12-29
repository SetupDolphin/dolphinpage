import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../../middleware/auth';
import { validatePointsData } from '../../../utils/validation';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validasi input
    const { walletAddress, points, activity } = req.body;
    const validationResult = validatePointsData(req.body);
    
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    // Cek apakah wallet terdaftar
    const user = await prisma.user.findFirst({
      where: { wallet_address: walletAddress }
    });

    if (!user) {
      return res.status(404).json({ error: 'Wallet not registered' });
    }

    // Cek duplikasi transaksi
    const existingTransaction = await prisma.userPoints.findFirst({
      where: {
        walletAddress,
        activity,
        created_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 menit terakhir
        }
      }
    });

    if (existingTransaction) {
      return res.status(400).json({ error: 'Duplicate transaction detected' });
    }

    // Tambah points dengan transaction
    const result = await prisma.$transaction(async (prisma) => {
      const pointsEntry = await prisma.userPoints.create({
        data: {
          walletAddress,
          points,
          activity,
          transaction_hash: generateTransactionHash(), // Implement this
          ip_address: req.headers['x-forwarded-for'] as string,
          user_agent: req.headers['user-agent']
        }
      });

      // Log aktivitas
      await prisma.activityLog.create({
        data: {
          user_id: user.id,
          activity_type: 'POINTS_ADDED',
          details: JSON.stringify({
            points,
            activity,
            transaction_id: pointsEntry.id
          })
        }
      });

      return pointsEntry;
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Points addition error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler); 