import puppeteer, { Browser } from 'puppeteer';
import prisma from '../../database/prisma.client.js';
import path from 'path';
import fs from 'fs/promises';

export class PDFService {
  private browser: Browser | null = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generatePayslipPDF(bulletinId: number): Promise<string> {
    try {
      const browser = await this.initBrowser();

      // Récupérer les données du bulletin
      const bulletin = await prisma.companyBulletin.findUnique({
        where: { id: bulletinId },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              entreprise: {
                select: {
                  nom: true,
                  adresse: true,
                  telephone: true,
                  email: true
                }
              }
            }
          },
          payRun: {
            select: {
              reference: true,
              dateDebut: true,
              dateFin: true,
              datePaiement: true
            }
          }
        }
      });

      if (!bulletin) {
        throw new Error('Bulletin non trouvé');
      }

      // Générer le HTML du bulletin
      const htmlContent = this.generatePayslipHTML(bulletin);

      // Créer le PDF
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Créer le dossier uploads/payslips s'il n'existe pas
      const uploadsDir = path.join(process.cwd(), 'uploads', 'payslips');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Générer le nom du fichier
      const fileName = `bulletin-${bulletin.numeroBulletin}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      // Générer le PDF
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await page.close();

      // Mettre à jour le bulletin avec le chemin du PDF
      const relativePath = `uploads/payslips/${fileName}`;
      await prisma.companyBulletin.update({
        where: { id: bulletinId },
        data: { cheminPDF: relativePath }
      });

      return relativePath;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Erreur lors de la génération du PDF du bulletin');
    }
  }

  private generatePayslipHTML(bulletin: any): string {
    const employee = bulletin.employee;
    const entreprise = employee.entreprise;
    const payRun = bulletin.payRun;

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin de Paie - ${bulletin.numeroBulletin}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-info {
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .bulletin-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            flex: 1;
            margin: 0 10px;
          }
          .info-block h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .salary-table th, .salary-table td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
          }
          .salary-table th {
            background-color: #f9fafb;
            font-weight: bold;
          }
          .total-row {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-block {
            text-align: center;
            flex: 1;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="company-name">${entreprise.nom}</div>
            <div>${entreprise.adresse || ''}</div>
            <div>Tél: ${entreprise.telephone || ''} | Email: ${entreprise.email || ''}</div>
          </div>
          <div class="bulletin-title">BULLETIN DE PAIE</div>
          <div>N° ${bulletin.numeroBulletin}</div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Employé</h3>
            <p><strong>Nom:</strong> ${employee.user.lastName} ${employee.user.firstName}</p>
            <p><strong>Matricule:</strong> ${employee.employeeId}</p>
            <p><strong>Poste:</strong> ${employee.position || 'N/A'}</p>
          </div>
          <div class="info-block">
            <h3>Période</h3>
            <p><strong>Du:</strong> ${new Date(payRun.dateDebut).toLocaleDateString('fr-FR')}</p>
            <p><strong>Au:</strong> ${new Date(payRun.dateFin).toLocaleDateString('fr-FR')}</p>
            <p><strong>Paiement:</strong> ${new Date(bulletin.datePaiement).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <table class="salary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Montant (XOF)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salaire de base</td>
              <td>${bulletin.salaireBase?.toLocaleString('fr-FR') || 0}</td>
            </tr>
            <tr>
              <td>Heures supplémentaires</td>
              <td>${bulletin.montantHeuresSupp?.toLocaleString('fr-FR') || 0}</td>
            </tr>
            <tr>
              <td>Bonus</td>
              <td>${bulletin.montantBonus?.toLocaleString('fr-FR') || 0}</td>
            </tr>
            <tr>
              <td>Indemnités</td>
              <td>${bulletin.indemnites?.toLocaleString('fr-FR') || 0}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Salaire brut</strong></td>
              <td><strong>${bulletin.salaireBrut?.toLocaleString('fr-FR') || 0}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="salary-table">
          <thead>
            <tr>
              <th>Déductions</th>
              <th>Montant (XOF)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(bulletin.deductions || {}).map(([key, value]) =>
              `<tr>
                <td>${key.toUpperCase()}</td>
                <td>${(value as number)?.toLocaleString('fr-FR') || 0}</td>
              </tr>`
            ).join('')}
            <tr class="total-row">
              <td><strong>Total déductions</strong></td>
              <td><strong>${bulletin.totalDeductions?.toLocaleString('fr-FR') || 0}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="salary-table">
          <tbody>
            <tr class="total-row">
              <td><strong>SALAIRE NET À PAYER</strong></td>
              <td><strong>${bulletin.salaireNet?.toLocaleString('fr-FR') || 0} XOF</strong></td>
            </tr>
            <tr>
              <td>Montant payé</td>
              <td>${bulletin.montantPaye?.toLocaleString('fr-FR') || 0}</td>
            </tr>
            <tr>
              <td>Reste à payer</td>
              <td>${bulletin.resteAPayer?.toLocaleString('fr-FR') || 0}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line">
              Signature de l'employé
            </div>
          </div>
          <div class="signature-block">
            <div class="signature-line">
              Signature de l'employeur
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generateBulkPayslips(bulletinIds: number[]): Promise<string[]> {
    const results: string[] = [];

    for (const id of bulletinIds) {
      try {
        const pdfPath = await this.generatePayslipPDF(id);
        results.push(pdfPath);
      } catch (error) {
        console.error(`Erreur génération PDF pour bulletin ${id}:`, error);
        // Continue avec les autres
      }
    }

    return results;
  }
}

export const pdfService = new PDFService();