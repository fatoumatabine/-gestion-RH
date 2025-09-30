const API_BASE_URL = 'http://localhost:5000';

interface Payment {
  id: number;
  employeeId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  status: string;
  notes?: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
    position: string;
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  processedPayments: number;
}

interface PaymentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}


interface CreatePaymentData {
  employeeId: number;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

class PaymentsService {
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

  async getAllPayments(): Promise<Payment[]> {
    return this.request('/api/payments');
  }

  async getPaymentsByCompany(companyId: number): Promise<{ payments: Payment[], pagination: PaymentPagination }> {
    return this.request(`/api/payments/company/${companyId}`);
  }

  async getPaymentById(id: number): Promise<Payment> {
    return this.request(`/api/payments/${id}`);
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: number, data: Partial<CreatePaymentData>): Promise<Payment> {
    return this.request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: number): Promise<void> {
    return this.request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getPaymentStats(): Promise<PaymentStats> {
    return this.request('/api/payments/stats/overview');
  }

  async downloadBulletin(paymentId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/bulletin`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du bulletin');
    }

    return response.blob();
  }
}

export const paymentsService = new PaymentsService();
export type { Payment, PaymentStats, CreatePaymentData };
export default paymentsService;