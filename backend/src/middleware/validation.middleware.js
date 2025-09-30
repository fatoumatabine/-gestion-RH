import { validationResult } from 'express-validator';

/**
 * Middleware pour gérer les erreurs de validation express-validator
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
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

/**
 * Middleware pour valider les paramètres d'ID
 * @param {string} paramName - Nom du paramètre à valider
 */
export const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({
        success: false,
        message: `ID invalide: ${id}. L'ID doit être un entier positif.`
      });
    }

    // Ajouter l'ID numérique à la requête pour une utilisation ultérieure
    req.params[paramName] = idNum;
    next();
  };
};

/**
 * Middleware pour valider les paramètres de pagination
 */
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre page doit être un entier positif.'
      });
    }
    req.query.page = pageNum;
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre limit doit être un entier entre 1 et 100.'
      });
    }
    req.query.limit = limitNum;
  }

  next();
};

/**
 * Middleware pour valider les paramètres de tri
 * @param {Array<string>} allowedFields - Champs autorisés pour le tri
 */
export const validateSorting = (allowedFields = []) => {
  return (req, res, next) => {
    const { sortBy, sortOrder } = req.query;

    if (sortBy !== undefined) {
      if (!allowedFields.includes(sortBy)) {
        return res.status(400).json({
          success: false,
          message: `Champ de tri invalide: ${sortBy}. Champs autorisés: ${allowedFields.join(', ')}`
        });
      }
    }

    if (sortOrder !== undefined) {
      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'L\'ordre de tri doit être "asc" ou "desc".'
        });
      }
      req.query.sortOrder = sortOrder.toLowerCase();
    }

    next();
  };
};

/**
 * Middleware pour valider les paramètres de recherche
 * @param {Object} options - Options de validation
 */
export const validateSearch = (options = {}) => {
  const { maxLength = 100, allowedFields = [] } = options;

  return (req, res, next) => {
    const { search, searchField } = req.query;

    if (search !== undefined) {
      if (typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre search doit être une chaîne de caractères.'
        });
      }

      if (search.length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `La recherche ne peut pas dépasser ${maxLength} caractères.`
        });
      }

      // Échapper les caractères spéciaux pour la recherche
      req.query.search = search.trim();
    }

    if (searchField !== undefined && allowedFields.length > 0) {
      if (!allowedFields.includes(searchField)) {
        return res.status(400).json({
          success: false,
          message: `Champ de recherche invalide: ${searchField}. Champs autorisés: ${allowedFields.join(', ')}`
        });
      }
    }

    next();
  };
};