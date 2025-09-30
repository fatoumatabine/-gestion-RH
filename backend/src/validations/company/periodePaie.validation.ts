import { z } from 'zod'

export const createCompanyPeriodePaieSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  dateDebut: z.string().datetime('Date de début invalide'),
  dateFin: z.string().datetime('Date de fin invalide'),
  estCloturee: z.boolean().default(false),
  dateReglement: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
})

export const updateCompanyPeriodePaieSchema = z.object({
  nom: z.string().min(1, 'Nom requis').optional(),
  dateDebut: z.string().datetime('Date de début invalide').optional(),
  dateFin: z.string().datetime('Date de fin invalide').optional(),
  estCloturee: z.boolean().optional(),
  dateReglement: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
})

export type CreateCompanyPeriodePaieInput = z.infer<typeof createCompanyPeriodePaieSchema>
export type UpdateCompanyPeriodePaieInput = z.infer<typeof updateCompanyPeriodePaieSchema>