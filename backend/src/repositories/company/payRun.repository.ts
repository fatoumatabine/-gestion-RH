import prisma from '../../database/prisma.client.js'

export class CompanyPayRunRepository {
  async findAll(options: { skip?: number; take?: number; where?: any; include?: any } = {}) {
    const { skip, take, where, include } = options
    return prisma.companyPayRun.findMany({
      skip,
      take,
      where,
      include,
      orderBy: { creeLe: 'desc' }
    })
  }

  async findById(id: number, include?: any) {
    return prisma.companyPayRun.findUnique({
      where: { id },
      include
    })
  }

  async findByReference(reference: string) {
    return prisma.companyPayRun.findUnique({
      where: { reference }
    })
  }

  async create(data: any) {
    return prisma.companyPayRun.create({
      data
    })
  }

  async update(id: number, data: any) {
    return prisma.companyPayRun.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return prisma.companyPayRun.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return prisma.companyPayRun.count({ where })
  }
}

export const companyPayRunRepository = new CompanyPayRunRepository()