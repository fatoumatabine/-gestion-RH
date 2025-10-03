import { PrismaClient } from '@prisma/client';
import { generateEmployeeQRCode } from './src/utils/qrCode.js';

const prisma = new PrismaClient();

async function regenerateQRCodesAsFiles() {
  try {
    console.log('🔄 Régénération des QR codes comme fichiers physiques...');

    // Récupérer tous les employés
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        qrCode: true,
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
        console.log(`🔄 Génération QR code fichier pour ${employee.user.firstName} ${employee.user.lastName} (${employee.employeeId})`);

        // Générer le QR code comme fichier
        const qrCodePath = await generateEmployeeQRCode(employee.id, employee.employeeId);

        // Mettre à jour l'employé avec le chemin du fichier
        await prisma.employee.update({
          where: { id: employee.id },
          data: { qrCode: qrCodePath }
        });

        console.log(`✅ QR code fichier généré: ${qrCodePath}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Erreur pour ${employee.employeeId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Régénération terminée !`);
    console.log(`✅ ${updatedCount} QR codes fichiers créés`);
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
regenerateQRCodesAsFiles();