import { z } from 'zod'

export const createCompanyBulletinSchema = z.object({
  numeroBulletin: z.string().min(1, 'Numéro de bulletin requis'),
  datePaiement: z.string().datetime('Date de paiement invalide'),
  joursTravailles: z.number().int().min(0, 'Jours travaillés doit être positif ou nul'),
  heuresTravailes: z.number().int().min(0, 'Heures travaillées doit être positif ou nul'),
  salaireBrut: z.number().positive('Salaire brut doit être positif'),
  salaireBase: z.number().positive('Salaire de base doit être positif'),
  montantHeuresSupp: z.number().min(0, 'Montant heures supp doit être positif ou nul'),
  montantBonus: z.number().min(0, 'Montant bonus doit être positif ou nul'),
  indemnites: z.number().min(0, 'Indemnités doit être positif ou nul'),
  deductions: z.any().optional(),
  totalDeductions: z.number().min(0, 'Total déductions doit être positif ou nul'),
  salaireNet: z.number().positive('Salaire net doit être positif'),
  montantPaye: z.number().min(0, 'Montant payé doit être positif ou nul'),
  resteAPayer: z.number().min(0, 'Reste à payer doit être positif ou nul'),
  statutPaiement: z.string().min(1, 'Statut de paiement requis'),
  cheminPDF: z.string().optional(),
  calculs: z.any().optional(),
  estVerrouille: z.boolean().default(false),
  payRunId: z.number().int().positive('ID pay run invalide'),
  employeId: z.number().int().positive('ID employé invalide'),
})

export const updateCompanyBulletinSchema = z.object({
  numeroBulletin: z.string().min(1, 'Numéro de bulletin requis').optional(),
  datePaiement: z.string().datetime('Date de paiement invalide').optional(),
  joursTravailles: z.number().int().min(0, 'Jours travaillés doit être positif ou nul').optional(),
  heuresTravailes: z.number().int().min(0, 'Heures travaillées doit être positif ou nul').optional(),
  salaireBrut: z.number().positive('Salaire brut doit être positif').optional(),
  salaireBase: z.number().positive('Salaire de base doit être positif').optional(),
  montantHeuresSupp: z.number().min(0, 'Montant heures supp doit être positif ou nul').optional(),
  montantBonus: z.number().min(0, 'Montant bonus doit être positif ou nul').optional(),
  indemnites: z.number().min(0, 'Indemnités doit être positif ou nul').optional(),
  deductions: z.any().optional(),
  totalDeductions: z.number().min(0, 'Total déductions doit être positif ou nul').optional(),
  salaireNet: z.number().positive('Salaire net doit être positif').optional(),
  montantPaye: z.number().min(0, 'Montant payé doit être positif ou nul').optional(),
  resteAPayer: z.number().min(0, 'Reste à payer doit être positif ou nul').optional(),
  statutPaiement: z.string().min(1, 'Statut de paiement requis').optional(),
  cheminPDF: z.string().optional(),
  calculs: z.any().optional(),
  estVerrouille: z.boolean().optional(),
})

export type CreateCompanyBulletinInput = z.infer<typeof createCompanyBulletinSchema>
export type UpdateCompanyBulletinInput = z.infer<typeof updateCompanyBulletinSchema>