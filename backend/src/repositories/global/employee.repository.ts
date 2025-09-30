import { globalPrisma } from '../../database/global.prisma.client.js'

export class EmployeeRepository {
  async findAll(options: { skip?: number; take?: number; where?: any; include?: any } = {}) {
    const { skip, take, where, include } = options
    return globalPrisma.employee.findMany({
      skip,
      take,
      where,
      include,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: number, include?: any) {
    return globalPrisma.employee.findUnique({
      where: { id },
      include
    })
  }

  async findByUserId(userId: number) {
    return globalPrisma.employee.findUnique({
      where: { userId }
    })
  }

  async findByEmployeeId(employeeId: string) {
    return globalPrisma.employee.findUnique({
      where: { employeeId }
    })
  }

  async create(data: any) {
    return globalPrisma.employee.create({
      data
    })
  }

  async update(id: number, data: any) {
    return globalPrisma.employee.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return globalPrisma.employee.delete({
      where: { id }
    })
  }

  async count(where?: any) {
    return globalPrisma.employee.count({ where })
  }
}

export const employeeRepository = new EmployeeRepository()