const API_BASE_URL = 'http://localhost:5000';

export interface AttendanceRecord {
  id: number;
  employeId: number;
  date: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  statut: 'PRESENT' | 'RETARD' | 'DEPART_ANTICIPE' | 'ABSENT' | 'CONGE' | 'MALADIE' | 'AUTRE';
  typePointage: 'NORMAL' | 'RETARD_JUSTIFIE' | 'DEPART_ANTICIPE_JUSTIFIE' | 'HEURES_SUPPLEMENTAIRES' | 'TRAVAIL_NUIT' | 'FERIE';
  commentaire: string | null;
  latitude: number | null;
  longitude: number | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  validePar: number | null;
  dateValidation: string | null;
  creeLe: string;
  modifieLe: string;
  employe?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    employeeId: string;
    department: string;
  };
  validateur?: {
    firstName: string;
    lastName: string;
  };
}

export interface AttendanceRules {
  id: number;
  entrepriseId: number;
  heureDebut: string;
  heureFin: string;
  toleranceRetard: number;
  toleranceDepart: number;
  joursTravail: string[];
  heuresParJour: number;
  heuresSupAutorise: boolean;
  seuilHeuresSup: number;
  pauseDejeuner: number;
  estFlexible: boolean;
  plageHoraireMin?: string;
  plageHoraireMax?: string;
  joursFeries?: string[];
  modifieLe: string;
}

export interface Absence {
  id: number;
  employeId: number;
  typeAbsence: 'CONGE_ANNUEL' | 'CONGE_MALADIE' | 'CONGE_MATERNITE' | 'CONGE_PATERNITE' | 'CONGE_EXCEPTIONNEL' | 'ABSENCE_NON_JUSTIFIEE' | 'ACCIDENT_TRAVAIL' | 'FORMATION' | 'AUTRE';
  dateDebut: string;
  dateFin: string;
  motif: string | null;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'ANNULEE';
  joursOuvres: number;
  heuresAbsence: number;
  commentaire: string | null;
  pieceJointe: string | null;
  approuvePar: number | null;
  dateApprobation: string | null;
  creeLe: string;
  modifieLe: string;
  employe?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  approbateur?: {
    firstName: string;
    lastName: string;
  };
}

export interface CheckInData {
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface CheckOutData {
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface AttendanceHistory {
  attendances: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminDashboardData {
  attendances: AttendanceRecord[];
  stats: {
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
  };
  date: string;
}

export interface AttendanceReport {
  summary: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    earlyDepartureDays: number;
  };
  attendances: AttendanceRecord[];
}

class AttendanceService {
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
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/auth/sign-in';
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

  // Employee methods
  async checkIn(data: CheckInData = {}): Promise<{ success: boolean; message: string; data: { attendance: AttendanceRecord; checkInTime: string } }> {
    return this.request('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkOut(data: CheckOutData = {}): Promise<{ success: boolean; message: string; data: { attendance: AttendanceRecord; checkOutTime: string; status: string } }> {
    return this.request('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceHistory(startDate?: string, endDate?: string, page = 1, limit = 30): Promise<{ success: boolean; data: AttendanceHistory }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.request(`/api/attendance/history?${params}`);
  }

  async getTodayAttendance(): Promise<{ success: boolean; data: { attendance: AttendanceRecord | null } }> {
    return this.request('/api/attendance/today');
  }

  // Absence methods
  async getAbsences(): Promise<{ success: boolean; data: { absences: Absence[] } }> {
    return this.request('/api/attendance/absences');
  }

  async createAbsence(data: {
    typeAbsence: string;
    dateDebut: string;
    dateFin: string;
    motif?: string;
    pieceJointe?: string;
  }): Promise<{ success: boolean; message: string; data: { absence: Absence } }> {
    return this.request('/api/attendance/absences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAbsenceStatus(id: number, statut: string, commentaireApprobation?: string): Promise<{ success: boolean; message: string; data: { absence: Absence } }> {
    return this.request(`/api/attendance/absences/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ statut, commentaireApprobation }),
    });
  }

  // Admin methods
  async getAdminDashboard(date?: string, department?: string): Promise<{ success: boolean; data: AdminDashboardData }> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (department) params.append('department', department);

    return this.request(`/api/attendance/admin/dashboard?${params}`);
  }

  async getEmployeeAttendance(employeeId: number, startDate?: string, endDate?: string): Promise<{ success: boolean; data: { attendances: AttendanceRecord[] } }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request(`/api/attendance/admin/employee/${employeeId}?${params}`);
  }

  async validateAttendance(id: number, statut: string, commentaire?: string): Promise<{ success: boolean; message: string; data: { attendance: AttendanceRecord } }> {
    return this.request(`/api/attendance/admin/validate/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ statut, commentaire }),
    });
  }

  // Rules management
  async getAttendanceRules(): Promise<{ success: boolean; data: { rules: AttendanceRules | null } }> {
    return this.request('/api/attendance/rules');
  }

  async updateAttendanceRules(rules: Partial<AttendanceRules>): Promise<{ success: boolean; message: string; data: { rules: AttendanceRules } }> {
    return this.request('/api/attendance/rules', {
      method: 'PUT',
      body: JSON.stringify(rules),
    });
  }

  // Reports
  async getAttendanceReport(startDate: string, endDate: string, department?: string): Promise<{ success: boolean; data: AttendanceReport }> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (department) params.append('department', department);

    return this.request(`/api/attendance/reports/summary?${params}`);
  }

  async getDetailedReport(startDate: string, endDate: string, employeeId?: number, department?: string): Promise<{ success: boolean; data: { attendances: AttendanceRecord[] } }> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (employeeId) params.append('employeeId', employeeId.toString());
    if (department) params.append('department', department);

    return this.request(`/api/attendance/reports/detailed?${params}`);
  }

  // Utility methods
  getStatusLabel(status: string): string {
    const labels = {
      PRESENT: 'Présent',
      RETARD: 'Retard',
      DEPART_ANTICIPE: 'Départ anticipé',
      ABSENT: 'Absent',
      CONGE: 'Congé',
      MALADIE: 'Maladie',
      AUTRE: 'Autre'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusColor(status: string): string {
    const colors = {
      PRESENT: 'green',
      RETARD: 'yellow',
      DEPART_ANTICIPE: 'orange',
      ABSENT: 'red',
      CONGE: 'blue',
      MALADIE: 'purple',
      AUTRE: 'gray'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  getAbsenceTypeLabel(type: string): string {
    const labels = {
      CONGE_ANNUEL: 'Congé annuel',
      CONGE_MALADIE: 'Congé maladie',
      CONGE_MATERNITE: 'Congé maternité',
      CONGE_PATERNITE: 'Congé paternité',
      CONGE_EXCEPTIONNEL: 'Congé exceptionnel',
      ABSENCE_NON_JUSTIFIEE: 'Absence non justifiée',
      ACCIDENT_TRAVAIL: 'Accident de travail',
      FORMATION: 'Formation',
      AUTRE: 'Autre'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getAbsenceStatusLabel(status: string): string {
    const labels = {
      EN_ATTENTE: 'En attente',
      APPROUVEE: 'Approuvée',
      REJETEE: 'Rejetée',
      ANNULEE: 'Annulée'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getAbsenceStatusColor(status: string): string {
    const colors = {
      EN_ATTENTE: 'yellow',
      APPROUVEE: 'green',
      REJETEE: 'red',
      ANNULEE: 'gray'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  // QR Code methods
  async getEmployeeQRCode(): Promise<{ success: boolean; data: { qrCode: string; employee: { id: number; employeeId: string; firstName: string; lastName: string } } }> {
    return this.request('/api/attendance/qr/my-code');
  }

  async scanQRCode(qrCode: string, type: 'check-in' | 'check-out', locationData?: { latitude?: number; longitude?: number; ipAddress?: string; deviceInfo?: string }): Promise<{ success: boolean; message: string; data: { employee: { id: number; employeeId: string; firstName: string; lastName: string; department: string }; attendance: AttendanceRecord; timestamp: string; status: string } }> {
    return this.request('/api/attendance/qr/scan', {
      method: 'POST',
      body: JSON.stringify({
        qrCode,
        type,
        ...locationData
      }),
    });
  }

  async regenerateEmployeeQRCode(employeeId: number): Promise<{ success: boolean; message: string; data: { employee: { id: number; employeeId: string; firstName: string; lastName: string }; qrCode: string } }> {
    return this.request(`/api/attendance/qr/regenerate/${employeeId}`, {
      method: 'POST',
    });
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;