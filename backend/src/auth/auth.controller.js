import { AuthService } from './auth.service.js';
import { loginSchema, registerSchema } from '../validation/auth.schema.js';
import { TokenManager } from '../middleware/security.middleware.js';
import { prisma } from '../database/prisma.client.js';

export class AuthController {
  static async login(req, res) {
    try {
      // Validation des données
      const validatedData = loginSchema.parse(req.body);

      // Authentification de l'utilisateur
      const user = await AuthService.validateUser(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Génération du token
      const token = AuthService.generateToken(user);

      // Préparation de la réponse selon le rôle
      const response = {
        token,
        user
      };

      // Ajout des redirections spécifiques selon le rôle
      switch (user.role) {
        case 'SUPERADMIN':
          response.redirect = '/dashboard/admin';
          response.permissions = {
            canManageEnterprises: true,
            canManageUsers: true,
            canManageSettings: true,
            canViewAllData: true
          };
          break;
        case 'ADMIN':
          response.redirect = '/dashboard/enterprise';
          response.permissions = {
            canManageEmployees: true,
            canManagePayroll: true,
            canViewReports: true,
            canManageInvoices: true
          };
          break;
        case 'CASHIER':
          response.redirect = '/dashboard/cashier';
          response.permissions = {
            canCreateInvoices: true,
            canProcessPayments: true,
            canViewOwnData: true
          };
          break;
      }

      res.json(response);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Erreur de connexion:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  static async register(req, res) {
    try {
      // Validation des données
      const validatedData = registerSchema.parse(req.body);

      // Vérification si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Création de l'utilisateur
      const user = await AuthService.createUser(validatedData);

      // Génération des tokens
      const accessToken = AuthService.generateToken(user);
      const refreshToken = TokenManager.generateRefreshToken(user.id);

      // Configuration du cookie sécurisé pour le refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        sameSite: 'strict'
      });

      // Envoi de la réponse avec l'access token
      res.status(201).json({
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Erreur d\'inscription:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
}