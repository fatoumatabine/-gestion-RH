import { z } from 'zod'

const CompanyStatutPayRunEnum = z.enum(['BROUILLON', 'EN_COURS', 'EN_ATTENTE_APPROBATION', 'APPROUVE', 'REJETE', 'COMPLETE', 'ANNULE'])

export const createCompanyPayRunSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  dateDebut: z.string().datetime('Date de début invalide'),
  dateFin: z.string().datetime('Date de fin invalide'),
  datePaiement: z.string().datetime('Date de paiement invalide'),
  statut: CompanyStatutPayRunEnum.default('BROUILLON'),
  totalBrut: z.number().positive('Total brut doit être positif'),
  totalNet: z.number().positive('Total net doit être positif'),
  totalDeductions: z.number().min(0, 'Total déductions doit être positif ou nul'),
  nombreEmployes: z.number().int().min(0, 'Nombre d\'employés doit être positif ou nul'),
  metadata: z.any().optional(),
  entrepriseId: z.number().int().positive('ID entreprise invalide'),
  periodePaieId: z.number().int().positive('ID période de paie invalide'),
  creePar: z.number().int().positive('ID créateur invalide'),
  approuveLe: z.string().datetime().optional(),
  approuvePar: z.number().int().positive().optional(),
})

export const updateCompanyPayRunSchema = z.object({
  reference: z.string().min(1, 'Référence requise').optional(),
  dateDebut: z.string().datetime('Date de début invalide').optional(),
  dateFin: z.string().datetime('Date de fin invalide').optional(),
  datePaiement: z.string().datetime('Date de paiement invalide').optional(),
  statut: CompanyStatutPayRunEnum.optional(),
  totalBrut: z.number().positive('Total brut doit être positif').optional(),
  totalNet: z.number().positive('Total net doit être positif').optional(),
  totalDeductions: z.number().min(0, 'Total déductions doit être positif ou nul').optional(),
  nombreEmployes: z.number().int().min(0, 'Nombre d\'employés doit être positif ou nul').optional(),
  metadata: z.any().optional(),
  approuveLe: z.string().datetime().optional(),
  approuvePar: z.number().int().positive().optional(),
})

export type CreateCompanyPayRunInput = z.infer<typeof createCompanyPayRunSchema>
export type UpdateCompanyPayRunInput = z.infer<typeof updateCompanyPayRunSchema>