import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'adresse email est requise'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .min(1, 'Le prénom est requis'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'CASHIER', 'SUPERADMIN']).default('CASHIER'),
  termsAccepted: z.boolean()
    .refine((val) => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation'
    })
});