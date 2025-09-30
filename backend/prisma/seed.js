import { PrismaClient } from '../../prisma/global/global/index.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    globalDb: {
      url: process.env.GLOBAL_DATABASE_URL,
    },
  },
})

async function main() {
  // Nettoyage de la base de données
  await prisma.payment.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.journalAudit.deleteMany()
  await prisma.user.deleteMany()
  await prisma.entreprise.deleteMany()

  // Création de l'entreprise par défaut
  const entreprise = await prisma.entreprise.create({
    data: {
      nom: "TechnoSenegal",
      adresse: "123 Avenue Cheikh Anta Diop, Dakar",
      telephone: "+221 33 123 45 67",
      email: "contact@technosenegal.sn",
      siteWeb: "www.technosenegal.sn",
      description: "Leader dans le développement de solutions technologiques au Sénégal"
    }
  })

  // Création des utilisateurs
  const adminPassword = await bcrypt.hash('admin123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)
  const cashierPassword = await bcrypt.hash('cashier123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'System'
    }
  })

  const cashier = await prisma.user.create({
    data: {
      email: 'caissier@example.com',
      passwordHash: cashierPassword,
      role: 'CASHIER',
      firstName: 'Jean',
      lastName: 'Dupont'
    }
  })

  const employeeUser = await prisma.user.create({
    data: {
      email: 'employe@example.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      firstName: 'Marie',
      lastName: 'Martin'
    }
  })

  // Création d'un employé
  const employee = await prisma.employee.create({
    data: {
      userId: employeeUser.id,
      entrepriseId: entreprise.id,
      employeeId: 'EMP001',
      department: 'Développement',
      position: 'Développeur Senior',
      salary: 800000.00,
      hireDate: new Date('2024-01-15'),
      phone: '+221 77 123 45 67',
      address: '456 Rue Léopold Sédar Senghor, Dakar',
      status: 'ACTIVE'
    }
  })

  // Création d'une entrée dans le journal d'audit
  await prisma.journalAudit.create({
    data: {
      utilisateurId: admin.id,
      action: 'CREATION',
      nomTable: 'employees',
      idEnregistrement: employee.id,
      nouvelles_valeurs: { id: employee.id, employeeId: employee.employeeId, status: employee.status }
    }
  })

  console.log('Base de données peuplée avec succès !')
}

main()
  .catch((e) => {
    console.error('Erreur lors du peuplement de la base de données:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })