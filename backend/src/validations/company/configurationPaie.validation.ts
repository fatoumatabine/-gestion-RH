import { z } from 'zod'

export const createCompanyConfigurationPaieSchema = z.object({
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
  jourPaie: z.number().int().min(1).max(31),
  periodeCalcul: z.string().min(1, 'Période calcul requise'),
  regleArrondi: z.string().min(1, 'Règle arrondi requise'),
  deviseSecondaire: z.string().optional(),
  tauxChange: z.number().positive().optional(),
  formatNumeration: z.any(),
  regleValidation: z.any(),
  parametresCalcul: z.any(),
})

export const updateCompanyConfigurationPaieSchema = z.object({
  jourPaie: z.number().int().min(1).max(31).optional(),
  periodeCalcul: z.string().min(1, 'Période calcul requise').optional(),
  regleArrondi: z.string().min(1, 'Règle arrondi requise').optional(),
  deviseSecondaire: z.string().optional(),
  tauxChange: z.number().positive().optional(),
  formatNumeration: z.any().optional(),
  regleValidation: z.any().optional(),
  parametresCalcul: z.any().optional(),
})

export type CreateCompanyConfigurationPaieInput = z.infer<typeof createCompanyConfigurationPaieSchema>
export type UpdateCompanyConfigurationPaieInput = z.infer<typeof updateCompanyConfigurationPaieSchema>