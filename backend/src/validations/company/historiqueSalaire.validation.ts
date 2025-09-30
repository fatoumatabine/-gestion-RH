import { z } from 'zod'

export const createCompanyHistoriqueSalaireSchema = z.object({
  employeId: z.number().int().positive('ID employé invalide'),
  ancienSalaire: z.number().positive('Ancien salaire doit être positif'),
  nouveauSalaire: z.number().positive('Nouveau salaire doit être positif'),
  dateEffet: z.string().datetime('Date d\'effet invalide'),
  motif: z.string().min(1, 'Motif requis'),
  notes: z.string().optional(),
  documents: z.any().optional(),
  modifiePar: z.number().int().positive('ID modificateur invalide'),
})

export const updateCompanyHistoriqueSalaireSchema = z.object({
  ancienSalaire: z.number().positive('Ancien salaire doit être positif').optional(),
  nouveauSalaire: z.number().positive('Nouveau salaire doit être positif').optional(),
  dateEffet: z.string().datetime('Date d\'effet invalide').optional(),
  motif: z.string().min(1, 'Motif requis').optional(),
  notes: z.string().optional(),
  documents: z.any().optional(),
})

export type CreateCompanyHistoriqueSalaireInput = z.infer<typeof createCompanyHistoriqueSalaireSchema>
export type UpdateCompanyHistoriqueSalaireInput = z.infer<typeof updateCompanyHistoriqueSalaireSchema>