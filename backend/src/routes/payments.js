import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { requireCashier } from '../middleware/cashier.middleware.js';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(auth);
router.use(requireCashier);

// GET /api/payments/company/:companyId - Récupérer les paiements par entreprise
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      employee: {
        entrepriseId: parseInt(companyId)
      }
    };

    if (status) where.status = status;
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
                  nom: true
                }
              }
            }
          },
          cashier: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements par entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

// GET /api/payments - Récupérer tous les paiements
router.get('/', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { page = 1, limit = 10, status, employeeId, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
                  nom: true
                }
              }
            }
          },
          cashier: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

// GET /api/payments/:id - Récupérer un paiement par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
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
                nom: true
              }
            }
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du paiement' });
  }
});

// POST /api/payments - Créer un nouveau paiement
router.post('/', async (req, res) => {
  try {
    const { employeeId, amount, paymentMethod, reference, notes } = req.body;

    // Vérifier que l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Vérifier que l'employé est actif
    if (employee.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Impossible de créer un paiement pour un employé inactif' });
    }

    // Créer le paiement
    const payment = await prisma.payment.create({
      data: {
        employeeId: parseInt(employeeId),
        amount: parseFloat(amount),
        paymentMethod,
        reference,
        notes,
        processedBy: req.user.id // ID du caissier connecté
      },
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
                nom: true
              }
            }
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Paiement créé avec succès',
      payment
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
});

// PUT /api/payments/:id - Mettre à jour un paiement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, status, reference, notes } = req.body;

    // Vérifier que le paiement existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPayment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Mettre à jour le paiement
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(paymentMethod && { paymentMethod }),
        ...(status && { status }),
        ...(reference !== undefined && { reference }),
        ...(notes !== undefined && { notes })
      },
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
                nom: true
              }
            }
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Paiement mis à jour avec succès',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
  }
});

// DELETE /api/payments/:id - Supprimer un paiement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le paiement existe
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Supprimer le paiement
    await prisma.payment.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Paiement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du paiement' });
  }
});

// GET /api/payments/stats - Statistiques des paiements
router.get('/stats/overview', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.lte = new Date(endDate);
    }

    const [totalPayments, totalAmount, pendingPayments, processedPayments] = await Promise.all([
      prisma.payment.count({ where: dateFilter }),
      prisma.payment.aggregate({
        where: { ...dateFilter, status: 'PROCESSED' },
        _sum: { amount: true }
      }),
      prisma.payment.count({ where: { ...dateFilter, status: 'PENDING' } }),
      prisma.payment.count({ where: { ...dateFilter, status: 'PROCESSED' } })
    ]);

    res.json({
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      pendingPayments,
      processedPayments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/payments/:id/bulletin - Télécharger le bulletin de salaire
router.get('/:id/bulletin', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
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
                adresse: true,
                telephone: true
              }
            }
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Générer le contenu HTML du bulletin
    const bulletinHTML = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin de Salaire</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .bulletin {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .section {
            margin-bottom: 30px;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 20px;
          }
          .section:last-child {
            border-bottom: none;
          }
          .section h2 {
            color: #495057;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #6c757d;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            color: #495057;
            font-size: 14px;
            margin-top: 2px;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px solid #28a745;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .signature {
            margin-top: 30px;
            text-align: right;
          }
          .signature-line {
            border-top: 1px solid #6c757d;
            width: 200px;
            margin-left: auto;
            margin-top: 40px;
            padding-top: 5px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="bulletin">
          <div class="header">
            <h1>🧾 Bulletin de Salaire</h1>
            <p>Système de Gestion RH - TechnoSenegal</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>📋 Informations de l'Employé</h2>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <div class="info-label">Nom complet</div>
                    <div class="info-value">${payment.employee.user.firstName} ${payment.employee.user.lastName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${payment.employee.user.email}</div>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <div class="info-label">Poste</div>
                    <div class="info-value">${payment.employee.position || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Entreprise</div>
                    <div class="info-value">${payment.employee.entreprise.nom}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>💰 Détails du Paiement</h2>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <div class="info-label">Date de paiement</div>
                    <div class="info-value">${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Méthode de paiement</div>
                    <div class="info-value">${payment.paymentMethod === 'CASH' ? 'Espèces' :
                                              payment.paymentMethod === 'BANK_TRANSFER' ? 'Virement bancaire' :
                                              payment.paymentMethod === 'CHECK' ? 'Chèque' : 'Mobile Money'}</div>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <div class="info-label">Statut</div>
                    <div class="info-value">${payment.status === 'PROCESSED' ? 'Traitée' :
                                              payment.status === 'PENDING' ? 'En attente' :
                                              payment.status === 'CANCELLED' ? 'Annulée' : 'Échec'}</div>
                  </div>
                  ${payment.reference ? `
                  <div class="info-item">
                    <div class="info-label">Référence</div>
                    <div class="info-value">${payment.reference}</div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <div class="amount">
              Montant : ${payment.amount.toLocaleString('fr-FR')} XOF
            </div>

            ${payment.notes ? `
            <div class="section">
              <h2>📝 Notes</h2>
              <p style="color: #495057; line-height: 1.6;">${payment.notes}</p>
            </div>
            ` : ''}

            <div class="signature">
              <div class="signature-line">
                ${payment.cashier ? `${payment.cashier.firstName} ${payment.cashier.lastName}` : 'Caissier'}
                <br>
                <small>Caissier - ${new Date().toLocaleDateString('fr-FR')}</small>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Ce bulletin est généré automatiquement par le système TechnoHR</p>
            <p>Pour toute question, contactez votre service RH</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="bulletin-salaire-${payment.employee.user.firstName}-${payment.employee.user.lastName}-${payment.id}.html"`);

    res.send(bulletinHTML);
  } catch (error) {
    console.error('Erreur lors de la génération du bulletin:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du bulletin' });
  }
});

export default router;