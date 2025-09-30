import { z } from 'zod';

// Schémas de validation pour les employés
export const employeeSchema = z.object({
  userId: z.number(),
  employeeId: z.string().min(1),
  department: z.string().min(1),
  position: z.string().min(1),
  salary: z.number().positive(),
  hireDate: z.string().datetime(),
  phone: z.string().min(1),
  address: z.string().min(1)
});

// Schémas de validation pour les factures
export const invoiceSchema = z.object({
  employeeId: z.number(),
  numeroFacture: z.string().min(1),
  montant: z.number().positive(),
  description: z.string().optional(),
  dateEcheance: z.string().datetime().optional(),
  lignesFacture: z.array(z.object({
    description: z.string().min(1),
    quantite: z.number().int().positive(),
    prixUnitaire: z.number().positive(),
    prixTotal: z.number().positive()
  }))
});

// Schémas de validation pour les utilisateurs
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'CASHIER', 'EMPLOYEE']),
  phone: z.string().optional()
});

// Schémas de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Schémas de validation pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});