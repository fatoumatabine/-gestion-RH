import bcrypt from 'bcryptjs';
import { globalPrisma } from '../src/database/global.prisma.client.js';

async function createTestUser() {
  try {
    // Créer une entreprise de test
    const entreprise = await globalPrisma.entreprise.create({
      data: {
        nom: 'Test Company',
        adresse: '123 Test Street, Dakar',
        telephone: '+221 77 123 45 67',
        email: 'test@company.com',
        devise: 'XOF',
        timezone: 'Africa/Dakar',
        periodePayroll: 'MENSUEL',
        estActive: true,
      },
    });

    // Créer un superadmin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await globalPrisma.user.create({
      data: {
        email: 'superadmin@test.com',
        passwordHash: superAdminPassword,
        role: 'SUPERADMIN',
        firstName: 'Super',
        lastName: 'Admin',
      },
    });

    // Créer un admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await globalPrisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        firstName: 'Test',
        lastName: 'Admin',
      },
    });

    // Créer un caissier
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await globalPrisma.user.create({
      data: {
        email: 'cashier@test.com',
        passwordHash: cashierPassword,
        role: 'CASHIER',
        firstName: 'Test',
        lastName: 'Cashier',
      },
    });

    console.log('Utilisateurs de test créés avec succès :');
    console.log('=====================================');
    console.log('SuperAdmin: superadmin@test.com / superadmin123');
    console.log('Admin: admin@test.com / admin123');
    console.log('Cashier: cashier@test.com / cashier123');
    console.log('=====================================');

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de test:', error);
  } finally {
    await globalPrisma.$disconnect();
  }
}

createTestUser();