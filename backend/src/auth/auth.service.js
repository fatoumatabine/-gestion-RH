import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.config.js';
import { prisma } from '../database/prisma.client.js';

export class AuthService {
  static async validateUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Préparer les données spécifiques selon le rôle
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions || {}
    };

    switch (user.role) {
      case 'SUPERADMIN':
        // Le superadmin a accès à toutes les entreprises et leurs données
        const entreprises = await prisma.entreprise.findMany({
          select: {
            id: true,
            nom: true,
            estActive: true
          }
        });
        return { ...userData, entreprises };

      case 'ADMIN':
        // L'admin a accès aux données de son entreprise
        // TODO: Implémenter la logique pour récupérer l'entreprise de l'admin
        return { ...userData };

      case 'CASHIER':
        // Le caissier n'a accès qu'à ses propres données et informations basiques de l'entreprise
        // TODO: Implémenter la logique pour récupérer les données d'employé du caissier
        return { ...userData };

      default:
        return userData;
    }
  }

  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
      },
    });

    return user;
  }

  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      entrepriseId: user.entrepriseId, // Ajouter l'ID entreprise pour filtrer les données
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}