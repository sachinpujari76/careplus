import { UserProfile, UserRole } from '../types/hms.ts';

class ApiService {
  private token: string | null = null;
  private currentRole: UserRole = 'admin';
  private currentUser: UserProfile | null = null;

  constructor() {
    const savedToken = localStorage.getItem('hms_auth_token');
    const savedRole = localStorage.getItem('hms_role') as UserRole;
    const savedUser = localStorage.getItem('hms_user');

    if (savedToken) this.token = savedToken;
    if (savedRole) this.currentRole = savedRole;
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = null;
      }
    }
  }

  setAuth(token: string | null, role: UserRole, user: UserProfile | null) {
    this.token = token;
    this.currentRole = role;
    this.currentUser = user;

    if (token) localStorage.setItem('hms_auth_token', token);
    else localStorage.removeItem('hms_auth_token');

    localStorage.setItem('hms_role', role);

    if (user) localStorage.setItem('hms_user', JSON.stringify(user));
    else localStorage.removeItem('hms_user');
  }

  getRole(): UserRole {
    return this.currentRole;
  }

  getUser(): UserProfile | null {
    return this.currentUser;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-demo-role': this.currentRole,
    };
    if (this.currentUser) {
      headers['x-demo-user'] = encodeURIComponent(JSON.stringify(this.currentUser));
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Network request failed' }));
      throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  // Auth methods
  async switchDemoRole(role: UserRole) {
    const res = await this.request<{ token: string; user: UserProfile }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setAuth(res.token, role, res.user);
    return res;
  }

  async getMe() {
    return this.request<{ user: UserProfile }>('/api/auth/me');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>('/api/dashboard/stats');
  }

  // Patients
  async getPatients(search = '', bloodGroup = '') {
    return this.request<any[]>(`/api/patients?search=${encodeURIComponent(search)}&bloodGroup=${encodeURIComponent(bloodGroup)}`);
  }

  async getPatient(id: number) {
    return this.request<any>(`/api/patients/${id}`);
  }

  async createPatient(data: any) {
    return this.request<any>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: number, data: any) {
    return this.request<any>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Doctors & Departments
  async getDoctors(dept = '') {
    return this.request<any[]>(`/api/doctors?department=${encodeURIComponent(dept)}`);
  }

  async createDoctor(data: any) {
    return this.request<any>('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDepartments() {
    return this.request<any[]>('/api/departments');
  }

  // Appointments
  async getAppointments(filters: { doctorId?: number; patientId?: number; date?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.doctorId) params.set('doctorId', String(filters.doctorId));
    if (filters.patientId) params.set('patientId', String(filters.patientId));
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);
    return this.request<any[]>(`/api/appointments?${params.toString()}`);
  }

  async bookAppointment(data: any) {
    return this.request<any>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id: number, status: string, notes?: string) {
    return this.request<any>(`/api/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Medical records
  async getMedicalRecords(patientId?: number) {
    return this.request<any[]>(`/api/medical-records${patientId ? `?patientId=${patientId}` : ''}`);
  }

  async createMedicalRecord(data: any) {
    return this.request<any>('/api/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Prescriptions
  async getPrescriptions(filters: { patientId?: number; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.patientId) params.set('patientId', String(filters.patientId));
    if (filters.status) params.set('status', filters.status);
    return this.request<any[]>(`/api/prescriptions?${params.toString()}`);
  }

  async createPrescription(data: any) {
    return this.request<any>('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dispensePrescription(id: number, pharmacistName?: string) {
    return this.request<any>(`/api/prescriptions/${id}/dispense`, {
      method: 'POST',
      body: JSON.stringify({ pharmacistName }),
    });
  }

  // Pharmacy
  async getMedicines(search = '', category = '') {
    return this.request<any[]>(`/api/medicines?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
  }

  async createMedicine(data: any) {
    return this.request<any>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedicineStock(id: number, delta?: number, quantity?: number) {
    return this.request<any>(`/api/medicines/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ delta, quantity }),
    });
  }

  // Laboratory
  async getLaboratoryTests(filters: { status?: string; patientId?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.patientId) params.set('patientId', String(filters.patientId));
    return this.request<any[]>(`/api/laboratory?${params.toString()}`);
  }

  async orderLabTest(data: any) {
    return this.request<any>('/api/laboratory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabTest(id: number, data: any) {
    return this.request<any>(`/api/laboratory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Rooms & Beds
  async getRooms() {
    return this.request<any[]>('/api/rooms');
  }

  async getBeds() {
    return this.request<any[]>('/api/beds');
  }

  async updateBedStatus(id: number, status: string) {
    return this.request<any>(`/api/beds/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async admitPatient(data: any) {
    return this.request<any>('/api/admissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dischargePatient(data: any) {
    return this.request<any>('/api/discharges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Billing & Payments
  async getBills(filters: { patientId?: number; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.patientId) params.set('patientId', String(filters.patientId));
    if (filters.status) params.set('status', filters.status);
    return this.request<any[]>(`/api/bills?${params.toString()}`);
  }

  async createBill(data: any) {
    return this.request<any>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments() {
    return this.request<any[]>('/api/payments');
  }

  async processPayment(data: any) {
    return this.request<any>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Emergencies
  async getEmergencies() {
    return this.request<any[]>('/api/emergencies');
  }

  async createEmergency(data: any) {
    return this.request<any>('/api/emergencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmergencyStatus(id: number, status: string, notes?: string) {
    return this.request<any>(`/api/emergencies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, conditionNotes: notes }),
    });
  }

  // Staff
  async getStaff() {
    return this.request<any[]>('/api/staff');
  }

  async createStaff(data: any) {
    return this.request<any>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications & Audit Logs
  async getNotifications() {
    return this.request<any[]>('/api/notifications');
  }

  async markNotificationRead(id: number) {
    return this.request<any>(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async getAuditLogs() {
    return this.request<any[]>('/api/audit-logs');
  }

  async getReportsSummary() {
    return this.request<any>('/api/reports/summary');
  }
}

export const api = new ApiService();
