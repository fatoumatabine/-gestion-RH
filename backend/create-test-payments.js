import { PrismaClient } from './prisma/global/global/index.js';

const globalPrisma = new PrismaClient({
  datasources: {
    globalDb: {
      url: process.env.GLOBAL_DATABASE_URL,
    },
  },
});

async function createTestPayments() {
  try {
    console.log('Création des données de test pour les paiements...');
    console.log('Prisma client:', globalPrisma);
    console.log('User model:', globalPrisma?.user);
    console.log('Payment model:', globalPrisma?.payment);

    // Récupérer un employé existant
    const employee = await globalPrisma.employee.findFirst();
    if (!employee) {
      console.log('Aucun employé trouvé. Création d\'un employé de test...');

      // Créer un utilisateur de test
      const user = await globalPrisma.user.create({
        data: {
          email: 'test.employee@example.com',
          passwordHash: '$2b$10$dummy.hash.for.test',
          firstName: 'Jean',
          lastName: 'Dupont',
          role: 'EMPLOYEE'
        }
      });

      // Créer une entreprise de test
      const entreprise = await globalPrisma.entreprise.create({
        data: {
          nom: 'Entreprise Test',
          adresse: '123 Rue de Test',
          telephone: '+221771234567',
          email: 'contact@test.com'
        }
      });

      // Créer l'employé
      const newEmployee = await globalPrisma.employee.create({
        data: {
          userId: user.id,
          entrepriseId: entreprise.id,
          employeeId: 'EMP001',
          department: 'IT',
          position: 'Développeur',
          salary: 500000.00,
          hireDate: new Date('2024-01-01'),
          status: 'ACTIVE'
        }
      });

      employee = newEmployee;
    }

    // Récupérer un caissier
    const cashier = await globalPrisma.user.findFirst({
      where: { role: 'CASHIER' }
    });

    if (!cashier) {
      console.log('Aucun caissier trouvé. Création d\'un caissier de test...');
      const newCashier = await globalPrisma.user.create({
        data: {
          email: 'cashier@test.com',
          passwordHash: '$2b$10$dummy.hash.for.test',
          firstName: 'Marie',
          lastName: 'Caissière',
          role: 'CASHIER'
        }
      });
      cashier = newCashier;
    }

    // Créer des paiements de test
    const payments = [
      {
        employeeId: employee.id,
        amount: 500000.00,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'PAY001',
        status: 'PROCESSED',
        notes: 'Salaire du mois de septembre 2024',
        processedBy: cashier.id
      },
      {
        employeeId: employee.id,
        amount: 450000.00,
        paymentMethod: 'CASH',
        reference: 'PAY002',
        status: 'PROCESSED',
        notes: 'Salaire du mois d\'août 2024',
        processedBy: cashier.id
      },
      {
        employeeId: employee.id,
        amount: 500000.00,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING',
        notes: 'Salaire du mois d\'octobre 2024 - En attente',
        processedBy: cashier.id
      }
    ];

    for (const paymentData of payments) {
      await globalPrisma.payment.create({
        data: paymentData
      });
    }

    console.log('✅ Données de test créées avec succès !');
    console.log(`📊 ${payments.length} paiements créés`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  } finally {
    await globalPrisma.$disconnect();
  }
}

createTestPayments();