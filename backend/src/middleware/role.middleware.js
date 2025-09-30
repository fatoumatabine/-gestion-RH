/**
 * Middleware pour vérifier les rôles des utilisateurs
 * @param {Array<string>} allowedRoles - Liste des rôles autorisés
 * @returns {Function} Middleware Express
 */
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Vérifier si le rôle de l'utilisateur est autorisé
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé: rôle insuffisant',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }

      // Autoriser l'accès
      next();
    } catch (error) {
      console.error('Erreur dans le middleware de rôle:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est SuperAdmin
 */
export const superAdminOnly = roleMiddleware(['SUPERADMIN']);

/**
 * Middleware pour vérifier si l'utilisateur est Admin ou SuperAdmin
 */
export const adminOrSuperAdmin = roleMiddleware(['ADMIN', 'SUPERADMIN']);

/**
 * Middleware pour vérifier si l'utilisateur est au moins Cashier
 */
export const cashierOrAbove = roleMiddleware(['CASHIER', 'ADMIN', 'SUPERADMIN']);

/**
 * Middleware pour vérifier si l'utilisateur est au moins Employee
 */
export const employeeOrAbove = roleMiddleware(['EMPLOYEE', 'CASHIER', 'ADMIN', 'SUPERADMIN']);