import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

// Rate limiter pour l'authentification
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives maximum
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation du mot de passe
export const passwordValidator = {
    isStrong: (value) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        if (value.length < minLength) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }
        if (!hasUpperCase) {
            throw new Error('Le mot de passe doit contenir au moins une majuscule');
        }
        if (!hasLowerCase) {
            throw new Error('Le mot de passe doit contenir au moins une minuscule');
        }
        if (!hasNumbers) {
            throw new Error('Le mot de passe doit contenir au moins un chiffre');
        }
        if (!hasSpecialChar) {
            throw new Error('Le mot de passe doit contenir au moins un caractère spécial');
        }

        return true;
    }
};

// Middleware de sécurité général
export const securityMiddleware = [
    helmet(), // Protection contre les vulnérabilités web courantes
    helmet.noSniff(), // Empêche le MIME sniffing
    helmet.xssFilter(), // Protection XSS basique
    helmet.frameguard({ action: 'deny' }), // Protection contre le clickjacking
    helmet.hidePoweredBy(), // Cache l'en-tête X-Powered-By
];

// Gestionnaire de token de rafraîchissement
export class TokenManager {
    static refreshTokens = new Map();

    static generateRefreshToken(userId) {
        const refreshToken = crypto.randomBytes(40).toString('hex');
        this.refreshTokens.set(refreshToken, {
            userId,
            createdAt: new Date()
        });
        return refreshToken;
    }

    static verifyRefreshToken(token) {
        const tokenData = this.refreshTokens.get(token);
        if (!tokenData) return null;

        // Vérifier si le token n'a pas expiré (30 jours)
        const now = new Date();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (now.getTime() - tokenData.createdAt.getTime() > thirtyDaysInMs) {
            this.refreshTokens.delete(token);
            return null;
        }

        return tokenData.userId;
    }

    static removeRefreshToken(token) {
        this.refreshTokens.delete(token);
    }
}

// Middleware de validation des sessions
export const validateSession = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken) {
            if (!refreshToken) {
                return res.status(401).json({ message: 'Session expirée' });
            }

            // Tenter de rafraîchir la session
            const userId = TokenManager.verifyRefreshToken(refreshToken);
            if (!userId) {
                return res.status(401).json({ message: 'Session invalide' });
            }

            // Générer un nouveau token d'accès
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }

            const newAccessToken = AuthService.generateToken(user);
            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Session invalide' });
    }
};