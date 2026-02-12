// Simple API server for handling database operations
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import stripeRoutes from './api/stripe.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' });
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, language } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Determine if it's a prayer request
    const isPrayerRequest = subject.toLowerCase().includes('prayer') || 
                           message.toLowerCase().includes('pray');

    let result;
    
    if (isPrayerRequest) {
      // Save as prayer request
      result = await prisma.prayerRequest.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          requestText: message,
          isAnonymous: !name || name.trim() === '',
          language: language || 'en',
          status: 'active'
        }
      });
      
      console.log('Prayer request saved:', result.id);
    } else {
      // Save as contact submission
      result = await prisma.contactSubmission.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject,
          message,
          language: language || 'en',
          status: 'new'
        }
      });
      
      console.log('Contact submission saved:', result.id);
    }

    res.json({ 
      success: true, 
      id: result.id,
      type: isPrayerRequest ? 'prayer' : 'contact'
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save submission' 
    });
  }
});

// Submit prayer request
app.post('/api/prayer-requests', async (req, res) => {
  try {
    const { name, email, phone, message, language } = req.body;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prayer request text is required' 
      });
    }

    const result = await prisma.prayerRequest.create({
      data: {
        name: name || null,
        email: email || null,
        phone: phone || null,
        requestText: message,
        isAnonymous: !name || name.trim() === '',
        language: language || 'en',
        status: 'active'
      }
    });
    
    console.log('Prayer request saved:', result.id);

    res.json({ 
      success: true, 
      id: result.id,
      type: 'prayer'
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save prayer request' 
    });
  }
});

// Get contact submissions
app.get('/api/contact', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json({ success: true, contacts: submissions });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contact submissions' });
  }
});

// Get prayer requests
app.get('/api/prayers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const requests = await prisma.prayerRequest.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json({ success: true, prayers: requests });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prayer requests' });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    
    // Count existing records
    const contactCount = await prisma.contactSubmission.count();
    const prayerCount = await prisma.prayerRequest.count();
    
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      counts: {
        contacts: contactCount,
        prayers: prayerCount
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// === THEME MANAGEMENT ENDPOINTS ===

// Get all theme settings
app.get('/api/themes', async (req, res) => {
  try {
    // Get winter theme setting
    const winterSetting = await prisma.siteSetting.findUnique({
      where: { key: 'winter_theme_enabled' }
    });

    const isWinterEnabled = winterSetting?.value === 'true';

    res.json({
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
});

// Update theme settings (admin only)
app.post('/api/themes', async (req, res) => {
  try {
    const { theme, enabled, adminEmail } = req.body;

    if (!theme || enabled === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: theme, enabled'
      });
    }

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

    res.json({
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
});

// === ADMIN ENDPOINTS ===

// Admin login authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last login time
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    });
    
    console.log('Admin login successful:', email);
    
    res.json({ 
      success: true, 
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      }
    });
    
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Stripe payment routes
app.use('/api/stripe', stripeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Test database: http://localhost:${PORT}/api/test-db`);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;
