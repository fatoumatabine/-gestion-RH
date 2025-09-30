import { prisma } from '../database/prisma.client.js';

class CompanyService {
  /**
   * Créer une nouvelle entreprise
   */
  async createCompany(companyData, userId) {
    try {
      // Vérifier si une entreprise avec le même nom existe déjà
      const existingCompany = await prisma.entreprise.findFirst({
        where: {
          nom: {
            equals: companyData.nom,
            mode: 'insensitive'
          }
        }
      });

      if (existingCompany) {
        throw new Error('Une entreprise avec ce nom existe déjà');
      }

      // Créer l'entreprise
      const company = await prisma.entreprise.create({
        data: {
          nom: companyData.nom,
          adresse: companyData.adresse,
          telephone: companyData.telephone,
          email: companyData.email,
          siteWeb: companyData.siteWeb,
          logo: companyData.logo,
          description: companyData.description,
          devise: companyData.devise,
          timezone: companyData.timezone,
          periodePayroll: companyData.periodePayroll,
          estActive: companyData.estActive,
          parametres: companyData.parametres || {}
        }
      });

      return company;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      throw error;
    }
  }

  /**
   * Récupérer une entreprise par ID
   */
  async getCompanyById(id) {
    try {
      const company = await prisma.entreprise.findUnique({
        where: { id: parseInt(id) },
        include: {
          employees: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              position: true,
              status: true
            }
          },
          _count: {
            select: {
              employees: true
            }
          }
        }
      });

      if (!company) {
        throw new Error('Entreprise non trouvée');
      }

      return company;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les entreprises avec pagination et filtres
   */
  async getAllCompanies(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        estActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      // Construire les conditions de recherche
      const where = {
        AND: []
      };

      if (search) {
        where.AND.push({
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { telephone: { contains: search } }
          ]
        });
      }

      if (estActive !== undefined) {
        where.AND.push({ estActive });
      }

      // Compter le nombre total
      const total = await prisma.entreprise.count({ where });

      // Récupérer les entreprises
      const companies = await prisma.entreprise.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          _count: {
            select: {
              employees: true
            }
          }
        }
      });

      return {
        companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une entreprise
   */
  async updateCompany(id, updateData, userId) {
    try {
      const companyId = parseInt(id);

      // Vérifier si l'entreprise existe
      const existingCompany = await prisma.entreprise.findUnique({
        where: { id: companyId }
      });

      if (!existingCompany) {
        throw new Error('Entreprise non trouvée');
      }

      // Si le nom est modifié, vérifier qu'il n'existe pas déjà
      if (updateData.nom && updateData.nom !== existingCompany.nom) {
        const companyWithSameName = await prisma.entreprise.findFirst({
          where: {
            nom: {
              equals: updateData.nom,
              mode: 'insensitive'
            },
            id: { not: companyId }
          }
        });

        if (companyWithSameName) {
          throw new Error('Une entreprise avec ce nom existe déjà');
        }
      }

      // Mettre à jour l'entreprise
      const updatedCompany = await prisma.entreprise.update({
        where: { id: companyId },
        data: {
          ...updateData,
          modifieLe: new Date()
        },
        include: {
          _count: {
            select: {
              employees: true
            }
          }
        }
      });

      return updatedCompany;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
      throw error;
    }
  }

  /**
   * Supprimer une entreprise
   */
  async deleteCompany(id, userId) {
    try {
      const companyId = parseInt(id);

      // Vérifier si l'entreprise existe
      const company = await prisma.entreprise.findUnique({
        where: { id: companyId },
        include: {
          _count: {
            select: {
              employees: true
            }
          }
        }
      });

      if (!company) {
        throw new Error('Entreprise non trouvée');
      }

      // Vérifier s'il y a des employés actifs
      if (company._count.employees > 0) {
        throw new Error('Impossible de supprimer une entreprise qui contient des employés');
      }

      // Supprimer l'entreprise
      await prisma.entreprise.delete({
        where: { id: companyId }
      });

      return { message: 'Entreprise supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entreprise:', error);
      throw error;
    }
  }

  /**
   * Activer/Désactiver une entreprise
   */
  async toggleCompanyStatus(id, userId) {
    try {
      const companyId = parseInt(id);

      const company = await prisma.entreprise.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error('Entreprise non trouvée');
      }

      const updatedCompany = await prisma.entreprise.update({
        where: { id: companyId },
        data: {
          estActive: !company.estActive,
          modifieLe: new Date()
        }
      });

      return updatedCompany;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des entreprises
   */
  async getCompanyStats() {
    try {
      const [
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        companiesWithEmployees
      ] = await Promise.all([
        prisma.entreprise.count(),
        prisma.entreprise.count({ where: { estActive: true } }),
        prisma.entreprise.count({ where: { estActive: false } }),
        prisma.entreprise.count({
          where: {
            employees: {
              some: {}
            }
          }
        })
      ]);

      return {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies,
        withEmployees: companiesWithEmployees
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export const companyService = new CompanyService();
export default companyService;