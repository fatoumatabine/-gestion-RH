import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createDefaultAttendanceRules() {
  try {
    console.log('Création des règles de pointage par défaut...');

    // Récupérer toutes les entreprises
    const entreprises = await prisma.entreprise.findMany();

    for (const entreprise of entreprises) {
      // Vérifier si des règles existent déjà
      const existingRules = await prisma.reglePointage.findUnique({
        where: { entrepriseId: entreprise.id }
      });

      if (!existingRules) {
        // Créer des règles par défaut
        await prisma.reglePointage.create({
          data: {
            entrepriseId: entreprise.id,
            heureDebut: '08:00',
            heureFin: '17:00',
            toleranceRetard: 15, // 15 minutes
            toleranceDepart: 15, // 15 minutes
            joursTravail: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
            heuresParJour: 8,
            heuresSupAutorise: true,
            seuilHeuresSup: 48, // 48h par semaine
            pauseDejeuner: 60, // 60 minutes
            estFlexible: false
          }
        });

        console.log(`Règles créées pour l'entreprise: ${entreprise.nom}`);
      } else {
        console.log(`Règles déjà existantes pour l'entreprise: ${entreprise.nom}`);
      }
    }

    console.log('Terminé !');

  } catch (error) {
    console.error('Erreur lors de la création des règles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAttendanceRules();