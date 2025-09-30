import { z } from 'zod';

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  role: z
    .enum(['ADMIN', 'CASHIER', 'EMPLOYEE'])
    .default('CASHIER'),
});

// Schéma de validation pour l'ajout d'employé
export const employeeSchema = z.object({
  userId: z
    .number()
    .int('L\'ID utilisateur doit être un entier')
    .positive('L\'ID utilisateur doit être positif'),
  entrepriseId: z
    .number()
    .int('L\'ID entreprise doit être un entier')
    .positive('L\'ID entreprise doit être positif'),
  employeeId: z
    .string()
    .min(1, 'L\'ID employé est requis')
    .max(50, 'L\'ID employé ne peut pas dépasser 50 caractères'),
  department: z
    .string()
    .optional(),
  position: z
    .string()
    .optional(),
  salary: z
    .number()
    .positive('Le salaire doit être positif')
    .optional(),
  hireDate: z
    .string()
    .optional(),
  phone: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(),
});

// Types dérivés des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;