const API_BASE_URL = 'http://localhost:5000';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

class NotificationsService {
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

  async getAllNotifications(): Promise<Notification[]> {
    return this.request('/api/notifications');
  }

  async markAsRead(id: number): Promise<void> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead(): Promise<void> {
    return this.request('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const result = await this.request<{ count: number }>('/api/notifications/unread-count');
      const count = Number(result.count);
      return { count: isNaN(count) ? 0 : count };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { count: 0 };
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;