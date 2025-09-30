import { z } from 'zod'

export const createCompanyModeleDocumentSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type requis'),
  contenu: z.string().min(1, 'Contenu requis'),
  variables: z.any(),
  estActif: z.boolean().default(true),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
  version: z.number().int().min(1).default(1),
  creePar: z.number().int().positive('ID créateur invalide'),
})

export const updateCompanyModeleDocumentSchema = z.object({
  nom: z.string().min(1, 'Nom requis').optional(),
  description: z.string().optional(),
  type: z.string().min(1, 'Type requis').optional(),
  contenu: z.string().min(1, 'Contenu requis').optional(),
  variables: z.any().optional(),
  estActif: z.boolean().optional(),
  version: z.number().int().min(1).optional(),
})

export type CreateCompanyModeleDocumentInput = z.infer<typeof createCompanyModeleDocumentSchema>
export type UpdateCompanyModeleDocumentInput = z.infer<typeof updateCompanyModeleDocumentSchema>