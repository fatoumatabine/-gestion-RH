import { z } from 'zod'

export const createCompanySettingSchema = z.object({
  cle: z.string().min(1, 'Clé requise'),
  valeur: z.string().min(1, 'Valeur requise'),
  description: z.string().optional(),
  typeData: z.string().min(1, 'Type de données requis'),
  estEncrypte: z.boolean().default(false),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
})

export const updateCompanySettingSchema = z.object({
  valeur: z.string().min(1, 'Valeur requise').optional(),
  description: z.string().optional(),
  typeData: z.string().min(1, 'Type de données requis').optional(),
  estEncrypte: z.boolean().optional(),
})

export type CreateCompanySettingInput = z.infer<typeof createCompanySettingSchema>
export type UpdateCompanySettingInput = z.infer<typeof updateCompanySettingSchema>