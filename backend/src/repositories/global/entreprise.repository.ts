import { globalPrisma } from '../../database/global.prisma.client.js'

export class EntrepriseRepository {
  async findAll(options: { skip?: number; take?: number; where?: any; include?: any } = {}) {
    const { skip, take, where, include } = options
    return globalPrisma.entreprise.findMany({
      skip,
      take,
      where,
      include,
      orderBy: { creeLe: 'desc' }
    })
  }

  async findById(id: number, include?: any) {
    return globalPrisma.entreprise.findUnique({
      where: { id },
      include
    })
  }

  async findByName(name: string) {
    return globalPrisma.entreprise.findFirst({
      where: {
        nom: name
      }
    })
  }

  async create(data: any) {
    return globalPrisma.entreprise.create({
      data
    })
  }

  async update(id: number, data: any) {
    return globalPrisma.entreprise.update({
      where: { id },
      data: {
        ...data,
        modifieLe: new Date()
      }
    })
  }

  async delete(id: number) {
    return globalPrisma.entreprise.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return globalPrisma.entreprise.count({ where })
  }
}

export const entrepriseRepository = new EntrepriseRepository()