import bcrypt from 'bcrypt';
import { globalPrisma } from '../src/database/global.prisma.client.js';

async function createSuperAdmin() {
  try {
    console.log('Création de l\'utilisateur SuperAdmin...');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await globalPrisma.user.findUnique({
      where: { email: 'superadmin@test.com' }
    });

    if (existingUser) {
      console.log('L\'utilisateur SuperAdmin existe déjà.');
      return;
    }

    // Créer l'entreprise par défaut si elle n'existe pas
    let entreprise = await globalPrisma.entreprise.findFirst();
    if (!entreprise) {
      entreprise = await globalPrisma.entreprise.create({
        data: {
          nom: "TechnoSenegal",
          adresse: "123 Avenue Cheikh Anta Diop, Dakar",
          telephone: "+221 33 123 45 67",
          email: "contact@technosenegal.sn",
          siteWeb: "www.technosenegal.sn",
          description: "Leader dans le développement de solutions technologiques au Sénégal"
        }
      });
      console.log('Entreprise créée:', entreprise.nom);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    // Créer l'utilisateur SuperAdmin
    const superAdmin = await globalPrisma.user.create({
      data: {
        email: 'superadmin@test.com',
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPERADMIN',
        phone: '+221 77 000 00 00'
      }
    });

    console.log('✅ SuperAdmin créé avec succès!');
    console.log('📧 Email: superadmin@test.com');
    console.log('🔑 Mot de passe: superadmin123');
    console.log('👤 Rôle: SUPERADMIN');

  } catch (error) {
    console.error('❌ Erreur lors de la création du SuperAdmin:', error);
  } finally {
    await globalPrisma.$disconnect();
  }
}

createSuperAdmin();