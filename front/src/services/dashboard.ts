const API_BASE_URL = 'http://localhost:5000';

export interface DashboardStats {
  label: string;
  value: string;
  change: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export interface EmployeeDistribution {
  name: string;
  employés: number;
  couleur: string;
}

export interface SalaryEvolution {
  trimestre: string;
  salaire: number;
}

export interface SystemStatus {
  server: { status: string; uptime: string; lastCheck: Date };
  database: { status: string; connections: number; lastCheck: Date };
  api: { status: string; responseTime: string; lastCheck: Date };
  users: { active: number; online: number; lastCheck: Date };
  companies?: { active: number; pendingPayrolls: number; recentPayments: number };
}

class DashboardService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('auth_token');
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getStats(): Promise<DashboardStats[]> {
    const response = await this.request<{ stats: DashboardStats[] }>('/api/dashboard/stats');
    return response.stats;
  }

  async getEmployeeDistribution(): Promise<EmployeeDistribution[]> {
    return this.request<EmployeeDistribution[]>('/api/dashboard/employee-distribution');
  }

  async getSalaryEvolution(): Promise<SalaryEvolution[]> {
    return this.request<SalaryEvolution[]>('/api/dashboard/salary-evolution');
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/dashboard/system-status');
  }
}

export const dashboardService = new DashboardService();