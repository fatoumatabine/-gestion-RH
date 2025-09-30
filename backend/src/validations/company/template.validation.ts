import { z } from 'zod'

export const createCompanyTemplateSchema = z.object({
  typeTemplate: z.string().min(1, 'Type de template requis'),
  nom: z.string().min(1, 'Nom requis'),
  contenu: z.string().min(1, 'Contenu requis'),
  variables: z.any(),
  estDefaut: z.boolean().default(false),
  estActif: z.boolean().default(true),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
})

export const updateCompanyTemplateSchema = z.object({
  typeTemplate: z.string().min(1, 'Type de template requis').optional(),
  nom: z.string().min(1, 'Nom requis').optional(),
  contenu: z.string().min(1, 'Contenu requis').optional(),
  variables: z.any().optional(),
  estDefaut: z.boolean().optional(),
  estActif: z.boolean().optional(),
})

export type CreateCompanyTemplateInput = z.infer<typeof createCompanyTemplateSchema>
export type UpdateCompanyTemplateInput = z.infer<typeof updateCompanyTemplateSchema>