import { z } from 'zod'

export const createJournalAuditSchema = z.object({
  utilisateurId: z.number().int().positive().optional(),
  action: z.string().min(1, 'Action requise'),
  nomTable: z.string().min(1, 'Nom de table requis'),
  idEnregistrement: z.number().int().positive().optional(),
  anciennes_valeurs: z.any().optional(),
  nouvelles_valeurs: z.any().optional(),
})

export const updateJournalAuditSchema = z.object({
  // Probably not updatable, but for completeness
  anciennes_valeurs: z.any().optional(),
  nouvelles_valeurs: z.any().optional(),
})

export type CreateJournalAuditInput = z.infer<typeof createJournalAuditSchema>
export type UpdateJournalAuditInput = z.infer<typeof updateJournalAuditSchema>