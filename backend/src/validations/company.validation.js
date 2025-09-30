import { body, param, query, validationResult } from 'express-validator';

export const createCompanyValidation = [
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

export const updateCompanyValidation = [
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

export const listCompaniesValidation = [
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

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données de validation invalides',
      errors: errors.array()
    });
  }
  next();
};