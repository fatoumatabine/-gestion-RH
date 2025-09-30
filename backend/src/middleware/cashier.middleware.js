import { prisma } from '../database/prisma.client.js';

export const requireCashier = async (req, res, next) => {
  try {
    // L'utilisateur est déjà authentifié via le middleware auth
    // req.user contient les informations de l'utilisateur
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!['CASHIER', 'ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle CASHIER, ADMIN ou SUPERADMIN requis.'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur dans le middleware cashier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};