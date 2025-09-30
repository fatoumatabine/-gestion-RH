import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { adminOrSuperAdmin } from '../middleware/role.middleware.js';
import { payrollService } from '../services/global/payroll.service.js';
import { pdfService } from '../services/global/pdf.service.js';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(auth);
router.use(adminOrSuperAdmin);


// GET /api/payrolls - Récupérer tous les bulletins de paie
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, employeeId, payRunId, status, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (employeeId) where.employeId = parseInt(employeeId);
    if (payRunId) where.payRunId = parseInt(payRunId);
    if (status) where.statutPaiement = status;
    if (startDate || endDate) {
      where.datePaiement = {};
      if (startDate) where.datePaiement.gte = new Date(startDate);
      if (endDate) where.datePaiement.lte = new Date(endDate);
    }

    const [bulletins, total] = await Promise.all([
      prisma.companyBulletin.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          payRun: {
            select: {
              reference: true,
              dateDebut: true,
              dateFin: true
            }
          }
        },
        orderBy: {
          datePaiement: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.companyBulletin.count({ where })
    ]);

    res.json({
      bulletins,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des bulletins' });
  }
});


// GET /api/payrolls/payruns - Récupérer tous les payruns
router.get('/payruns/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, entrepriseId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.statut = status;
    if (entrepriseId) where.entrepriseId = parseInt(entrepriseId);

    const [payRuns, total] = await Promise.all([
      prisma.companyPayRun.findMany({
        where,
        include: {
          entreprise: {
            select: {
              nom: true
            }
          },
          creator: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              bulletins: true
            }
          }
        },
        orderBy: {
          creeLe: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.companyPayRun.count({ where })
    ]);

    res.json({
      payRuns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des payruns:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des payruns' });
  }
});

// POST /api/payrolls/payruns - Créer un nouveau payrun
router.post('/payruns', async (req, res) => {
  try {
    const { entrepriseId, periodePaieId, datePaiement } = req.body;

    // Vérifier que l'entreprise existe
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: parseInt(entrepriseId) }
    });

    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Vérifier que la période de paie existe
    const periodePaie = await prisma.companyPeriodePaie.findUnique({
      where: { id: parseInt(periodePaieId) }
    });

    if (!periodePaie) {
      return res.status(404).json({ message: 'Période de paie non trouvée' });
    }

    // Générer une référence unique
    const reference = `PR${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Date.now().toString().slice(-4)}`;

    // Créer le payrun
    const payRun = await prisma.companyPayRun.create({
      data: {
        reference,
        entrepriseId: parseInt(entrepriseId),
        periodePaieId: parseInt(periodePaieId),
        dateDebut: periodePaie.dateDebut,
        dateFin: periodePaie.dateFin,
        datePaiement: new Date(datePaiement),
        statut: 'BROUILLON',
        totalBrut: 0,
        totalNet: 0,
        totalDeductions: 0,
        nombreEmployes: 0,
        creePar: req.user.id
      },
      include: {
        entreprise: {
          select: {
            nom: true
          }
        },
        periodePaie: {
          select: {
            nom: true,
            dateDebut: true,
            dateFin: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Payrun créé avec succès',
      payRun
    });
  } catch (error) {
    console.error('Erreur lors de la création du payrun:', error);
    res.status(500).json({ message: 'Erreur lors de la création du payrun' });
  }
});

// PUT /api/payrolls/payruns/:id/generate - Générer les bulletins pour un payrun
router.put('/payruns/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;

    const payRun = await prisma.companyPayRun.findUnique({
      where: { id: parseInt(id) },
      include: {
        entreprise: true,
        periodePaie: true
      }
    });

    if (!payRun) {
      return res.status(404).json({ message: 'Payrun non trouvé' });
    }

    if (payRun.statut !== 'BROUILLON') {
      return res.status(400).json({ message: 'Seuls les payruns en brouillon peuvent être générés' });
    }

    // Récupérer tous les employés actifs de l'entreprise
    const employees = await prisma.employee.findMany({
      where: {
        entrepriseId: payRun.entrepriseId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    let totalBrut = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    // Créer un bulletin pour chaque employé
    for (const employee of employees) {
      let salaireBrut = 0;
      let joursTravailles = 22; // Valeur par défaut
      let heuresTravailes = 176; // 22 jours * 8h

      // Calcul selon le type de contrat
      switch (employee.contractType) {
        case 'FIXED_SALARY':
          salaireBrut = employee.salary || 0;
          break;
        case 'DAILY':
          // Pour les journaliers, on utilise le taux journalier * jours travaillés
          const joursTravailleJournalier = 22; // À récupérer depuis les données de présence
          salaireBrut = (employee.dailyRate || 0) * joursTravailleJournalier;
          joursTravailles = joursTravailleJournalier;
          heuresTravailes = joursTravailleJournalier * 8;
          break;
        case 'HOURLY':
          // Pour les honoraires, on utilise le taux horaire * heures travaillées
          const heuresTravaillees = 176; // À récupérer depuis les données de temps
          salaireBrut = (employee.hourlyRate || 0) * heuresTravaillees;
          heuresTravailes = heuresTravaillees;
          joursTravailles = Math.floor(heuresTravaillees / 8);
          break;
        default:
          salaireBrut = employee.salary || 0;
      }

      const deductions = Math.round(salaireBrut * 0.05); // 5% de déductions (IPRES/CSS)
      const salaireNet = salaireBrut - deductions;

      await prisma.companyBulletin.create({
        data: {
          numeroBulletin: `BUL${payRun.reference}${employee.id.toString().padStart(3, '0')}`,
          payRunId: payRun.id,
          employeId: employee.id,
          datePaiement: payRun.datePaiement,
          joursTravailles,
          heuresTravailes,
          salaireBrut,
          salaireBase: employee.salary || salaireBrut,
          montantHeuresSupp: 0,
          montantBonus: 0,
          indemnites: 0,
          deductions: {
            ipres: deductions * 0.5,
            css: deductions * 0.5
          },
          totalDeductions: deductions,
          salaireNet,
          montantPaye: 0,
          resteAPayer: salaireNet,
          statutPaiement: 'EN_ATTENTE'
        }
      });

      totalBrut += salaireBrut;
      totalNet += salaireNet;
      totalDeductions += deductions;
    }

    // Mettre à jour le payrun
    const updatedPayRun = await prisma.companyPayRun.update({
      where: { id: parseInt(id) },
      data: {
        statut: 'EN_COURS',
        totalBrut,
        totalNet,
        totalDeductions,
        nombreEmployes: employees.length
      },
      include: {
        entreprise: {
          select: {
            nom: true
          }
        },
        _count: {
          select: {
            bulletins: true
          }
        }
      }
    });

    res.json({
      message: 'Bulletins générés avec succès',
      payRun: updatedPayRun
    });
  } catch (error) {
    console.error('Erreur lors de la génération des bulletins:', error);
    res.status(500).json({ message: 'Erreur lors de la génération des bulletins' });
  }
});

// GET /api/payrolls/periodes-paie - Récupérer toutes les périodes de paie
router.get('/periodes-paie', async (req, res) => {
  try {
    const periodesPaie = await prisma.companyPeriodePaie.findMany({
      where: {
        estCloturee: false // Uniquement les périodes non clôturées
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });

    res.json(periodesPaie);
  } catch (error) {
    console.error('Erreur lors de la récupération des périodes de paie:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des périodes de paie' });
  }
});

// POST /api/payrolls/periodes-paie - Créer une nouvelle période de paie
router.post('/periodes-paie', async (req, res) => {
  try {
    const { nom, dateDebut, dateFin, entrepriseId, dateReglement, notes } = req.body;

    // Vérifier que l'entreprise existe
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: parseInt(entrepriseId) }
    });

    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Créer la période de paie
    const periodePaie = await prisma.companyPeriodePaie.create({
      data: {
        nom,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        entrepriseId: parseInt(entrepriseId),
        dateReglement: dateReglement ? new Date(dateReglement) : null,
        notes
      }
    });

    res.status(201).json({
      message: 'Période de paie créée avec succès',
      periodePaie
    });
  } catch (error) {
    console.error('Erreur lors de la création de la période de paie:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la période de paie' });
  }
});

// GET /api/payrolls/salary-history - Historique des salaires
router.get('/salary-history', async (req, res) => {
  try {
    const { page = 1, limit = 10, employeeId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (employeeId) where.employeId = parseInt(employeeId);

    const [salaryHistory, total] = await Promise.all([
      prisma.companyHistoriqueSalaire.findMany({
        where,
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
          modifier: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          creeLe: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.companyHistoriqueSalaire.count({ where })
    ]);

    res.json({
      salaryHistory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des salaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des salaires' });
  }
});

// POST /api/payrolls/salary-history - Ajouter une entrée d'historique des salaires
router.post('/salary-history', async (req, res) => {
  try {
    const { employeId, ancienSalaire, nouveauSalaire, dateEffet, motif, notes } = req.body;

    // Vérifier que l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeId) }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Créer l'entrée d'historique
    const salaryHistoryEntry = await prisma.companyHistoriqueSalaire.create({
      data: {
        employeId: parseInt(employeId),
        ancienSalaire: parseFloat(ancienSalaire),
        nouveauSalaire: parseFloat(nouveauSalaire),
        dateEffet: new Date(dateEffet),
        motif,
        notes,
        modifiePar: req.user.id
      },
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
        modifier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Historique des salaires mis à jour avec succès',
      salaryHistoryEntry
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'historique des salaires:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'historique des salaires' });
  }
});

// GET /api/payrolls/stats - Statistiques des paies
router.get('/stats/overview', async (req, res) => {
  try {
    const { entrepriseId, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.datePaiement = {};
      if (startDate) dateFilter.datePaiement.gte = new Date(startDate);
      if (endDate) dateFilter.datePaiement.lte = new Date(endDate);
    }

    const entrepriseFilter = entrepriseId ? { entrepriseId: parseInt(entrepriseId) } : {};

    const [totalBulletins, totalAmount, pendingBulletins, paidBulletins] = await Promise.all([
      prisma.companyBulletin.count({
        where: {
          payRun: entrepriseFilter,
          ...dateFilter
        }
      }),
      prisma.companyBulletin.aggregate({
        where: {
          payRun: entrepriseFilter,
          ...dateFilter
        },
        _sum: {
          salaireNet: true
        }
      }),
      prisma.companyBulletin.count({
        where: {
          payRun: entrepriseFilter,
          ...dateFilter,
          statutPaiement: 'EN_ATTENTE'
        }
      }),
      prisma.companyBulletin.count({
        where: {
          payRun: entrepriseFilter,
          ...dateFilter,
          statutPaiement: 'PAYE'
        }
      })
    ]);

    res.json({
      totalBulletins,
      totalAmount: totalAmount._sum.salaireNet || 0,
      pendingBulletins,
      paidBulletins
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/payrolls/:id - Récupérer un bulletin par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bulletin = await prisma.companyBulletin.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            entreprise: {
              select: {
                nom: true,
                adresse: true
              }
            }
          }
        },
        payRun: {
          select: {
            reference: true,
            dateDebut: true,
            dateFin: true,
            statut: true
          }
        },
        paiements: true
      }
    });

    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }

    res.json(bulletin);
  } catch (error) {
    console.error('Erreur lors de la récupération du bulletin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du bulletin' });
  }
});

// POST /api/payrolls/bulletin/:id/process-payment - Traiter un paiement pour un bulletin
router.post('/bulletin/:id/process-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, reference, notes } = req.body;

    const result = await payrollService.processPaymentForBulletin({
      bulletinId: parseInt(id),
      amount: parseFloat(amount),
      paymentMethod,
      reference,
      notes,
      processedBy: req.user.id
    });

    res.json({
      message: 'Paiement traité avec succès',
      result
    });
  } catch (error) {
    console.error('Erreur lors du traitement du paiement:', error);
    res.status(500).json({ message: error.message || 'Erreur lors du traitement du paiement' });
  }
});

// POST /api/payrolls/payruns/:id/process-payments - Traiter les paiements en bulk pour un payrun
router.post('/payruns/:id/process-payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { bulletinIds, paymentData } = req.body;

    if (!bulletinIds || !Array.isArray(bulletinIds)) {
      return res.status(400).json({ message: 'bulletinIds doit être un tableau' });
    }

    const results = await payrollService.processBulkPayments(
      bulletinIds,
      {
        ...paymentData,
        processedBy: req.user.id
      }
    );

    res.json({
      message: 'Paiements traités',
      results
    });
  } catch (error) {
    console.error('Erreur lors du traitement des paiements en bulk:', error);
    res.status(500).json({ message: 'Erreur lors du traitement des paiements' });
  }
});

// POST /api/payrolls/payruns/:id/generate-pdfs - Générer les PDFs pour un payrun
router.post('/payruns/:id/generate-pdfs', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await payrollService.generatePayslipsForPayRun(parseInt(id));

    res.json({
      message: 'PDFs générés avec succès',
      result
    });
  } catch (error) {
    console.error('Erreur lors de la génération des PDFs:', error);
    res.status(500).json({ message: 'Erreur lors de la génération des PDFs' });
  }
});

// GET /api/payrolls/payruns/:id/summary - Récupérer le résumé d'un payrun
router.get('/payruns/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await payrollService.getPayrollSummary(parseInt(id));

    res.json(summary);
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du résumé' });
  }
});

// GET /api/payrolls/:id/pdf - Télécharger le PDF d'un bulletin
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const bulletin = await prisma.companyBulletin.findUnique({
      where: { id: parseInt(id) },
      select: { cheminPDF: true, numeroBulletin: true }
    });

    if (!bulletin || !bulletin.cheminPDF) {
      return res.status(404).json({ message: 'PDF non trouvé' });
    }

    const filePath = path.join(process.cwd(), bulletin.cheminPDF);

    // Vérifier si le fichier existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'Fichier PDF non trouvé' });
    }

    res.download(filePath, `${bulletin.numeroBulletin}.pdf`);
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du PDF' });
  }
});

export default router;