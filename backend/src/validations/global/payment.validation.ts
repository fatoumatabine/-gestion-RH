import { z } from 'zod'

const PaymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'MOBILE_MONEY'])
const PaymentStatusEnum = z.enum(['PENDING', 'PROCESSED', 'CANCELLED', 'FAILED'])

export const createPaymentSchema = z.object({
  employeeId: z.number().int().positive('ID employé invalide'),
  amount: z.number().positive('Montant doit être positif'),
  paymentDate: z.string().datetime().optional(),
  paymentMethod: PaymentMethodEnum.default('CASH'),
  reference: z.string().optional(),
  status: PaymentStatusEnum.default('PENDING'),
  notes: z.string().optional(),
  processedBy: z.number().int().positive().optional(),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Montant doit être positif').optional(),
  paymentDate: z.string().datetime().optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  reference: z.string().optional(),
  status: PaymentStatusEnum.optional(),
  notes: z.string().optional(),
  processedBy: z.number().int().positive().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>