import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { adminAuthMiddleware } from '../../../middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { submissionId, approved } = req.body;

    if (submissionId === undefined || approved === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update submission status
    const submission = await prisma.taskSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED'
      },
      include: {
        task: true
      }
    });

    // Jika disetujui, tambahkan points ke user
    if (approved) {
      await prisma.userPoints.create({
        data: {
          points: submission.task.points,
          activity: `Completed task: ${submission.task.title}`,
          user_id: submission.user_id
        }
      });
    }

    return res.status(200).json({ 
      success: true,
      submission: {
        id: submission.id,
        status: submission.status
      }
    });

  } catch (error) {
    console.error('Error handling approval:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminAuthMiddleware(handler); 