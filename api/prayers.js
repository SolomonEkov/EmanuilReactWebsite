import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const prayers = await prisma.prayerRequest.findMany({
        where: { status: 'active' },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        prayers
      });
    } catch (error) {
      console.error('Error fetching prayers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prayer requests'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, message, language } = req.body;

      // Validate required fields
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const prayer = await prisma.prayerRequest.create({
        data: {
          name: name || 'Anonymous',
          email: email || null,
          phone: phone || null,
          requestText: message,
          isAnonymous: !name || name.trim() === '',
          language: language || 'en',
          status: 'active'
        }
      });

      res.json({
        success: true,
        prayer,
        message: 'Prayer request submitted successfully'
      });
    } catch (error) {
      console.error('Error creating prayer request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit prayer request'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await prisma.$disconnect();
}
