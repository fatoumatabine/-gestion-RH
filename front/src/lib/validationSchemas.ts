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
    .max(50, 'L\'ID employé ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9\-_]+$/, 'L\'ID employé ne peut contenir que des lettres majuscules, chiffres, tirets et underscores'),
  department: z
    .string()
    .max(100, 'Le département ne peut pas dépasser 100 caractères')
    .optional(),
  position: z
    .string()
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .optional(),
  salary: z
    .number()
    .refine(val => !isNaN(val), 'Salaire invalide')
    .positive('Le salaire doit être positif')
    .max(99999999.99, 'Le salaire ne peut pas dépasser 99,999,999.99')
    .optional(),
  hireDate: z
    .string()
    .optional(),
  phone: z
    .string()
    .regex(/^(\+221|221)?\s*[3-9][0-9]{1,2}\s*[0-9]{2,3}\s*[0-9]{2}\s*[0-9]{2}$|^(\+221|221)?[3-9][0-9]{7}$/, 'Format de téléphone invalide (ex: +221 77 123 45 67 ou 771234567)')
    .optional(),
  address: z
    .string()
    .optional(),
});

// Schéma de validation pour la création d'employé avec utilisateur
export const createEmployeeWithUserSchema = z.object({
  // Champs utilisateur
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
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z
    .enum(['ADMIN', 'CASHIER', 'EMPLOYEE'])
    .default('CASHIER'),
  phone: z
    .string()
    .regex(/^(\+221|221)?\s*[3-9][0-9]{1,2}\s*[0-9]{2,3}\s*[0-9]{2}\s*[0-9]{2}$|^(\+221|221)?[3-9][0-9]{7,8}$/, 'Format de téléphone invalide (ex: +221 77 123 45 67 ou 771234567)')
    .optional()
    .or(z.literal('')),
  // Champs employé
  department: z
    .string()
    .max(100, 'Le département ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  position: z
    .string()
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  salary: z
    .union([z.number(), z.string()])
    .optional()
    .refine(val => val === undefined || val === '' || (!isNaN(Number(val)) && Number(val) > 0), 'Le salaire doit être un nombre positif')
    .transform(val => val === '' || val === undefined ? undefined : Number(val)),
});

// Types dérivés des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type CreateEmployeeWithUserFormData = z.infer<typeof createEmployeeWithUserSchema>;