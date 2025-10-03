import { PrismaClient } from '@prisma/client';
import { generateSimpleQRCode } from './src/utils/qrCode.js';

const prisma = new PrismaClient();

async function regenerateEmployeeQRCodes() {
  try {
    console.log('🔄 Régénération des QR codes pour tous les employés...');

    // Récupérer tous les employés
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`📊 Trouvé ${employees.length} employés`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        console.log(`🔄 Génération QR code pour ${employee.user.firstName} ${employee.user.lastName} (${employee.employeeId})`);

        // Générer le QR code avec l'ID employé
        const qrCode = await generateSimpleQRCode(employee.employeeId);

        // Mettre à jour l'employé avec le nouveau QR code
        await prisma.employee.update({
          where: { id: employee.id },
          data: { qrCode }
        });

        console.log(`✅ QR code généré pour ${employee.employeeId}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Erreur pour ${employee.employeeId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Régénération terminée !`);
    console.log(`✅ ${updatedCount} QR codes mis à jour`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
regenerateEmployeeQRCodes();