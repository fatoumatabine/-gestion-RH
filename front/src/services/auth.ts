const API_BASE_URL = 'http://localhost:5000';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          if (endpoint === '/auth/login') {
            throw new Error(errorData.message || 'Email ou mot de passe incorrect');
          } else {
            // Session expirée ou token invalide
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('API request failed:', error.message);
        throw error;
      }
      console.error('API request failed:', error);
      throw new Error('Une erreur est survenue lors de la communication avec le serveur');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;