import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema.js';

const router = Router();

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
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
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employees by company ID
router.get('/company/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const employees = await prisma.employee.findMany({
      where: { entrepriseId: parseInt(companyId) },
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
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees by company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) }
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

    // Vérifier si l'employeeId est unique
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: validatedData.employeeId }
    });

    if (existingEmployee) {
      return res.status(400).json({ message: 'Un employé avec cet ID existe déjà' });
    }

    // Vérifier si l'utilisateur n'est pas déjà employé
    const existingUserEmployee = await prisma.employee.findUnique({
      where: { userId: validatedData.userId }
    });

    if (existingUserEmployee) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà employé' });
    }

    const employee = await prisma.employee.create({
      data: validatedData
    });

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