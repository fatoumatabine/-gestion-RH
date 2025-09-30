import { z } from 'zod'

export const createEmployeeSchema = z.object({
  userId: z.number()
    .int('L\'ID utilisateur doit être un entier')
    .positive('L\'ID utilisateur doit être positif'),

  entrepriseId: z.number()
    .int('L\'ID entreprise doit être un entier')
    .positive('L\'ID entreprise doit être positif'),

  employeeId: z.string()
    .min(1, 'L\'ID employé est requis')
    .max(50, 'L\'ID employé ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9\-_]+$/, 'L\'ID employé ne peut contenir que des lettres majuscules, chiffres, tirets et underscores'),

  department: z.string()
    .max(100, 'Le département ne peut pas dépasser 100 caractères')
    .optional(),

  position: z.string()
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .optional(),

  salary: z.number()
    .positive('Le salaire doit être positif')
    .max(99999999.99, 'Le salaire ne peut pas dépasser 99,999,999.99')
    .optional(),

  hireDate: z.string()
    .datetime('La date d\'embauche doit être une date valide')
    .optional()
    .or(z.date()),

  phone: z.string()
    .regex(/^(\+221|221)?\s*[3-9][0-9]{1,2}\s*[0-9]{2,3}\s*[0-9]{2}\s*[0-9]{2}$|^(\+221|221)?[3-9][0-9]{7}$/, 'Format de téléphone invalide (ex: +221 77 123 45 67 ou 771234567)')
    .optional(),

  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),

  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED'], {
    errorMap: () => ({ message: 'Statut invalide. Valeurs acceptées: ACTIVE, INACTIVE, TERMINATED' })
  }).default('ACTIVE')
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  userId: createEmployeeSchema.shape.userId.optional(),
  entrepriseId: createEmployeeSchema.shape.entrepriseId.optional(),
  employeeId: createEmployeeSchema.shape.employeeId.optional()
})
