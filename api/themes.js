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

  // GET: Retrieve current theme settings
  if (req.method === 'GET') {
    try {
      // Get winter theme setting
      const winterSetting = await prisma.siteSetting.findUnique({
        where: { key: 'winter_theme_enabled' }
      });

      const isWinterEnabled = winterSetting?.value === 'true';

      res.status(200).json({
        success: true,
        themes: {
          winter: isWinterEnabled
        }
      });
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch theme settings'
      });
    }
  }
  // POST: Update theme settings (admin only)
  else if (req.method === 'POST') {
    try {
      const { theme, enabled, adminEmail } = req.body;

      if (!theme || enabled === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: theme, enabled'
        });
      }

      // Only support winter theme for now
      if (theme !== 'winter') {
        return res.status(400).json({
          success: false,
          error: 'Invalid theme. Only "winter" is supported.'
        });
      }

      // Upsert the setting
      await prisma.siteSetting.upsert({
        where: { key: 'winter_theme_enabled' },
        update: {
          value: String(enabled),
          updatedBy: adminEmail || 'admin'
        },
        create: {
          key: 'winter_theme_enabled',
          value: String(enabled),
          updatedBy: adminEmail || 'admin'
        }
      });

      console.log(`Theme '${theme}' ${enabled ? 'enabled' : 'disabled'} by ${adminEmail || 'admin'}`);

      res.status(200).json({
        success: true,
        message: `Winter theme ${enabled ? 'enabled' : 'disabled'}`,
        theme: 'winter',
        enabled
      });
    } catch (error) {
      console.error('Error updating theme settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update theme settings'
      });
    }
  }
  // Method not allowed
  else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await prisma.$disconnect();
}
