import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @route GET /api/users
 * @desc Récupérer tous les utilisateurs avec pagination
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalUsers = await prisma.user.count();

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        employee: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Récupérer un utilisateur par son ID
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        employee: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

/**
 * @route POST /api/users
 * @desc Créer un nouvel utilisateur
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Validation des données
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    // Validation du rôle
    const validRoles = ['ADMIN', 'CASHIER', 'SUPERADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Les rôles valides sont: ADMIN, CASHIER, SUPERADMIN' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Mettre à jour un utilisateur
 * @access Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        firstName,
        lastName,
        phone,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        employee: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

/**
 * @route PUT /api/users/:id/password
 * @desc Changer le mot de passe d'un utilisateur
 * @access Private
 */
router.put('/:id/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier l'ancien mot de passe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { passwordHash }
    });

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
  }
});

/**
 * @route GET /api/users/me/company
 * @desc Récupérer l'entreprise de l'utilisateur connecté
 * @access Private
 */
router.get('/me/company', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const userId = req.user.id;

    // Récupérer l'employé de l'utilisateur
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        entreprise: true
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Aucun employé trouvé pour cet utilisateur' });
    }

    res.json(employee.entreprise);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise' });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Supprimer un utilisateur
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

export default router;