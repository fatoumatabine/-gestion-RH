import { globalPrisma } from '../../database/global.prisma.client.js'

export class UserRepository {
  async findAll(options: { skip?: number; take?: number; where?: any } = {}) {
    const { skip, take, where } = options
    return globalPrisma.user.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: number) {
    return globalPrisma.user.findUnique({
      where: { id }
    })
  }

  async findByEmail(email: string) {
    return globalPrisma.user.findUnique({
      where: { email }
    })
  }

  async create(data: any) {
    return globalPrisma.user.create({
      data
    })
  }

  async update(id: number, data: any) {
    return globalPrisma.user.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return globalPrisma.user.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return globalPrisma.user.count({ where })
  }
}

export const userRepository = new UserRepository()