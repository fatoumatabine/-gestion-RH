const API_BASE_URL = 'http://localhost:5000';

export interface CompanyFacture {
  id: number;
  employeeId: number;
  numeroFacture: string;
  montant: number;
  description?: string;
  statut: string;
  dateEcheance?: string;
  datePaiement?: string;
  creePar: number;
  creeLe: string;
  modifieLe: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  lignesFacture: CompanyLigneFacture[];
}

export interface CompanyLigneFacture {
  id: number;
  factureId: number;
  description: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  creeLe: string;
}

export interface CompanyBulletin {
  id: number;
  numeroBulletin: string;
  datePaiement: string;
  joursTravailles: number;
  heuresTravailes: number;
  salaireBrut: number;
  salaireBase: number;
  montantHeuresSupp: number;
  montantBonus: number;
  indemnites: number;
  deductions: any;
  totalDeductions: number;
  salaireNet: number;
  montantPaye: number;
  resteAPayer: number;
  statutPaiement: string;
  cheminPDF?: string;
  calculs?: any;
  estVerrouille: boolean;
  payRunId: number;
  employeId: number;
  creeLe: string;
  modifieLe: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CompanyDocument {
  id: number;
  type: string;
  titre: string;
  description?: string;
  cheminFichier: string;
  tailleFichier: number;
  mimeType: string;
  metadata?: any;
  tags: string;
  employeId: number;
  uploadePar: number;
  creeLe: string;
  modifieLe: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CompanyHistoriqueSalaire {
  id: number;
  employeId: number;
  ancienSalaire: number;
  nouveauSalaire: number;
  dateEffet: string;
  motif: string;
  notes?: string;
  documents?: any;
  modifiePar: number;
  creeLe: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  modifier: {
    firstName: string;
    lastName: string;
  };
}

class CompanyService {
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
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Factures
  async getFactures(): Promise<CompanyFacture[]> {
    return this.request('/api/company/factures');
  }

  async getFactureById(id: number): Promise<CompanyFacture> {
    return this.request(`/api/company/factures/${id}`);
  }

  // Bulletins
  async getBulletins(): Promise<CompanyBulletin[]> {
    return this.request('/api/company/bulletins');
  }

  async getBulletinById(id: number): Promise<CompanyBulletin> {
    return this.request(`/api/company/bulletins/${id}`);
  }

  async downloadBulletinPDF(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/company/bulletins/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du PDF');
    }

    return response.blob();
  }

  // Documents
  async getDocuments(): Promise<CompanyDocument[]> {
    return this.request('/api/company/documents');
  }

  async getDocumentById(id: number): Promise<CompanyDocument> {
    return this.request(`/api/company/documents/${id}`);
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/company/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du document');
    }

    return response.blob();
  }

  // Historique des salaires
  async getHistoriqueSalaires(): Promise<CompanyHistoriqueSalaire[]> {
    return this.request('/api/company/historique-salaires');
  }

  async getHistoriqueSalaireById(id: number): Promise<CompanyHistoriqueSalaire> {
    return this.request(`/api/company/historique-salaires/${id}`);
  }
}

export const companyService = new CompanyService();
export default companyService;