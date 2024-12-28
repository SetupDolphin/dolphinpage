import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';

const prisma = new Prisma();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address, deviceId, timestamp } = req.body;

    // Cek duplikasi di database
    const existing = await prisma.solanaSubmission.findFirst({
      where: { deviceId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Device already submitted' });
    }

    // Simpan ke database
    const submission = await prisma.solanaSubmission.create({
      data: {
        address,
        deviceId,
        timestamp
      }
    });

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
} 