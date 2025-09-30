import prisma from '../../database/prisma.client.js';
import { pdfService } from './pdf.service.js';

export interface ProcessPaymentInput {
  bulletinId: number;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  processedBy: number;
}

export class PayrollService {
  async processPaymentForBulletin(data: ProcessPaymentInput) {
    const { bulletinId, amount, paymentMethod, reference, notes, processedBy } = data;

    // Récupérer le bulletin
    const bulletin = await prisma.companyBulletin.findUnique({
      where: { id: bulletinId },
      include: {
        employee: {
          include: {
            user: true
          }
        },
        payRun: true
      }
    });

    if (!bulletin) {
      throw new Error('Bulletin non trouvé');
    }

    if (bulletin.statutPaiement === 'PAYE') {
      throw new Error('Ce bulletin a déjà été payé');
    }

    // Calculer le montant restant à payer
    const remainingAmount = Number(bulletin.resteAPayer);

    if (amount > remainingAmount) {
      throw new Error(`Le montant ne peut pas dépasser ${remainingAmount} XOF`);
    }

    // Générer une référence unique pour le paiement
    const paymentReference = reference || `PAY${Date.now()}${bulletinId}`;

    // Créer le paiement dans CompanyPaiement
    const companyPayment = await prisma.companyPaiement.create({
      data: {
        referenceTransaction: paymentReference,
        montant: amount,
        methodePaiement: paymentMethod,
        referencePaiement: reference,
        datePaiement: new Date(),
        notes,
        bulletinId,
        traitePar: processedBy,
        statut: 'TRAITE'
      }
    });

    // Mettre à jour le bulletin
    const newMontantPaye = Number(bulletin.montantPaye) + amount;
    const newResteAPayer = Number(bulletin.salaireNet) - newMontantPaye;

    const updatedBulletin = await prisma.companyBulletin.update({
      where: { id: bulletinId },
      data: {
        montantPaye: newMontantPaye,
        resteAPayer: newResteAPayer,
        statutPaiement: newResteAPayer <= 0 ? 'PAYE' : 'EN_ATTENTE'
      }
    });

    // Générer le PDF du bulletin mis à jour
    const pdfPath = await pdfService.generatePayslipPDF(bulletinId);

    return {
      companyPayment,
      bulletin: updatedBulletin,
      pdfPath
    };
  }

  async processBulkPayments(bulletinIds: number[], paymentData: Omit<ProcessPaymentInput, 'bulletinId'>) {
    const results = [];

    for (const bulletinId of bulletinIds) {
      try {
        const result = await this.processPaymentForBulletin({
          ...paymentData,
          bulletinId
        });
        results.push(result);
      } catch (error) {
        console.error(`Erreur traitement paiement pour bulletin ${bulletinId}:`, error);
        results.push({
          bulletinId,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return results;
  }

  async generatePayslipsForPayRun(payRunId: number) {
    // Récupérer tous les bulletins du payrun
    const bulletins = await prisma.companyBulletin.findMany({
      where: { payRunId },
      select: { id: true }
    });

    const bulletinIds = bulletins.map(b => b.id);

    // Générer les PDFs en bulk
    const pdfPaths = await pdfService.generateBulkPayslips(bulletinIds);

    return {
      payRunId,
      totalBulletins: bulletinIds.length,
      generatedPDFs: pdfPaths.length,
      pdfPaths
    };
  }

  async getPayrollSummary(payRunId: number) {
    const payRun = await prisma.companyPayRun.findUnique({
      where: { id: payRunId },
      include: {
        bulletins: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            paiements: true
          }
        },
        entreprise: {
          select: {
            nom: true
          }
        }
      }
    });

    if (!payRun) {
      throw new Error('Payrun non trouvé');
    }

    const summary = {
      payRun: {
        id: payRun.id,
        reference: payRun.reference,
        statut: payRun.statut,
        totalBrut: payRun.totalBrut,
        totalNet: payRun.totalNet,
        nombreEmployes: payRun.nombreEmployes
      },
      entreprise: payRun.entreprise,
      bulletins: payRun.bulletins.map(bulletin => ({
        id: bulletin.id,
        numeroBulletin: bulletin.numeroBulletin,
        employee: {
          name: `${bulletin.employee.user.firstName} ${bulletin.employee.user.lastName}`,
          employeeId: bulletin.employee.employeeId
        },
        salaireNet: bulletin.salaireNet,
        montantPaye: bulletin.montantPaye,
        resteAPayer: bulletin.resteAPayer,
        statutPaiement: bulletin.statutPaiement,
        cheminPDF: bulletin.cheminPDF,
        paiements: bulletin.paiements
      }))
    };

    return summary;
  }
}

export const payrollService = new PayrollService();