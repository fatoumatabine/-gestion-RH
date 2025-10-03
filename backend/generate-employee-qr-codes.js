import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function generateEmployeeQRCodes() {
  try {
    console.log('Génération des QR codes pour les employés...');

    // Récupérer tous les employés sans QR code
    const employeesWithoutQR = await prisma.employee.findMany({
      where: {
        qrCode: null
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`Trouvé ${employeesWithoutQR.length} employés sans QR code`);

    for (const employee of employeesWithoutQR) {
      // Générer un QR code unique basé sur l'ID employé et un hash aléatoire
      const randomBytes = crypto.randomBytes(16).toString('hex');
      const qrData = `${employee.employeeId}-${randomBytes}`;
      const qrCode = crypto.createHash('sha256').update(qrData).digest('hex').substring(0, 32);

      // Mettre à jour l'employé avec le QR code
      await prisma.employee.update({
        where: { id: employee.id },
        data: { qrCode }
      });

      console.log(`QR code généré pour ${employee.user.firstName} ${employee.user.lastName} (${employee.employeeId}): ${qrCode}`);
    }

    console.log('Génération des QR codes terminée !');

  } catch (error) {
    console.error('Erreur lors de la génération des QR codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateEmployeeQRCodes();