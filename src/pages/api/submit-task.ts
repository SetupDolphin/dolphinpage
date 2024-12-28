import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

const convertToBase64 = async (filePath: string): Promise<string> => {
  try {
    const data = await fs.readFile(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    console.log('Fields received:', fields);
    console.log('Files received:', files);
    
    const proofFile = files.proof?.[0];
    const taskId = fields.taskId?.[0];
    const walletAddress = fields.walletAddress?.[0];
    const twitterLink = fields.twitterLink?.[0];

    if (!proofFile || !taskId || !walletAddress || !twitterLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Cek apakah user sudah submit untuk task ini
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        task_id: parseInt(taskId),
        wallet_address: walletAddress,
      }
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        error: 'You have already submitted this task',
        status: existingSubmission.status 
      });
    }

    // Konversi gambar ke base64
    const base64Image = await convertToBase64(proofFile.filepath);

    // Cek apakah task exists
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) }
    });
    console.log('abu janda1', task);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Buat submission menggunakan prisma.taskSubmission.create
    const submission = await prisma.taskSubmission.create({
      data: {
        task: {
          connect: {
            id: parseInt(taskId)
          }
        },
        wallet_address: walletAddress,
        proof_image: base64Image,
        twitter_link: twitterLink,
        status: 'PENDING',
        user: {
          connect: {
            wallet_address: walletAddress
          }
        }
      },
    });

    console.log('abu janda', submission);

    // Hapus file temporary
    await fs.unlink(proofFile.filepath);

    return res.status(201).json({ 
      success: true, 
      submission: {
        id: submission.id,
        status: submission.status
      }
    });

  } catch (error) {
    console.error('Error handling submission:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export handler function
export default handler;