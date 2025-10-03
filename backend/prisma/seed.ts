import { PrismaClient, Role, EmployeeStatus, CompanyStatutFacture, CompanyStatutPayRun, CompanyStatutPaiement, CompanyMethodePaiement } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Nettoyage de la base de données
  await prisma.$transaction([
    prisma.companySetting.deleteMany(),
    prisma.companyDocument.deleteMany(),
    prisma.companyModeleDocument.deleteMany(),
    prisma.companyRegleDeduction.deleteMany(),
    prisma.companyHistoriqueSalaire.deleteMany(),
    prisma.companyPaiement.deleteMany(),
    prisma.companyBulletin.deleteMany(),
    prisma.companyPayRun.deleteMany(),
    prisma.companyPeriodePaie.deleteMany(),
    prisma.companyConfigurationPaie.deleteMany(),
    prisma.companyLigneFacture.deleteMany(),
    prisma.companyFacture.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.journalAudit.deleteMany(),
    prisma.user.deleteMany(),
    prisma.entreprise.deleteMany(),
  ]);

  // Création des utilisateurs
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      passwordHash: superAdminPassword,
      role: Role.SUPERADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+221788889999'
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+221777777777'
    }
  });

  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@example.com',
      passwordHash: cashierPassword,
      role: Role.CASHIER,
      firstName: 'Cashier',
      lastName: 'User',
      phone: '+221766666666'
    }
  });

  // Création de l'entreprise
  const entreprise = await prisma.entreprise.create({
    data: {
      nom: 'TechSoft Senegal',
      adresse: 'Dakar, Sénégal',
      telephone: '+221338889999',
      email: 'contact@techsoft.sn',
      siteWeb: 'www.techsoft.sn',
      logo: 'https://example.com/logo.png',
      couleurPrimaire: '#2563eb',
      couleurSecondaire: '#64748b',
      couleurDashboard: '#1e293b',
      description: 'Entreprise de développement logiciel',
      devise: 'XOF',
      timezone: 'Africa/Dakar',
      periodePayroll: 'MENSUEL',
      estActive: true,
      parametres: {
        congeParan: 30,
        heuresParJour: 8,
        joursParSemaine: 5
      }
    }
  });

  // Configuration de la paie
  const configPaie = await prisma.companyConfigurationPaie.create({
    data: {
      entrepriseId: entreprise.id,
      jourPaie: 25,
      periodeCalcul: 'MENSUEL',
      regleArrondi: 'SUPERIEUR',
      formatNumeration: {
        prefixe: 'PAY',
        suffixe: 'TSN',
        padding: 6
      },
      regleValidation: {
        requiertApprobation: true,
        limiteApprobation: 5000000
      },
      parametresCalcul: {
        tauxHeureSup: 1.15,
        plafondHeureSup: 20,
        congesPayes: true
      }
    }
  });

  // Création des employés
  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@techsoft.sn',
      passwordHash: employeePassword,
      role: Role.CASHIER,
      firstName: 'Moussa',
      lastName: 'Diallo',
      phone: '+221777778888',
      employee: {
        create: {
          entrepriseId: entreprise.id,
          employeeId: 'EMP001',
          department: 'Développement',
          position: 'Développeur Senior',
          salary: 800000,
          hireDate: new Date('2024-01-15'),
          phone: '+221777778888',
          address: 'Sacré Coeur 3, Dakar',
          status: EmployeeStatus.ACTIVE
        }
      }
    }
  });

  // Création d'une période de paie
  const periodePaie = await prisma.companyPeriodePaie.create({
    data: {
      nom: 'Septembre 2025',
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2025-09-30'),
      entrepriseId: entreprise.id,
      dateReglement: new Date('2025-09-25'),
      notes: 'Période régulière'
    }
  });

  // Création d'un PayRun
  const payRun = await prisma.companyPayRun.create({
    data: {
      reference: 'PR202509',
      entrepriseId: entreprise.id,
      periodePaieId: periodePaie.id,
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2025-09-30'),
      datePaiement: new Date('2025-09-25'),
      statut: CompanyStatutPayRun.EN_COURS,
      totalBrut: 800000,
      totalNet: 720000,
      totalDeductions: 80000,
      nombreEmployes: 1,
      creePar: admin.id,
      metadata: {
        genereLe: new Date().toISOString(),
        commentaires: []
      }
    }
  });

  // Création d'un bulletin
  const bulletin = await prisma.companyBulletin.create({
    data: {
      numeroBulletin: 'BUL202509001',
      payRunId: payRun.id,
      employeId: (await prisma.employee.findFirst({ where: { userId: employee1.id } }))!.id,
      datePaiement: new Date('2025-09-25'),
      joursTravailles: 22,
      heuresTravailes: 176,
      salaireBrut: 800000,
      salaireBase: 800000,
      montantHeuresSupp: 0,
      montantBonus: 0,
      indemnites: 0,
      deductions: {
        ipres: 40000,
        css: 40000
      },
      totalDeductions: 80000,
      salaireNet: 720000,
      montantPaye: 0,
      resteAPayer: 720000,
      statutPaiement: 'EN_ATTENTE',
      calculs: {
        detailsDeductions: {
          ipres: { taux: 0.05, base: 800000 },
          css: { taux: 0.05, base: 800000 }
        }
      }
    }
  });

  // Création d'un modèle de document
  const modeleContrat = await prisma.companyModeleDocument.create({
    data: {
      nom: 'Contrat de travail CDI',
      type: 'CONTRAT',
      contenu: 'Entre les soussignés :\\n{{entreprise.nom}}, {{entreprise.adresse}}\\nEt\\n{{employe.nom}} {{employe.prenom}}...',
      variables: {
        entreprise: ['nom', 'adresse', 'telephone'],
        employe: ['nom', 'prenom', 'adresse']
      },
      entrepriseId: entreprise.id,
      creePar: admin.id,
      estActif: true
    }
  });

  // Création d'une règle de déduction
  const regleIPRES = await prisma.companyRegleDeduction.create({
    data: {
      nom: 'IPRES',
      description: 'Institution de Prévoyance Retraite du Sénégal',
      type: 'LEGAL',
      formule: 'salaireBrut * 0.05',
      conditionsApplication: {
        plafond: 1000000,
        applicable: 'TOUS'
      },
      estObligatoire: true,
      ordre: 1,
      configurationId: configPaie.id
    }
  });

  // Création d'un document
  const document = await prisma.companyDocument.create({
    data: {
      type: 'CONTRAT',
      titre: 'Contrat de travail - Moussa Diallo',
      description: 'Contrat à durée indéterminée',
      cheminFichier: '/documents/contrats/emp001_cdi.pdf',
      tailleFichier: 150000,
      mimeType: 'application/pdf',
      tags: '["contrat", "cdi"]',
      employeId: (await prisma.employee.findFirst({ where: { userId: employee1.id } }))!.id,
      uploadePar: admin.id,
      metadata: {
        dateSignature: '2024-01-15',
        version: 1
      }
    }
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });