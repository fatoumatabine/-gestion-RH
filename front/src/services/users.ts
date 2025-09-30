const API_BASE_URL = 'http://localhost:5000';

export interface Employee {
  id: number;
  userId: number;
  entrepriseId: number;
  employeeId: string;
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: string;
  phone?: string;
  address?: string;
  status: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  employee?: Employee;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

class UsersService {
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

  async getAllUsers(): Promise<User[]> {
    return this.request('/api/users');
  }

  async getUserById(id: number): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const usersService = new UsersService();
export default usersService;