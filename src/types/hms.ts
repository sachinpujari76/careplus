export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_technician'
  | 'patient'
  | 'accountant';

export interface UserProfile {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface Patient {
  id: number;
  patientCode: string;
  fullName: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory?: string;
  allergies?: string;
  previousConditions?: string;
  registrationDate: string;
  status: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: string;
  department: string;
  consultationFee: string;
  availabilityStatus: 'Available' | 'In Consultation' | 'On Leave' | 'Emergency';
  profilePhoto?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headDoctor?: string;
  location?: string;
}

export interface Appointment {
  id: number;
  appointmentCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  appointmentType: string;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No-show';
  notes?: string;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  recordDate: string;
  diagnosis: string;
  symptoms: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: string;
  respiratoryRate?: number;
  weightKg?: string;
}

export interface PrescriptionItem {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  dispensed?: string;
}

export interface Prescription {
  id: number;
  prescriptionCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  prescriptionDate: string;
  diagnosis: string;
  notes?: string;
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed';
  items?: PrescriptionItem[];
}

export interface Medicine {
  id: number;
  medicineCode: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: string;
  sellingPrice: string;
  stockQuantity: number;
  minStockLevel: number;
  locationRack?: string;
}

export interface LaboratoryTest {
  id: number;
  testCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  testName: string;
  testCategory: string;
  requestedDate: string;
  sampleStatus: 'Requested' | 'Sample Collected' | 'Processing' | 'Completed' | 'Cancelled';
  result?: string;
  referenceRange?: string;
  labTechnician?: string;
  reportStatus: string;
  notes?: string;
  completedDate?: string;
  cost: string;
}

export interface Bed {
  id: number;
  bedNumber: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';
  patientId?: number;
  patientName?: string;
  admissionDate?: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  floor: string;
  dailyRate: string;
  totalBeds: number;
  beds?: Bed[];
  availableBeds?: number;
  occupiedBeds?: number;
}

export interface Admission {
  id: number;
  admissionCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  roomId: number;
  bedId: number;
  bedNumber: string;
  admissionDate: string;
  reason: string;
  diagnosis: string;
  notes?: string;
  status: 'Admitted' | 'Discharged';
}

export interface BillItem {
  id?: number;
  itemDescription: string;
  category: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
}

export interface Bill {
  id: number;
  billCode: string;
  patientId: number;
  patientName: string;
  consultationCharges: string;
  roomCharges: string;
  doctorCharges: string;
  labCharges: string;
  pharmacyCharges: string;
  procedureCharges: string;
  otherCharges: string;
  subtotal: string;
  discount: string;
  taxAmount: string;
  grandTotal: string;
  paidAmount: string;
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Cancelled' | 'Refunded';
  billDate: string;
  dueDate: string;
  notes?: string;
  items?: BillItem[];
}

export interface Payment {
  id: number;
  paymentCode: string;
  billId: number;
  patientId: number;
  patientName: string;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference: string;
  paymentDate: string;
  receiptUrl?: string;
}

export interface EmergencyCase {
  id: number;
  emergencyCode: string;
  patientName: string;
  age: number;
  gender: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedDoctor: string;
  roomBed: string;
  arrivalTime: string;
  status: 'Triaged' | 'In Treatment' | 'Stabilized' | 'Admitted' | 'Discharged';
  conditionNotes: string;
}

export interface StaffMember {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  shift: string;
  status: string;
  photoUrl?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: 'yes' | 'no';
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  recordId?: string;
  details: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  emergencyCount: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  occupancyRate: number;
  lowStockCount: number;
  pendingLabCount: number;
  todayRevenue: number;
  totalRevenue: number;
  pendingBillsTotal: number;
}
