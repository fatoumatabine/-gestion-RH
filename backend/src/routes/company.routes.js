import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(auth);

// === FACTURES ===

// GET /api/company/factures - Récupérer toutes les factures
router.get('/factures', async (req, res) => {
  try {
    const factures = await prisma.companyFacture.findMany({
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
        lignesFacture: true
      },
      orderBy: { creeLe: 'desc' }
    });
    res.json(factures);
  } catch (error) {
    console.error('Error fetching factures:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/factures/:id - Récupérer une facture par ID
router.get('/factures/:id', async (req, res) => {
  try {
    const facture = await prisma.companyFacture.findUnique({
      where: { id: parseInt(req.params.id) },
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
        lignesFacture: true
      }
    });

    if (!facture) {
      return res.status(404).json({ error: 'Facture not found' });
    }

    res.json(facture);
  } catch (error) {
    console.error('Error fetching facture:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// === BULLETINS ===

// GET /api/company/bulletins - Récupérer tous les bulletins
router.get('/bulletins', async (req, res) => {
  try {
    const bulletins = await prisma.companyBulletin.findMany({
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
        }
      },
      orderBy: { creeLe: 'desc' }
    });
    res.json(bulletins);
  } catch (error) {
    console.error('Error fetching bulletins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/bulletins/:id - Récupérer un bulletin par ID
router.get('/bulletins/:id', async (req, res) => {
  try {
    const bulletin = await prisma.companyBulletin.findUnique({
      where: { id: parseInt(req.params.id) },
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
        }
      }
    });

    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }

    res.json(bulletin);
  } catch (error) {
    console.error('Error fetching bulletin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/bulletins/:id/pdf - Télécharger le PDF d'un bulletin
router.get('/bulletins/:id/pdf', async (req, res) => {
  try {
    const bulletin = await prisma.companyBulletin.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!bulletin) {
      return res.status(404).json({ error: 'Bulletin not found' });
    }

    if (!bulletin.cheminPDF) {
      return res.status(404).json({ error: 'PDF not available' });
    }

    // Pour l'instant, retourner une erreur car la génération de PDF n'est pas implémentée
    res.status(404).json({ error: 'PDF generation not implemented yet' });
  } catch (error) {
    console.error('Error downloading bulletin PDF:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// === DOCUMENTS ===

// GET /api/company/documents - Récupérer tous les documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await prisma.companyDocument.findMany({
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
        }
      },
      orderBy: { creeLe: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/documents/:id - Récupérer un document par ID
router.get('/documents/:id', async (req, res) => {
  try {
    const document = await prisma.companyDocument.findUnique({
      where: { id: parseInt(req.params.id) },
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
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/documents/:id/download - Télécharger un document
router.get('/documents/:id/download', async (req, res) => {
  try {
    const document = await prisma.companyDocument.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Pour l'instant, retourner une erreur car le téléchargement n'est pas implémenté
    res.status(404).json({ error: 'Document download not implemented yet' });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// === HISTORIQUE DES SALAIRES ===

// GET /api/company/historique-salaires - Récupérer tout l'historique des salaires
router.get('/historique-salaires', async (req, res) => {
  try {
    const historique = await prisma.companyHistoriqueSalaire.findMany({
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
      orderBy: { creeLe: 'desc' }
    });
    res.json(historique);
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/company/historique-salaires/:id - Récupérer un historique de salaire par ID
router.get('/historique-salaires/:id', async (req, res) => {
  try {
    const historique = await prisma.companyHistoriqueSalaire.findUnique({
      where: { id: parseInt(req.params.id) },
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

    if (!historique) {
      return res.status(404).json({ error: 'Salary history not found' });
    }

    res.json(historique);
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;