import { z } from 'zod'

const RoleEnum = z.enum(['ADMIN', 'CASHIER', 'SUPERADMIN'])

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: RoleEnum.default('CASHIER'),
  phone: z.string().optional(),
  twoFactorEnabled: z.boolean().default(false),
  permissions: z.any().optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  role: RoleEnum.optional(),
  phone: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  permissions: z.any().optional(),
})

export const loginUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>