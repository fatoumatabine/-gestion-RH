import { companyPrisma } from '../../database/company.prisma.client.js'

export class CompanyFactureRepository {
  async findAll(options: { skip?: number; take?: number; where?: any; include?: any } = {}) {
    const { skip, take, where, include } = options
    return companyPrisma.companyFacture.findMany({
      skip,
      take,
      where,
      include,
      orderBy: { creeLe: 'desc' }
    })
  }

  async findById(id: number, include?: any) {
    return companyPrisma.companyFacture.findUnique({
      where: { id },
      include
    })
  }

  async findByNumeroFacture(numeroFacture: string) {
    return companyPrisma.companyFacture.findUnique({
      where: { numeroFacture }
    })
  }

  async create(data: any) {
    return companyPrisma.companyFacture.create({
      data
    })
  }

  async update(id: number, data: any) {
    return companyPrisma.companyFacture.update({
      where: { id },
      data: {
        ...data,
        modifieLe: new Date()
      }
    })
  }

  async delete(id: number) {
    return companyPrisma.companyFacture.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return companyPrisma.companyFacture.count({ where })
  }
}

export class CompanyLigneFactureRepository {
  async findAll(options: { skip?: number; take?: number; where?: any } = {}) {
    const { skip, take, where } = options
    return companyPrisma.companyLigneFacture.findMany({
      skip,
      take,
      where,
      orderBy: { creeLe: 'desc' }
    })
  }

  async findById(id: number) {
    return companyPrisma.companyLigneFacture.findUnique({
      where: { id }
    })
  }

  async create(data: any) {
    return companyPrisma.companyLigneFacture.create({
      data
    })
  }

  async update(id: number, data: any) {
    return companyPrisma.companyLigneFacture.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return companyPrisma.companyLigneFacture.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return companyPrisma.companyLigneFacture.count({ where })
  }
}

export const companyFactureRepository = new CompanyFactureRepository()
export const companyLigneFactureRepository = new CompanyLigneFactureRepository()