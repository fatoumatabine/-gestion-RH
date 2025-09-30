import { z } from 'zod'

export const createCompanyDocumentSchema = z.object({
  type: z.string().min(1, 'Type requis'),
  titre: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  cheminFichier: z.string().min(1, 'Chemin fichier requis'),
  tailleFichier: z.number().int().positive('Taille fichier doit être positive'),
  mimeType: z.string().min(1, 'Mime type requis'),
  metadata: z.any().optional(),
  tags: z.string().optional(),
  employeId: z.number().int().positive('ID employé invalide'),
  uploadePar: z.number().int().positive('ID upload invalide'),
})

export const updateCompanyDocumentSchema = z.object({
  type: z.string().min(1, 'Type requis').optional(),
  titre: z.string().min(1, 'Titre requis').optional(),
  description: z.string().optional(),
  cheminFichier: z.string().min(1, 'Chemin fichier requis').optional(),
  tailleFichier: z.number().int().positive('Taille fichier doit être positive').optional(),
  mimeType: z.string().min(1, 'Mime type requis').optional(),
  metadata: z.any().optional(),
  tags: z.string().optional(),
})

export type CreateCompanyDocumentInput = z.infer<typeof createCompanyDocumentSchema>
export type UpdateCompanyDocumentInput = z.infer<typeof updateCompanyDocumentSchema>