import { z } from 'zod'

const EmployeeStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED'])

export const createEmployeeSchema = z.object({
  userId: z.number().int().positive('ID utilisateur invalide'),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
  employeeId: z.string().min(1, 'ID employé requis'),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.number().positive('Salaire doit être positif').optional(),
  hireDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: EmployeeStatusEnum.default('ACTIVE'),
})

export const updateEmployeeSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.number().positive('Salaire doit être positif').optional(),
  hireDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: EmployeeStatusEnum.optional(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>