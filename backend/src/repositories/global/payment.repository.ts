import { globalPrisma } from '../../database/global.prisma.client.js'

export class PaymentRepository {
  async findAll(options: { skip?: number; take?: number; where?: any; include?: any } = {}) {
    const { skip, take, where, include } = options
    return globalPrisma.payment.findMany({
      skip,
      take,
      where,
      include,
      orderBy: { paymentDate: 'desc' }
    })
  }

  async findById(id: number, include?: any) {
    return globalPrisma.payment.findUnique({
      where: { id },
      include
    })
  }

  async findByReference(reference: string) {
    return globalPrisma.payment.findUnique({
      where: { reference }
    })
  }

  async create(data: any) {
    return globalPrisma.payment.create({
      data
    })
  }

  async update(id: number, data: any) {
    return globalPrisma.payment.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return globalPrisma.payment.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return globalPrisma.payment.count({ where })
  }
}

export const paymentRepository = new PaymentRepository()