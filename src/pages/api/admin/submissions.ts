import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { adminAuthMiddleware } from '../../../middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submissions = await prisma.taskSubmission.findMany({
      orderBy: {
        created_at: 'desc'
      },
      include: {
        task: {
          select: {
            title: true,
            points: true
          }
        }
      }
    });

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Wrap dengan adminAuthMiddleware untuk memastikan hanya admin yang bisa akses
export default adminAuthMiddleware(handler); 