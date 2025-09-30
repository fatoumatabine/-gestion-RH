import bcrypt from 'bcryptjs';
import { globalPrisma } from '../database/global.prisma.client.js';
import { companyPrisma } from '../database/company.prisma.client.js';

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Nettoyer les données existantes
    await globalPrisma.user.deleteMany();
    await globalPrisma.employee.deleteMany();
    await globalPrisma.journalAudit.deleteMany();
    await companyPrisma.companyFacture.deleteMany();
    await companyPrisma.companyBulletin.deleteMany();
    await companyPrisma.companyPayRun.deleteMany();

    // Créer des utilisateurs de test
    const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCashierPassword = await bcrypt.hash('cashier123', 10);

    // SuperAdmin
    const superAdmin = await globalPrisma.user.create({
      data: {
        email: 'superadmin@test.com',
        passwordHash: hashedSuperAdminPassword,
        role: 'SUPERADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+221 77 123 45 67'
      }
    });

    // Admin
    const admin = await globalPrisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: hashedAdminPassword,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'Test',
        phone: '+221 77 234 56 78'
      }
    });

    // Cashier
    const cashier = await globalPrisma.user.create({
      data: {
        email: 'cashier@test.com',
        passwordHash: hashedCashierPassword,
        role: 'CASHIER',
        firstName: 'Cashier',
        lastName: 'Test',
        phone: '+221 77 345 67 89'
      }
    });

    console.log('✅ Utilisateurs créés:', {
      superAdmin: superAdmin.email,
      admin: admin.email,
      cashier: cashier.email
    });

    // Créer des entreprises de test
    const technoSenegal = await globalPrisma.entreprise.create({
      data: {
        nom: "TechnoSenegal",
        adresse: "123 Avenue Cheikh Anta Diop, Dakar",
        telephone: "+221 33 123 45 67",
        email: "contact@technosenegal.sn",
        siteWeb: "www.technosenegal.sn",
        description: "Leader dans le développement de solutions technologiques au Sénégal",
        devise: "XOF",
        timezone: "Africa/Dakar",
        periodePayroll: "MENSUEL",
        estActive: true
      }
    });

    const afriTech = await globalPrisma.entreprise.create({
      data: {
        nom: "AfriTech Solutions",
        adresse: "456 Rue Léopold Sédar Senghor, Dakar",
        telephone: "+221 33 987 65 43",
        email: "info@afritech.sn",
        siteWeb: "www.afritech.sn",
        description: "Solutions informatiques et consulting en Afrique",
        devise: "XOF",
        timezone: "Africa/Dakar",
        periodePayroll: "MENSUEL",
        estActive: true
      }
    });

    console.log('✅ Entreprises créées:', {
      technoSenegal: technoSenegal.nom,
      afriTech: afriTech.nom
    });

    // Créer des employés de test
    const employee1 = await globalPrisma.employee.create({
      data: {
        userId: admin.id,
        entrepriseId: technoSenegal.id,
        employeeId: 'EMP001',
        department: 'Développement',
        position: 'Développeur Senior',
        salary: 75000,
        hireDate: new Date('2023-01-15'),
        phone: '+221 77 123 45 67',
        address: '456 Rue Léopold Sédar Senghor, Dakar',
        status: 'ACTIVE'
      }
    });

    const employee2 = await globalPrisma.employee.create({
      data: {
        userId: cashier.id,
        entrepriseId: afriTech.id,
        employeeId: 'EMP002',
        department: 'Finance',
        position: 'Comptable',
        salary: 55000,
        hireDate: new Date('2023-06-10'),
        phone: '+221 77 234 56 78',
        address: '789 Boulevard de la République, Dakar',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Employés créés:', {
      employee1: `${employee1.employeeId} - ${employee1.position}`,
      employee2: `${employee2.employeeId} - ${employee2.position}`
    });

    // Créer des bulletins de paie de test
    const payRun = await companyPrisma.companyPayRun.create({
      data: {
        reference: 'PAY-2024-001',
        dateDebut: new Date('2024-12-01'),
        dateFin: new Date('2024-12-31'),
        datePaiement: new Date('2024-12-25'),
        statut: 'COMPLETE',
        totalBrut: 130000,
        totalNet: 101400,
        totalDeductions: 28600,
        nombreEmployes: 2,
        entrepriseId: technoSenegal.id,
        creePar: admin.id,
        approuvePar: superAdmin.id,
        approuveLe: new Date('2024-12-20')
      }
    });

    const bulletin1 = await companyPrisma.companyBulletin.create({
      data: {
        numeroBulletin: 'BUL-2024-001',
        datePaiement: new Date('2024-12-25'),
        joursTravailles: 22,
        heuresTravailes: 176,
        salaireBrut: 75000,
        salaireBase: 75000,
        montantHeuresSupp: 0,
        montantBonus: 0,
        indemnites: 0,
        deductions: { "assurance": 5000, "impots": 15000 },
        totalDeductions: 20000,
        salaireNet: 55000,
        montantPaye: 55000,
        statutPaiement: 'PAYE',
        payRunId: payRun.id,
        employeId: employee1.id,
        creeLe: new Date('2024-12-20')
      }
    });

    const bulletin2 = await companyPrisma.companyBulletin.create({
      data: {
        numeroBulletin: 'BUL-2024-002',
        datePaiement: new Date('2024-12-25'),
        joursTravailles: 22,
        heuresTravailes: 176,
        salaireBrut: 55000,
        salaireBase: 55000,
        montantHeuresSupp: 0,
        montantBonus: 0,
        indemnites: 0,
        deductions: { "assurance": 4000, "impots": 4600 },
        totalDeductions: 8600,
        salaireNet: 46400,
        montantPaye: 46400,
        statutPaiement: 'PAYE',
        payRunId: payRun.id,
        employeId: employee2.id,
        creeLe: new Date('2024-12-20')
      }
    });

    console.log('✅ Bulletins de paie créés:', {
      payRun: payRun.reference,
      bulletins: [bulletin1.numeroBulletin, bulletin2.numeroBulletin]
    });

    // Créer des factures de test
    const facture = await companyPrisma.companyFacture.create({
      data: {
        employeeId: employee1.id,
        numeroFacture: 'FAC-2024-001',
        montant: 1500,
        description: 'Prime de performance Q4 2024',
        statut: 'PAYEE',
        dateEcheance: new Date('2024-12-31'),
        datePaiement: new Date('2024-12-20'),
        creePar: admin.id
      }
    });

    console.log('✅ Facture créée:', facture.numeroFacture);

    // Créer des entrées de journal d'audit
    await globalPrisma.journalAudit.create({
      data: {
        utilisateurId: superAdmin.id,
        action: 'CREATION',
        nomTable: 'users',
        idEnregistrement: admin.id,
        nouvelles_valeurs: { email: admin.email, role: admin.role }
      }
    });

    console.log('✅ Journal d\'audit mis à jour');

    console.log('\n🎉 Toutes les données de test ont été créées avec succès!');
    console.log('\n📋 Comptes de test disponibles:');
    console.log('🔹 SuperAdmin: superadmin@test.com / superadmin123');
    console.log('🔹 Admin: admin@test.com / admin123');
    console.log('🔹 Cashier: cashier@test.com / cashier123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await globalPrisma.$disconnect();
    await companyPrisma.$disconnect();
  }
}

// Exécuter le seeding
seedTestData()
  .then(() => {
    console.log('\n✅ Seeding terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors du seeding:', error);
    process.exit(1);
  });