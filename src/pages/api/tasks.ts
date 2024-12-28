import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { adminAuthMiddleware } from '../../middleware/adminAuth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const tasks = await prisma.task.findMany({
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json({ tasks: tasks });
    } 
    
    else if (req.method === 'POST') {
      const { 
        title, 
        description, 
        points, 
        taskType, 
        verifyData,
        template 
      } = req.body;
      
      // Validasi input
      if (!title || !description || points === undefined || !taskType || !verifyData) {
        return res.status(400).json({ 
          error: 'Title, description, points, taskType, and verifyData are required' 
        });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          points: Number(points),
          task_type: taskType,
          verify_data: verifyData,
          template: template || null,
        },
      });
      
      return res.status(201).json({ task });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return adminAuthMiddleware(handler)(req, res);
  }
  return handler(req, res);
}; 