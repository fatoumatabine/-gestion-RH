import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';

const router = Router();

/**
 * @route GET /api/invoices
 * @desc Récupérer toutes les companyFactures
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const companyFactures = await prisma.companyFacture.findMany({
      include: {
        employee: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lignesFacture: true
      }
    });
    res.json(companyFactures);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des companyFactures' });
  }
});

/**
 * @route GET /api/invoices/:id
 * @desc Récupérer une companyFacture par son ID
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const companyFacture = await prisma.companyFacture.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        employee: true,
        createur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lignesFacture: true
      }
    });

    if (!companyFacture) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(companyFacture);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la companyFacture' });
  }
});

/**
 * @route POST /api/invoices
 * @desc Créer une nouvelle companyFacture
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { employeeId, numeroFacture, montant, description, dateEcheance, lignesFacture } = req.body;

    const companyFacture = await prisma.companyFacture.create({
      data: {
        employeeId: parseInt(employeeId),
        numeroFacture,
        montant: parseFloat(montant),
        description,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        statut: 'EN_ATTENTE',
        creePar: req.user.id,
        lignesFacture: {
          create: lignesFacture.map(ligne => ({
            description: ligne.description,
            quantite: parseInt(ligne.quantite),
            prixUnitaire: parseFloat(ligne.prixUnitaire),
            prixTotal: parseFloat(ligne.prixTotal)
          }))
        }
      },
      include: {
        employee: true,
        lignesFacture: true
      }
    });

    res.status(201).json(companyFacture);
  } catch (error) {
    console.error('Erreur création companyFacture:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la companyFacture' });
  }
});

/**
 * @route PUT /api/invoices/:id
 * @desc Mettre à jour une companyFacture
 * @access Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { montant, description, dateEcheance, statut, lignesFacture } = req.body;
    const companyFactureId = parseInt(req.params.id);

    // Vérifier si la companyFacture existe
    const existingFacture = await prisma.companyFacture.findUnique({
      where: { id: companyFactureId }
    });

    if (!existingFacture) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Mise à jour de la companyFacture et ses lignes
    const updatedFacture = await prisma.$transaction(async (tx) => {
      // Supprimer les anciennes lignes
      await tx.companyLigneFacture.deleteMany({
        where: { companyFactureId }
      });

      // Mettre à jour la companyFacture et créer les nouvelles lignes
      return await tx.companyFacture.update({
        where: { id: companyFactureId },
        data: {
          montant: parseFloat(montant),
          description,
          dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
          statut,
          lignesFacture: {
            create: lignesFacture.map(ligne => ({
              description: ligne.description,
              quantite: parseInt(ligne.quantite),
              prixUnitaire: parseFloat(ligne.prixUnitaire),
              prixTotal: parseFloat(ligne.prixTotal)
            }))
          }
        },
        include: {
          employee: true,
          lignesFacture: true
        }
      });
    });

    res.json(updatedFacture);
  } catch (error) {
    console.error('Erreur mise à jour companyFacture:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la companyFacture' });
  }
});

/**
 * @route DELETE /api/invoices/:id
 * @desc Supprimer une companyFacture
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const companyFacture = await prisma.companyFacture.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la companyFacture' });
  }
});

export default router;