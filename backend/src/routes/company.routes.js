import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { companyService } from '../services/company.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Middleware d'authentification requis pour toutes les routes
router.use(authenticate);

// Validation pour la création d'une entreprise
const createCompanyValidation = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'&]+$/)
    .withMessage('Le nom contient des caractères invalides'),

  body('adresse')
    .optional()
    .isLength({ max: 255 })
    .withMessage('L\'adresse ne peut pas dépasser 255 caractères'),

  body('telephone')
    .optional()
    .matches(/^(\+221|221)?[3-9][0-9]{7}$/)
    .withMessage('Format de téléphone invalide (ex: +221771234567 ou 771234567)'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),

  body('siteWeb')
    .optional()
    .isURL()
    .isLength({ max: 200 })
    .withMessage('L\'URL du site web ne peut pas dépasser 200 caractères'),

  body('logo')
    .optional()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('L\'URL du logo ne peut pas dépasser 500 caractères'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),

  body('devise')
    .optional()
    .isIn(['XOF', 'EUR', 'USD'])
    .withMessage('Devise invalide. Valeurs acceptées: XOF, EUR, USD'),

  body('timezone')
    .optional()
    .matches(/^Africa\/[A-Za-z_]+$/)
    .withMessage('Timezone invalide (doit commencer par Africa/)'),

  body('periodePayroll')
    .optional()
    .isIn(['MENSUEL', 'BIMENSUEL', 'HEBDOMADAIRE', 'QUINZAINE'])
    .withMessage('Période de paie invalide'),

  body('estActive')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),

  body('parametres')
    .optional()
    .isObject()
    .withMessage('Les paramètres doivent être un objet JSON valide')
];

// Validation pour la mise à jour d'une entreprise
const updateCompanyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide'),

  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'&]+$/)
    .withMessage('Le nom contient des caractères invalides'),

  body('adresse')
    .optional()
    .isLength({ max: 255 })
    .withMessage('L\'adresse ne peut pas dépasser 255 caractères'),

  body('telephone')
    .optional()
    .matches(/^(\+221|221)?[3-9][0-9]{7}$/)
    .withMessage('Format de téléphone invalide (ex: +221771234567 ou 771234567)'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),

  body('siteWeb')
    .optional()
    .isURL()
    .isLength({ max: 200 })
    .withMessage('L\'URL du site web ne peut pas dépasser 200 caractères'),

  body('logo')
    .optional()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('L\'URL du logo ne peut pas dépasser 500 caractères'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),

  body('devise')
    .optional()
    .isIn(['XOF', 'EUR', 'USD'])
    .withMessage('Devise invalide. Valeurs acceptées: XOF, EUR, USD'),

  body('timezone')
    .optional()
    .matches(/^Africa\/[A-Za-z_]+$/)
    .withMessage('Timezone invalide (doit commencer par Africa/)'),

  body('periodePayroll')
    .optional()
    .isIn(['MENSUEL', 'BIMENSUEL', 'HEBDOMADAIRE', 'QUINZAINE'])
    .withMessage('Période de paie invalide'),

  body('estActive')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),

  body('parametres')
    .optional()
    .isObject()
    .withMessage('Les paramètres doivent être un objet JSON valide')
];

// Validation pour les paramètres de requête de liste
const listCompaniesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères'),

  query('estActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Le filtre actif doit être true ou false'),

  query('sortBy')
    .optional()
    .isIn(['nom', 'createdAt', 'updatedAt'])
    .withMessage('Le tri doit être nom, createdAt ou updatedAt'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('L\'ordre de tri doit être asc ou desc')
];

// Routes

// GET /api/companies - Lister toutes les entreprises (SuperAdmin uniquement)
router.get('/',
  roleMiddleware(['SUPERADMIN']),
  listCompaniesValidation,
  validateRequest,
  async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        estActive: req.query.estActive === 'true' ? true : req.query.estActive === 'false' ? false : undefined,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await companyService.getAllCompanies(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des entreprises',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/companies/stats - Statistiques des entreprises (SuperAdmin uniquement)
router.get('/stats',
  roleMiddleware(['SUPERADMIN']),
  async (req, res) => {
    try {
      const stats = await companyService.getCompanyStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// POST /api/companies - Créer une nouvelle entreprise (SuperAdmin uniquement)
router.post('/',
  roleMiddleware(['SUPERADMIN']),
  createCompanyValidation,
  validateRequest,
  async (req, res) => {
    try {
      const companyData = req.body;
      const userId = req.user.id;

      const company = await companyService.createCompany(companyData, userId);

      res.status(201).json({
        success: true,
        message: 'Entreprise créée avec succès',
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);

      if (error.message.includes('existe déjà')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'entreprise',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/companies/:id - Récupérer une entreprise par ID (SuperAdmin uniquement)
router.get('/:id',
  roleMiddleware(['SUPERADMIN']),
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  validateRequest,
  async (req, res) => {
    try {
      const company = await companyService.getCompanyById(req.params.id);

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);

      if (error.message === 'Entreprise non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'entreprise',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// PUT /api/companies/:id - Mettre à jour une entreprise (SuperAdmin uniquement)
router.put('/:id',
  roleMiddleware(['SUPERADMIN']),
  updateCompanyValidation,
  validateRequest,
  async (req, res) => {
    try {
      const companyId = req.params.id;
      const updateData = req.body;
      const userId = req.user.id;

      const updatedCompany = await companyService.updateCompany(companyId, updateData, userId);

      res.json({
        success: true,
        message: 'Entreprise mise à jour avec succès',
        data: updatedCompany
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', error);

      if (error.message === 'Entreprise non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      if (error.message.includes('existe déjà')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'entreprise',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// PATCH /api/companies/:id/toggle-status - Activer/Désactiver une entreprise (SuperAdmin uniquement)
router.patch('/:id/toggle-status',
  roleMiddleware(['SUPERADMIN']),
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  validateRequest,
  async (req, res) => {
    try {
      const companyId = req.params.id;
      const userId = req.user.id;

      const updatedCompany = await companyService.toggleCompanyStatus(companyId, userId);

      res.json({
        success: true,
        message: `Entreprise ${updatedCompany.estActive ? 'activée' : 'désactivée'} avec succès`,
        data: updatedCompany
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);

      if (error.message === 'Entreprise non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de statut',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// DELETE /api/companies/:id - Supprimer une entreprise (SuperAdmin uniquement)
router.delete('/:id',
  roleMiddleware(['SUPERADMIN']),
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  validateRequest,
  async (req, res) => {
    try {
      const companyId = req.params.id;
      const userId = req.user.id;

      const result = await companyService.deleteCompany(companyId, userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entreprise:', error);

      if (error.message === 'Entreprise non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      if (error.message.includes('contient des employés')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'entreprise',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;