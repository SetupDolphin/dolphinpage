import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser karena kita menggunakan formidable
  },
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse FormData menggunakan formidable
    const form = formidable();
    const [fields] = await form.parse(req);

    // Ekstrak data dari fields
    const code = fields.code?.[0];
    const taskId = parseInt(fields.taskId?.[0] || '');
    const walletAddress = fields.walletAddress?.[0];

    console.log('Received data:', {
      code,
      taskId,
      walletAddress
    });

    // Validasi input
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Code submission is required' });
    }

    // Ambil task dari database
    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verifikasi kode
    try {
      const testCases = JSON.parse(task.test_cases || '[]');
      let allTestsPassed = true;

      for (const testCase of testCases) {
        try {
          const userFunction = new Function(code);
          const result = userFunction(...(testCase.input || []));
          
          if (result !== testCase.expected) {
            allTestsPassed = false;
            break;
          }
        } catch (error) {
          console.error('Test case execution error:', error);
          allTestsPassed = false;
          break;
        }
      }

      if (!allTestsPassed) {
        return res.status(400).json({ error: 'Solution is incorrect' });
      }

      // Simpan submission
      await prisma.taskSubmission.create({
        data: {
          task: {
            connect: {
              id: taskId
            }
          },
          wallet_address: walletAddress,
          code: code,
          user: {
            connect: {
              wallet_address: walletAddress
            }
          },
          proof_image: '',
          twitter_link: '',
          status: 'APPROVED', // Otomatis approved karena sudah terverifikasi
        }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Test cases parsing error:', error);
      return res.status(400).json({ error: 'Invalid test cases format' });
    }
  } catch (error) {
    console.error('Error submitting coding task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 