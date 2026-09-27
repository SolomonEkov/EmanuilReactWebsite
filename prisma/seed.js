import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedProduction() {
  try {
    console.log('🌱 Starting production database seeding...');

    const existingAdmin = await prisma.adminUser.findFirst();
    if (existingAdmin) {
      console.log('✅ Admin user already exists, skipping creation');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 123456);

    const adminUser = await prisma.adminUser.create({
      data: {
        name: 'Administrator',
        email: 'admin@emanuelchurchbg.be',
        passwordHash: hashedPassword,
        isActive: true
      }
    });

    console.log('Created admin user:', adminUser.email);
    console.log('Default password: admin123');
    console.log('Please change this password after first login!');

    console.log('Adding sample contact submission...');
    await prisma.contactSubmission.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+32 123 456 789',
        subject: 'Welcome to our church',
        message: 'Thank you for creating this wonderful website for our church community.',
        language: 'en'
      }
    });

    console.log('Sample data added successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction();