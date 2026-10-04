import { integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (tied to Firebase Auth UID and/or internal roles)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or demo account UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('patient'), // super_admin, admin, doctor, nurse, receptionist, pharmacist, lab_technician, patient, accountant
  phone: text('phone').default(''),
  avatarUrl: text('avatar_url').default(''),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Departments
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description').default(''),
  headDoctor: text('head_doctor').default(''),
  location: text('location').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Doctors
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: text('user_id').default(''),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default(''),
  specialization: text('specialization').notNull(),
  qualification: text('qualification').notNull(),
  experience: text('experience').notNull(),
  department: text('department').notNull(),
  consultationFee: numeric('consultation_fee', { precision: 10, scale: 2 }).notNull().default('500.00'),
  availabilityStatus: text('availability_status').notNull().default('Available'), // Available, In Consultation, On Leave, Emergency
  profilePhoto: text('profile_photo').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Patients
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  patientCode: text('patient_code').notNull().unique(), // e.g. PAT-1001
  userId: text('user_id').default(''),
  fullName: text('full_name').notNull(),
  dob: text('dob').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  bloodGroup: text('blood_group').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  emergencyContactName: text('emergency_contact_name').notNull(),
  emergencyContactPhone: text('emergency_contact_phone').notNull(),
  medicalHistory: text('medical_history').default(''),
  allergies: text('allergies').default(''),
  previousConditions: text('previous_conditions').default(''),
  registrationDate: text('registration_date').notNull(),
  status: text('status').notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Staff
export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  staffCode: text('staff_code').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // Nurse, Receptionist, Pharmacist, Lab Technician, Accountant, Admin
  department: text('department').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  joiningDate: text('joining_date').notNull(),
  shift: text('shift').notNull().default('Morning (8 AM - 4 PM)'),
  status: text('status').notNull().default('Active'),
  photoUrl: text('photo_url').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appointments
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  appointmentCode: text('appointment_code').notNull().unique(), // e.g. APT-2001
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: integer('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  department: text('department').notNull(),
  appointmentDate: text('appointment_date').notNull(), // YYYY-MM-DD
  appointmentTime: text('appointment_time').notNull(), // HH:MM
  reason: text('reason').notNull(),
  appointmentType: text('appointment_type').notNull().default('General Checkup'),
  status: text('status').notNull().default('Pending'), // Pending, Confirmed, Checked-in, In Consultation, Completed, Cancelled, No-show
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Electronic Medical Records (EMR)
export const medicalRecords = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull(),
  doctorId: integer('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  appointmentId: integer('appointment_id'),
  recordDate: text('record_date').notNull(),
  diagnosis: text('diagnosis').notNull(),
  symptoms: text('symptoms').notNull(),
  doctorNotes: text('doctor_notes').default(''),
  treatmentPlan: text('treatment_plan').default(''),
  bpSystolic: integer('bp_systolic').default(120),
  bpDiastolic: integer('bp_diastolic').default(80),
  heartRate: integer('heart_rate').default(72),
  temperature: numeric('temperature', { precision: 4, scale: 1 }).default('98.6'),
  respiratoryRate: integer('respiratory_rate').default(16),
  weightKg: numeric('weight_kg', { precision: 5, scale: 2 }).default('68.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Prescriptions
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  prescriptionCode: text('prescription_code').notNull().unique(), // e.g. RX-3001
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: integer('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  appointmentId: integer('appointment_id'),
  prescriptionDate: text('prescription_date').notNull(),
  diagnosis: text('diagnosis').notNull(),
  notes: text('notes').default(''),
  status: text('status').notNull().default('Pending'), // Pending, Dispensed, Partially Dispensed
  createdAt: timestamp('created_at').defaultNow(),
});

// Prescription Items
export const prescriptionItems = pgTable('prescription_items', {
  id: serial('id').primaryKey(),
  prescriptionId: integer('prescription_id').notNull(),
  medicineName: text('medicine_name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration: text('duration').notNull(),
  instructions: text('instructions').default(''),
  dispensed: text('dispensed').default('No'),
});

// Medicines & Pharmacy Inventory
export const medicines = pgTable('medicines', {
  id: serial('id').primaryKey(),
  medicineCode: text('medicine_code').notNull().unique(), // MED-4001
  name: text('name').notNull(),
  genericName: text('generic_name').notNull(),
  category: text('category').notNull(), // Antibiotic, Analgesic, Antacid, Cardiovascular, Antidiabetic, etc.
  manufacturer: text('manufacturer').notNull(),
  batchNumber: text('batch_number').notNull(),
  expiryDate: text('expiry_date').notNull(),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockLevel: integer('min_stock_level').notNull().default(10),
  locationRack: text('location_rack').default('Shelf A-1'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Laboratory Tests
export const laboratoryTests = pgTable('laboratory_tests', {
  id: serial('id').primaryKey(),
  testCode: text('test_code').notNull().unique(), // LAB-5001
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: integer('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  testName: text('test_name').notNull(),
  testCategory: text('test_category').notNull(), // Hematology, Biochemistry, Microbiology, Pathology, Radiology
  requestedDate: text('requested_date').notNull(),
  sampleStatus: text('sample_status').notNull().default('Requested'), // Requested, Sample Collected, Processing, Completed, Cancelled
  result: text('result').default(''),
  referenceRange: text('reference_range').default(''),
  labTechnician: text('lab_technician').default(''),
  reportStatus: text('report_status').notNull().default('Pending'), // Pending, Verified, Completed
  notes: text('notes').default(''),
  completedDate: text('completed_date').default(''),
  cost: numeric('cost', { precision: 10, scale: 2 }).notNull().default('350.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Rooms
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomNumber: text('room_number').notNull().unique(),
  roomType: text('room_type').notNull(), // General, Semi-private, Private, ICU, Emergency, Operation Theatre
  floor: text('floor').notNull(),
  dailyRate: numeric('daily_rate', { precision: 10, scale: 2 }).notNull(),
  totalBeds: integer('total_beds').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Beds
export const beds = pgTable('beds', {
  id: serial('id').primaryKey(),
  bedNumber: text('bed_number').notNull().unique(),
  roomId: integer('room_id').notNull(),
  roomNumber: text('room_number').notNull(),
  roomType: text('room_type').notNull(),
  status: text('status').notNull().default('Available'), // Available, Occupied, Reserved, Cleaning, Maintenance
  patientId: integer('patient_id'),
  patientName: text('patient_name').default(''),
  admissionDate: text('admission_date').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Admissions
export const admissions = pgTable('admissions', {
  id: serial('id').primaryKey(),
  admissionCode: text('admission_code').notNull().unique(), // ADM-6001
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: integer('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  roomId: integer('room_id').notNull(),
  bedId: integer('bed_id').notNull(),
  bedNumber: text('bed_number').notNull(),
  admissionDate: text('admission_date').notNull(),
  reason: text('reason').notNull(),
  diagnosis: text('diagnosis').notNull(),
  notes: text('notes').default(''),
  status: text('status').notNull().default('Admitted'), // Admitted, Discharged
  createdAt: timestamp('created_at').defaultNow(),
});

// Discharges
export const discharges = pgTable('discharges', {
  id: serial('id').primaryKey(),
  admissionId: integer('admission_id').notNull(),
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  dischargeDate: text('discharge_date').notNull(),
  finalDiagnosis: text('final_diagnosis').notNull(),
  doctorNotes: text('doctor_notes').default(''),
  treatmentSummary: text('treatment_summary').notNull(),
  followUpInstructions: text('follow_up_instructions').notNull(),
  finalBillId: integer('final_bill_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bills & Invoices
export const bills = pgTable('bills', {
  id: serial('id').primaryKey(),
  billCode: text('bill_code').notNull().unique(), // INV-7001
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  consultationCharges: numeric('consultation_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  roomCharges: numeric('room_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  doctorCharges: numeric('doctor_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  labCharges: numeric('lab_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  pharmacyCharges: numeric('pharmacy_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  procedureCharges: numeric('procedure_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  otherCharges: numeric('other_charges', { precision: 10, scale: 2 }).notNull().default('0.00'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 10, scale: 2 }).notNull().default('0.00'),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  status: text('status').notNull().default('Pending'), // Pending, Partially Paid, Paid, Cancelled, Refunded
  billDate: text('bill_date').notNull(),
  dueDate: text('due_date').notNull(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bill line items
export const billItems = pgTable('bill_items', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id').notNull(),
  itemDescription: text('item_description').notNull(),
  category: text('category').notNull(), // Consultation, Room, Lab, Medicine, Procedure
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
});

// Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  paymentCode: text('payment_code').notNull().unique(), // PAY-8001
  billId: integer('bill_id').notNull(),
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // UPI, Debit Card, Credit Card, Net Banking, Wallet, Cash, Counter
  paymentStatus: text('payment_status').notNull().default('Successful'), // Successful, Pending, Failed, Refunded
  transactionReference: text('transaction_reference').notNull(),
  paymentDate: text('payment_date').notNull(),
  receiptUrl: text('receipt_url').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').default(''),
  roleTarget: text('role_target').default('all'), // all, admin, doctor, patient, receptionist, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // info, success, warning, urgent
  isRead: text('is_read').notNull().default('no'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Emergency Department Module
export const emergencies = pgTable('emergencies', {
  id: serial('id').primaryKey(),
  emergencyCode: text('emergency_code').notNull().unique(), // EMG-9001
  patientName: text('patient_name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  priority: text('priority').notNull(), // Critical, High, Medium, Low
  assignedDoctor: text('assigned_doctor').default('Dr. Emergency On-Duty'),
  roomBed: text('room_bed').default('ER-Bay 1'),
  arrivalTime: text('arrival_time').notNull(),
  status: text('status').notNull().default('Triaged'), // Triaged, In Treatment, Stabilized, Admitted, Discharged
  conditionNotes: text('condition_notes').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  recordId: text('record_id').default(''),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
