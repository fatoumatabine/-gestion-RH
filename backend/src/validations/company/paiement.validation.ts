import { z } from 'zod'

const CompanyMethodePaiementEnum = z.enum(['ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY', 'AUTRE'])
const CompanyStatutPaiementEnum = z.enum(['EN_ATTENTE', 'TRAITE', 'ECHOUE', 'ANNULE'])

export const createCompanyPaiementSchema = z.object({
  referenceTransaction: z.string().min(1, 'Référence transaction requise'),
  montant: z.number().positive('Montant doit être positif'),
  methodePaiement: CompanyMethodePaiementEnum,
  referencePaiement: z.string().optional(),
  datePaiement: z.string().datetime('Date de paiement invalide'),
  notes: z.string().optional(),
  cheminRecu: z.string().optional(),
  statut: CompanyStatutPaiementEnum,
  metadata: z.any().optional(),
  bulletinId: z.number().int().positive('ID bulletin invalide'),
  traitePar: z.number().int().positive('ID traitant invalide'),
})

export const updateCompanyPaiementSchema = z.object({
  referenceTransaction: z.string().min(1, 'Référence transaction requise').optional(),
  montant: z.number().positive('Montant doit être positif').optional(),
  methodePaiement: CompanyMethodePaiementEnum.optional(),
  referencePaiement: z.string().optional(),
  datePaiement: z.string().datetime('Date de paiement invalide').optional(),
  notes: z.string().optional(),
  cheminRecu: z.string().optional(),
  statut: CompanyStatutPaiementEnum.optional(),
  metadata: z.any().optional(),
})

export type CreateCompanyPaiementInput = z.infer<typeof createCompanyPaiementSchema>
export type UpdateCompanyPaiementInput = z.infer<typeof updateCompanyPaiementSchema>