import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { createCompanySchema, updateCompanySchema } from '../validation/company.schema.js';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(auth);

// GET /api/companies - Récupérer toutes les entreprises
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.entreprise.findMany({
      orderBy: {
        creeLe: 'desc'
      }
    });

    res.json(companies);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises' });
  }
});

// GET /api/companies/:id - Récupérer une entreprise par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation de l'ID
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'ID d\'entreprise invalide' });
    }

    const company = await prisma.entreprise.findUnique({
      where: { id: numericId },
      include: {
        employees: {
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

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Statistiques de l'entreprise
    const stats = {
      ...company,
      nombreEmployes: company.employees.length,
      employesActifs: company.employees.filter(emp => emp.status === 'ACTIVE').length,
      salaireMoyen: company.employees.length > 0
        ? Math.round(company.employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / company.employees.length)
        : 0,
      employees: company.employees.map(emp => ({
        ...emp,
        firstName: emp.user.firstName,
        lastName: emp.user.lastName
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise' });
  }
});

// POST /api/companies - Créer une nouvelle entreprise
router.post('/', async (req, res) => {
  try {
    // Validation avec Zod
    const validationResult = createCompanySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Données de validation invalides',
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Vérifier si l'entreprise existe déjà
    const existingCompany = await prisma.entreprise.findFirst({
      where: { nom: validatedData.nom.trim() }
    });

    if (existingCompany) {
      return res.status(400).json({ message: 'Une entreprise avec ce nom existe déjà' });
    }

    const company = await prisma.entreprise.create({
      data: {
        nom: validatedData.nom.trim(),
        adresse: validatedData.adresse?.trim(),
        telephone: validatedData.telephone?.trim(),
        email: validatedData.email?.trim(),
        siteWeb: validatedData.siteWeb?.trim(),
        description: validatedData.description?.trim(),
        devise: validatedData.devise || 'XOF',
        timezone: validatedData.timezone || 'Africa/Dakar',
        periodePayroll: validatedData.periodePayroll || 'MENSUEL',
        parametres: validatedData.parametres || {}
      }
    });

    res.status(201).json({
      message: 'Entreprise créée avec succès',
      company
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'entreprise' });
  }
});


// PUT /api/companies/:id - Mettre à jour une entreprise
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validation avec Zod
    const validationResult = updateCompanySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Données de validation invalides',
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Vérifier si l'entreprise existe
    const existingCompany = await prisma.entreprise.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCompany) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre entreprise
    if (validatedData.nom && validatedData.nom !== existingCompany.nom) {
      const nameConflict = await prisma.entreprise.findFirst({
        where: {
          nom: validatedData.nom.trim(),
          id: { not: parseInt(id) }
        }
      });

      if (nameConflict) {
        return res.status(400).json({ message: 'Une entreprise avec ce nom existe déjà' });
      }
    }

    const updatedCompany = await prisma.entreprise.update({
      where: { id: parseInt(id) },
      data: {
        ...(validatedData.nom && { nom: validatedData.nom.trim() }),
        ...(validatedData.adresse !== undefined && { adresse: validatedData.adresse?.trim() }),
        ...(validatedData.telephone !== undefined && { telephone: validatedData.telephone?.trim() }),
        ...(validatedData.email !== undefined && { email: validatedData.email?.trim() }),
        ...(validatedData.siteWeb !== undefined && { siteWeb: validatedData.siteWeb?.trim() }),
        ...(validatedData.description !== undefined && { description: validatedData.description?.trim() }),
        ...(validatedData.devise && { devise: validatedData.devise }),
        ...(validatedData.timezone && { timezone: validatedData.timezone }),
        ...(validatedData.periodePayroll && { periodePayroll: validatedData.periodePayroll }),
        ...(validatedData.estActive !== undefined && { estActive: validatedData.estActive }),
        ...(validatedData.parametres && { parametres: validatedData.parametres })
      }
    });

    res.json({
      message: 'Entreprise mise à jour avec succès',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entreprise' });
  }
});

// DELETE /api/companies/:id - Supprimer une entreprise
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'entreprise existe
    const company = await prisma.entreprise.findUnique({
      where: { id: parseInt(id) },
      include: {
        employees: true
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Vérifier s'il y a des employés actifs
    const activeEmployees = company.employees.filter(emp => emp.status === 'ACTIVE');
    if (activeEmployees.length > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer l'entreprise car elle a ${activeEmployees.length} employé(s) actif(s). Désactivez d'abord tous les employés.`
      });
    }

    // Supprimer l'entreprise (les employés seront supprimés en cascade)
    await prisma.entreprise.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Entreprise supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'entreprise' });
  }
});

// PATCH /api/companies/:id/toggle-status - Activer/Désactiver une entreprise
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.entreprise.findUnique({
      where: { id: parseInt(id) }
    });

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    const updatedCompany = await prisma.entreprise.update({
      where: { id: parseInt(id) },
      data: {
        estActive: !company.estActive
      }
    });

    res.json({
      message: `Entreprise ${updatedCompany.estActive ? 'activée' : 'désactivée'} avec succès`,
      company: updatedCompany
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ message: 'Erreur lors du changement de statut' });
  }
});

export default router;