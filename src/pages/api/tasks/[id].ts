import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { adminAuthMiddleware } from '../../../middleware/adminAuth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Error deleting task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Wrap handler dengan middleware
export default adminAuthMiddleware(handler); 