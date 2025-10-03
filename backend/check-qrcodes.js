import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQRCodes() {
  try {
    console.log('🔍 Vérification des QR codes en base de données...');

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

    console.log(`📊 ${employees.length} employés trouvés\n`);

    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.user.firstName} ${employee.user.lastName} (${employee.employeeId})`);

      if (employee.qrCode) {
        const qrLength = employee.qrCode.length;
        const startsWithDataImage = employee.qrCode.startsWith('data:image/png;base64,');
        const preview = employee.qrCode.substring(0, 50) + '...';

        console.log(`   ✅ QR Code présent (${qrLength} caractères)`);
        console.log(`   ✅ Format valide: ${startsWithDataImage ? 'OUI' : 'NON'}`);
        console.log(`   📄 Aperçu: ${preview}`);

        if (!startsWithDataImage) {
          console.log(`   ❌ PROBLÈME: Le QR code ne commence pas par 'data:image/png;base64,'`);
        }

        // Vérifier si c'est une data URL valide
        try {
          const url = new URL(employee.qrCode);
          console.log(`   ✅ URL valide`);
        } catch (error) {
          console.log(`   ❌ URL invalide: ${error.message}`);
        }
      } else {
        console.log(`   ❌ Aucun QR code`);
      }

      console.log('');
    });

  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
checkQRCodes();