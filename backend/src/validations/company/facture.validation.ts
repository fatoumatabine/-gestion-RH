import { z } from 'zod'

const CompanyStatutFactureEnum = z.enum(['EN_ATTENTE', 'PAYEE', 'ANNULEE'])

export const createCompanyFactureSchema = z.object({
  employeeId: z.number().int().positive('ID employé invalide'),
  numeroFacture: z.string().min(1, 'Numéro de facture requis'),
  montant: z.number().positive('Montant doit être positif'),
  description: z.string().optional(),
  statut: CompanyStatutFactureEnum.default('EN_ATTENTE'),
  dateEcheance: z.string().datetime().optional(),
  datePaiement: z.string().datetime().optional(),
  creePar: z.number().int().positive('ID créateur invalide'),
})

export const updateCompanyFactureSchema = z.object({
  numeroFacture: z.string().min(1, 'Numéro de facture requis').optional(),
  montant: z.number().positive('Montant doit être positif').optional(),
  description: z.string().optional(),
  statut: CompanyStatutFactureEnum.optional(),
  dateEcheance: z.string().datetime().optional(),
  datePaiement: z.string().datetime().optional(),
})

export const createCompanyLigneFactureSchema = z.object({
  factureId: z.number().int().positive('ID facture invalide'),
  description: z.string().min(1, 'Description requise'),
  quantite: z.number().int().min(1, 'Quantité doit être au moins 1').default(1),
  prixUnitaire: z.number().positive('Prix unitaire doit être positif'),
  prixTotal: z.number().positive('Prix total doit être positif'),
})

export const updateCompanyLigneFactureSchema = z.object({
  description: z.string().min(1, 'Description requise').optional(),
  quantite: z.number().int().min(1, 'Quantité doit être au moins 1').optional(),
  prixUnitaire: z.number().positive('Prix unitaire doit être positif').optional(),
  prixTotal: z.number().positive('Prix total doit être positif').optional(),
})

export type CreateCompanyFactureInput = z.infer<typeof createCompanyFactureSchema>
export type UpdateCompanyFactureInput = z.infer<typeof updateCompanyFactureSchema>
export type CreateCompanyLigneFactureInput = z.infer<typeof createCompanyLigneFactureSchema>
export type UpdateCompanyLigneFactureInput = z.infer<typeof updateCompanyLigneFactureSchema>