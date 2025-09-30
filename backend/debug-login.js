import { PrismaClient } from './prisma/global/global/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.role} (hash length: ${user.passwordHash.length})`);
    });

    // Test password comparison for admin@example.com
    const adminUser = users.find(u => u.email === 'admin@example.com');
    if (adminUser) {
      console.log('\nTesting password for admin@example.com:');
      const isValid = await bcrypt.compare('password123', adminUser.passwordHash);
      console.log('Password valid:', isValid);
    }

    // Test creating a new user
    console.log('\nCreating test user...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    console.log('Test user created:', testUser.email);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();