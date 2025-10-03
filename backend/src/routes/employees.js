import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema.js';

const router = Router();

// Get all employees with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalEmployees = await prisma.employee.count();

    const employees = await prisma.employee.findMany({
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPages = Math.ceil(totalEmployees / limit);

    res.json({
      employees,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalEmployees,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employees by company ID with pagination
router.get('/company/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalEmployees = await prisma.employee.count({
      where: { entrepriseId: parseInt(companyId) }
    });

    const employees = await prisma.employee.findMany({
      where: { entrepriseId: parseInt(companyId) },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPages = Math.ceil(totalEmployees / limit);

    res.json({
      employees,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalEmployees,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching employees by company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create employee
router.post('/', auth, async (req, res) => {
  try {
    // Validation avec Zod
    const validationResult = createEmployeeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Données de validation invalides',
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'entreprise existe
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: validatedData.entrepriseId }
    });

    if (!entreprise) {
      return res.status(400).json({ message: 'Entreprise non trouvée' });
    }

    // Générer automatiquement un matricule unique
    const company = await prisma.entreprise.findUnique({
      where: { id: validatedData.entrepriseId },
      select: { id: true }
    });

    if (!company) {
      return res.status(400).json({ message: 'Entreprise non trouvée' });
    }

    // Compter les employés existants de cette entreprise pour générer le numéro séquentiel
    const employeeCount = await prisma.employee.count({
      where: { entrepriseId: validatedData.entrepriseId }
    });

    // Générer le matricule : ENT-{entrepriseId}-{numéro sur 4 chiffres}
    const matricule = `ENT-${validatedData.entrepriseId}-${String(employeeCount + 1).padStart(4, '0')}`;

    // Vérifier si ce matricule existe déjà (très improbable mais sécurité)
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: matricule }
    });

    if (existingEmployee) {
      return res.status(500).json({ message: 'Erreur de génération du matricule. Veuillez réessayer.' });
    }

    // Vérifier si l'utilisateur n'est pas déjà employé
    const existingUserEmployee = await prisma.employee.findUnique({
      where: { userId: validatedData.userId }
    });

    if (existingUserEmployee) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà employé' });
    }

    // Générer automatiquement un QR code unique pour l'employé
    const { generateSimpleQRCode } = await import('../utils/qrCode.js');
    const qrCode = await generateSimpleQRCode(matricule);

    const employee = await prisma.employee.create({
      data: {
        ...validatedData,
        employeeId: matricule, // Utiliser le matricule généré automatiquement
        qrCode: qrCode
      }
    });

    // Créer une notification pour tous les administrateurs
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERADMIN']
          }
        }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Nouvel employé ajouté',
            message: `Un nouvel employé ${user.firstName} ${user.lastName} a été ajouté à l'entreprise ${entreprise.nom}`,
            type: 'SUCCESS',
            category: 'Employés',
            link: `/employees`,
            isRead: false
          }
        });
      }
    } catch (notificationError) {
      console.error('Erreur lors de la création de la notification:', notificationError);
      // Ne pas échouer la création de l'employé si la notification échoue
    }

    // Envoyer les emails avec le QR code
    try {
      const { sendEmployeeQRCodeEmail, sendAdminNotificationEmail } = await import('../utils/email.js');

      // Préparer les données pour l'email
      const employeeEmailData = {
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: matricule,
        department: validatedData.department,
        position: validatedData.position,
        qrCode: qrCode,
        email: user.email
      };

      // Envoyer l'email avec le QR code à l'employé
      await sendEmployeeQRCodeEmail(user.email, employeeEmailData);

      // Envoyer les notifications par email aux administrateurs
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERADMIN']
          }
        },
        select: {
          email: true
        }
      });

      for (const admin of admins) {
        if (admin.email) {
          await sendAdminNotificationEmail(admin.email, employeeEmailData, entreprise.nom);
        }
      }

    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // Ne pas échouer la création de l'employé si l'envoi d'email échoue
    }

    res.status(201).json({
      message: 'Employé créé avec succès',
      employee
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'employé' });
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validation avec Zod
    const validationResult = updateEmployeeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Données de validation invalides',
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Vérifier si l'employé existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Vérifier les contraintes si elles sont modifiées
    if (validatedData.userId && validatedData.userId !== existingEmployee.userId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId }
      });

      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé' });
      }

      // Vérifier si l'utilisateur n'est pas déjà employé ailleurs
      const existingUserEmployee = await prisma.employee.findFirst({
        where: {
          userId: validatedData.userId,
          id: { not: parseInt(id) }
        }
      });

      if (existingUserEmployee) {
        return res.status(400).json({ message: 'Cet utilisateur est déjà employé ailleurs' });
      }
    }

    if (validatedData.employeeId && validatedData.employeeId !== existingEmployee.employeeId) {
      const existingEmployeeId = await prisma.employee.findUnique({
        where: { employeeId: validatedData.employeeId }
      });

      if (existingEmployeeId) {
        return res.status(400).json({ message: 'Un employé avec cet ID existe déjà' });
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: validatedData
    });

    res.json({
      message: 'Employé mis à jour avec succès',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.employee.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;