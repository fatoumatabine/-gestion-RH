import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { createCompanySchema, updateCompanySchema } from '../validation/company.schema.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuration multer pour l'upload de logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour le fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier que c'est une image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

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
    const salaries = company.employees.map(emp => emp.salary || 0).filter(salary => !isNaN(salary) && salary > 0);
    const validSalaries = salaries.length;
    const totalSalary = validSalaries > 0 ? salaries.reduce((sum, salary) => sum + salary, 0) : 0;
    const salaireMoyen = validSalaries > 0 ? Math.round(totalSalary / validSalaries) : 0;

    const stats = {
      ...company,
      nombreEmployes: company.employees.length,
      employesActifs: company.employees.filter(emp => emp.status === 'ACTIVE').length,
      salaireMoyen: isNaN(salaireMoyen) ? 0 : salaireMoyen,
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
        couleurPrimaire: validatedData.couleurPrimaire,
        couleurSecondaire: validatedData.couleurSecondaire,
        couleurDashboard: validatedData.couleurDashboard,
        parametres: validatedData.parametres || {}
      }
    });

    // Créer une notification pour tous les administrateurs
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERADMIN']
          }
        }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Nouvelle entreprise ajoutée',
            message: `Une nouvelle entreprise "${company.nom}" a été ajoutée au système`,
            type: 'SUCCESS',
            category: 'Entreprises',
            link: `/companies`,
            isRead: false
          }
        });
      }
    } catch (notificationError) {
      console.error('Erreur lors de la création de la notification:', notificationError);
      // Ne pas échouer la création de l'entreprise si la notification échoue
    }

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
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    console.log('=== DÉBUT MISE À JOUR ENTREPRISE ===');
    console.log('ID entreprise:', req.params.id);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Fichier uploadé:', req.file ? req.file.filename : 'Aucun');

    const { id } = req.params;

    // Validation de l'ID
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      console.log('ID invalide:', id);
      return res.status(400).json({ message: 'ID d\'entreprise invalide' });
    }

    console.log('Vérification existence entreprise...');
    // Vérifier si l'entreprise existe
    const existingCompany = await prisma.entreprise.findUnique({
      where: { id: numericId }
    });

    if (!existingCompany) {
      console.log('Entreprise non trouvée:', numericId);
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    console.log('Entreprise trouvée:', existingCompany.nom);

    // Gérer l'upload du logo
    let logoPath = existingCompany.logo;
    if (req.file) {
      console.log('Fichier logo uploadé:', req.file.filename);
      // Supprimer l'ancien logo s'il existe
      if (existingCompany.logo) {
        const oldLogoPath = path.join(process.cwd(), existingCompany.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
          console.log('Ancien logo supprimé');
        }
      }
      // Nouveau chemin du logo
      logoPath = `/uploads/logos/${req.file.filename}`;
      console.log('Nouveau chemin logo:', logoPath);
    }

    console.log('Données reçues pour mise à jour entreprise:', JSON.stringify(req.body, null, 2));
    const validationResult = updateCompanySchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log('Erreurs de validation:', validationResult.error.issues);
      const errorDetails = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        received: issue.code === 'invalid_type' ? `Type: ${issue.received}, attendu: ${Array.isArray(issue.expected) ? issue.expected.join(' ou ') : issue.expected}` : 'Format invalide'
      }));

      return res.status(400).json({
        message: 'Données de validation invalides',
        details: 'Vérifiez les logs du serveur pour plus de détails',
        errors: errorDetails,
        receivedData: req.body // Pour debug côté frontend
      });
    }

    console.log('Données validées pour mise à jour:', JSON.stringify(validationResult.data, null, 2));

    const validatedData = validationResult.data;

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre entreprise
    if (validatedData.nom && validatedData.nom !== existingCompany.nom) {
      console.log('Vérification nom unique...');
      const nameConflict = await prisma.entreprise.findFirst({
        where: {
          nom: validatedData.nom.trim(),
          id: { not: parseInt(id) }
        }
      });

      if (nameConflict) {
        console.log('Nom déjà utilisé');
        return res.status(400).json({ message: 'Une entreprise avec ce nom existe déjà' });
      }
    }

    const updateData = {
      ...(validatedData.nom && { nom: validatedData.nom.trim() }),
      ...(validatedData.adresse !== undefined && { adresse: validatedData.adresse?.trim() }),
      ...(validatedData.telephone !== undefined && { telephone: validatedData.telephone?.trim() }),
      ...(validatedData.email !== undefined && { email: validatedData.email?.trim() }),
      ...(validatedData.siteWeb !== undefined && { siteWeb: validatedData.siteWeb?.trim() }),
      ...(validatedData.description !== undefined && { description: validatedData.description?.trim() }),
      ...(validatedData.devise && { devise: validatedData.devise }),
      ...(validatedData.timezone && { timezone: validatedData.timezone }),
      ...(validatedData.periodePayroll && { periodePayroll: validatedData.periodePayroll }),
      ...(validatedData.couleurPrimaire !== undefined && { couleurPrimaire: validatedData.couleurPrimaire }),
      ...(validatedData.couleurSecondaire !== undefined && { couleurSecondaire: validatedData.couleurSecondaire }),
      ...(validatedData.couleurDashboard !== undefined && { couleurDashboard: validatedData.couleurDashboard }),
      ...(logoPath !== undefined && { logo: logoPath }),
      ...(validatedData.estActive !== undefined && { estActive: validatedData.estActive }),
      ...(validatedData.parametres && { parametres: validatedData.parametres })
    };

    console.log('Données à envoyer à Prisma:', JSON.stringify(updateData, null, 2));

    console.log('Exécution de la mise à jour Prisma...');
    const updatedCompany = await prisma.entreprise.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log('Mise à jour réussie:', updatedCompany.nom);
    console.log('=== FIN MISE À JOUR ENTREPRISE ===');

    res.json({
      message: 'Entreprise mise à jour avec succès',
      company: updatedCompany
    });
  } catch (error) {
    console.error('=== ERREUR MISE À JOUR ENTREPRISE ===');
    console.error('Erreur complète:', error);
    console.error('Stack trace:', error.stack);
    console.error('Message:', error.message);
    console.error('=== FIN ERREUR ===');

    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message,
      details: 'Vérifiez les logs du serveur pour plus de détails'
    });
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