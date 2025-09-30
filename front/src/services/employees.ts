const API_BASE_URL = 'http://localhost:5000';

export interface Employee {
  id: number;
  userId: number;
  entrepriseId: number;
  employeeId: string;
  department?: string;
  position?: string;
  contractType: string;
  salary?: number;
  dailyRate?: number;
  hourlyRate?: number;
  hireDate?: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CreateEmployeeData {
  userId: number;
  entrepriseId: number;
  employeeId: string;
  department?: string;
  position?: string;
  salary?: string;
  hireDate?: string;
  phone?: string;
  address?: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  status?: string;
}

class EmployeesService {
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

  async getAllEmployees(): Promise<Employee[]> {
    return this.request('/api/employees');
  }

  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return this.request(`/api/employees/company/${companyId}`);
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return this.request(`/api/employees/${id}`);
  }

  async createEmployee(data: CreateEmployeeData): Promise<{ message: string; employee: Employee }> {
    return this.request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<{ message: string; employee: Employee }> {
    return this.request(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: number): Promise<void> {
    return this.request(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  }
}

export const employeesService = new EmployeesService();
export default employeesService;