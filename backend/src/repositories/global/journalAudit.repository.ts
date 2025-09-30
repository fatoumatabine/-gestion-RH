import { globalPrisma } from '../../database/global.prisma.client.js'

export class JournalAuditRepository {
  async findAll(options: { skip?: number; take?: number; where?: any } = {}) {
    const { skip, take, where } = options
    return globalPrisma.journalAudit.findMany({
      skip,
      take,
      where,
      orderBy: { creeLe: 'desc' }
    })
  }

  async findById(id: number) {
    return globalPrisma.journalAudit.findUnique({
      where: { id }
    })
  }

  async create(data: any) {
    return globalPrisma.journalAudit.create({
      data
    })
  }

  async count(where?: any) {
    return globalPrisma.journalAudit.count({ where })
  }
}

export const journalAuditRepository = new JournalAuditRepository()