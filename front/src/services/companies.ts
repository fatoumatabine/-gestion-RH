const API_BASE_URL = 'http://localhost:5000';

export interface Company {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  devise: string;
  timezone: string;
  periodePayroll: string;
  estActive: boolean;
  parametres?: Record<string, unknown>;
  creeLe: string;
  modifieLe: string;
  nombreEmployes: number;
  employesActifs: number;
  salaireMoyen?: number;
}

export interface CreateCompanyData {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  devise?: string;
  timezone?: string;
  periodePayroll?: string;
  parametres?: Record<string, unknown>;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  estActive?: boolean;
}

class CompaniesService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired, logout user
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        if (response.status === 404) {
          throw new Error(`La ressource demandée n'existe pas. Veuillez vérifier l'identifiant.`);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur! statut: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Rethrow custom error messages
        throw error;
      }
      console.error('API request failed:', error);
      throw new Error('Une erreur est survenue lors de la communication avec le serveur');
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.request('/api/companies');
  }

  async getCompanyById(id: number): Promise<Company> {
    return this.request(`/api/companies/${id}`);
  }

  async createCompany(data: CreateCompanyData): Promise<{ message: string; company: Company }> {
    return this.request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: number, data: UpdateCompanyData): Promise<{ message: string; company: Company }> {
    return this.request(`/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: number): Promise<{ message: string }> {
    return this.request(`/api/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCompanyStatus(id: number): Promise<{ message: string; company: Company }> {
    return this.request(`/api/companies/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }
}

export const companiesService = new CompaniesService();
export default companiesService;