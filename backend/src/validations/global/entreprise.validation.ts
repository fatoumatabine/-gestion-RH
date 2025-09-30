import { z } from 'zod'

export const createEntrepriseSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  siteWeb: z.string().url('URL invalide').optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  devise: z.string().default('XOF'),
  timezone: z.string().default('Africa/Dakar'),
  periodePayroll: z.string().default('MENSUEL'),
  estActive: z.boolean().default(true),
  parametres: z.any().optional(),
})

export const updateEntrepriseSchema = z.object({
  nom: z.string().min(1, 'Nom requis').optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  siteWeb: z.string().url('URL invalide').optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  devise: z.string().optional(),
  timezone: z.string().optional(),
  periodePayroll: z.string().optional(),
  estActive: z.boolean().optional(),
  parametres: z.any().optional(),
})

export type CreateEntrepriseInput = z.infer<typeof createEntrepriseSchema>
export type UpdateEntrepriseInput = z.infer<typeof updateEntrepriseSchema>