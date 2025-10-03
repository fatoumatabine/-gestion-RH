import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config.js';
import { prisma } from '../database/prisma.client.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifier que l'utilisateur existe en base de données
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé. Veuillez vous reconnecter.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    console.error('Erreur d\'authentification:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
