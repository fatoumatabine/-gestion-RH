import { paymentRepository } from '../../repositories/global/payment.repository.js'
import { createPaymentSchema, updatePaymentSchema, CreatePaymentInput, UpdatePaymentInput } from '../../validations/global/payment.validation.js'

export class PaymentService {
  async createPayment(data: CreatePaymentInput) {
    // Validate input
    const validatedData = createPaymentSchema.parse(data)

    // Check if reference is unique
    if (validatedData.reference) {
      const existingPayment = await paymentRepository.findByReference(validatedData.reference)
      if (existingPayment) {
        throw new Error('Une référence de paiement avec ce numéro existe déjà')
      }
    }

    return paymentRepository.create(validatedData)
  }

  async getPaymentById(id: number) {
    const payment = await paymentRepository.findById(id, {
      employee: {
        select: {
          id: true,
          employeeId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      cashier: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    })
    if (!payment) {
      throw new Error('Paiement non trouvé')
    }
    return payment
  }

  async updatePayment(id: number, data: UpdatePaymentInput) {
    // Validate input
    const validatedData = updatePaymentSchema.parse(data)

    // Check if payment exists
    const existingPayment = await paymentRepository.findById(id)
    if (!existingPayment) {
      throw new Error('Paiement non trouvé')
    }

    // Check reference uniqueness if changing
    if (validatedData.reference && validatedData.reference !== existingPayment.reference) {
      const paymentWithReference = await paymentRepository.findByReference(validatedData.reference)
      if (paymentWithReference) {
        throw new Error('Une référence de paiement avec ce numéro existe déjà')
      }
    }

    return paymentRepository.update(id, validatedData)
  }

  async deletePayment(id: number) {
    const payment = await paymentRepository.findById(id)
    if (!payment) {
      throw new Error('Paiement non trouvé')
    }

    await paymentRepository.delete(id)
    return { message: 'Paiement supprimé avec succès' }
  }

  async getAllPayments(options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    employeeId?: number
    startDate?: string
    endDate?: string
  } = {}) {
    const { page = 1, limit = 10, search, status, employeeId, startDate, endDate } = options
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { notes: { contains: search } },
        { employee: {
          user: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } }
            ]
          }
        }}
      ]
    }

    if (status) {
      where.status = status
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }

    const [payments, total] = await Promise.all([
      paymentRepository.findAll({
        skip,
        take: limit,
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      paymentRepository.count(where)
    ])

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getPaymentStats(options: { startDate?: string; endDate?: string } = {}) {
    const { startDate, endDate } = options

    const where: any = {}
    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }

    const [
      totalPayments,
      totalAmount,
      paymentsByStatus,
      paymentsByMethod,
      monthlyStats
    ] = await Promise.all([
      paymentRepository.count(where),
      paymentRepository.findAll({ where }).then(payments =>
        payments.reduce((sum, p) => sum + Number(p.amount), 0)
      ),
      this.getPaymentsByStatus(where),
      this.getPaymentsByMethod(where),
      this.getMonthlyPaymentStats(where)
    ])

    return {
      totalPayments,
      totalAmount,
      paymentsByStatus,
      paymentsByMethod,
      monthlyStats
    }
  }

  private async getPaymentsByStatus(where: any) {
    const statuses = ['PENDING', 'PROCESSED', 'CANCELLED', 'FAILED']
    const results = await Promise.all(
      statuses.map(async (status) => {
        const count = await paymentRepository.count({ ...where, status })
        const amount = await paymentRepository.findAll({ where: { ...where, status } })
          .then(payments => payments.reduce((sum, p) => sum + Number(p.amount), 0))
        return { status, count, amount }
      })
    )
    return results
  }

  private async getPaymentsByMethod(where: any) {
    const methods = ['CASH', 'BANK_TRANSFER', 'CHECK', 'MOBILE_MONEY']
    const results = await Promise.all(
      methods.map(async (method) => {
        const count = await paymentRepository.count({ ...where, paymentMethod: method })
        const amount = await paymentRepository.findAll({ where: { ...where, paymentMethod: method } })
          .then(payments => payments.reduce((sum, p) => sum + Number(p.amount), 0))
        return { method, count, amount }
      })
    )
    return results
  }

  private async getMonthlyPaymentStats(where: any) {
    // This would require raw SQL or aggregation, simplified for now
    const payments = await paymentRepository.findAll({ where })
    const monthlyData: { [key: string]: { count: number; amount: number } } = {}

    payments.forEach(payment => {
      const month = payment.paymentDate.toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0 }
      }
      monthlyData[month].count++
      monthlyData[month].amount += Number(payment.amount)
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount
    })).sort((a, b) => a.month.localeCompare(b.month))
  }
}

export const paymentService = new PaymentService()