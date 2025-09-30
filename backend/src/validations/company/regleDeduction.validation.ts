import { z } from 'zod'

export const createCompanyRegleDeductionSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type requis'),
  formule: z.string().min(1, 'Formule requise'),
  conditionsApplication: z.any(),
  estObligatoire: z.boolean().default(false),
  ordre: z.number().int().min(0),
  configurationId: z.number().int().positive('ID configuration invalide'),
  estActif: z.boolean().default(true),
})

export const updateCompanyRegleDeductionSchema = z.object({
  nom: z.string().min(1, 'Nom requis').optional(),
  description: z.string().optional(),
  type: z.string().min(1, 'Type requis').optional(),
  formule: z.string().min(1, 'Formule requise').optional(),
  conditionsApplication: z.any().optional(),
  estObligatoire: z.boolean().optional(),
  ordre: z.number().int().min(0).optional(),
  estActif: z.boolean().optional(),
})

export type CreateCompanyRegleDeductionInput = z.infer<typeof createCompanyRegleDeductionSchema>
export type UpdateCompanyRegleDeductionInput = z.infer<typeof updateCompanyRegleDeductionSchema>