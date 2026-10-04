import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import * as s from './src/db/schema.ts';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Run seed on boot
seedDatabaseIfEmpty().catch((err) => console.error('Seed error:', err));

// ==========================================
// 1. AUTHENTICATION & DEMO ROLES
// ==========================================
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // Look up in database
    const dbUsers = await db.select().from(s.users).where(eq(s.users.uid, user.uid));
    let currentUser = dbUsers[0];

    if (!currentUser) {
      // Upsert user
      const inserted = await db.insert(s.users).values({
        uid: user.uid,
        email: user.email || 'user@hospital.internal',
        name: (user as any).name || (user as any).displayName || 'Hospital User',
        role: (user as any).role || 'admin',
      }).returning();
      currentUser = inserted[0];
    }

    res.json({
      user: {
        id: currentUser.id,
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        phone: currentUser.phone,
        avatarUrl: currentUser.avatarUrl,
      }
    });
  } catch (error: any) {
    console.error('Error fetching auth user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Demo accounts switch endpoint
app.post('/api/auth/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles = [
      'super_admin',
      'admin',
      'doctor',
      'nurse',
      'receptionist',
      'pharmacist',
      'lab_technician',
      'patient',
      'accountant'
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Role-specific profile demo
    const roleProfiles: Record<string, { name: string; email: string; phone: string }> = {
      super_admin: { name: 'Dr. Arthur Sterling (Director)', email: 'director@hospital.org', phone: '+1 555-0100' },
      admin: { name: 'Arthur Pendelton (Admin)', email: 'admin@hospital.org', phone: '+1 555-0107' },
      doctor: { name: 'Dr. Sarah Mitchell (Cardiologist)', email: 'dr.mitchell@hospital.org', phone: '+1 555-234-5678' },
      nurse: { name: 'Nurse Clara Oswald (Head Nurse)', email: 'nurse.clara@hospital.org', phone: '+1 555-0101' },
      receptionist: { name: 'Elena Rostova (Front Desk)', email: 'reception.elena@hospital.org', phone: '+1 555-0103' },
      pharmacist: { name: 'Marcus Vance (Chief Pharmacist)', email: 'pharmacy.marcus@hospital.org', phone: '+1 555-0104' },
      lab_technician: { name: 'Dr. Liam Thorne (Pathologist)', email: 'lab.liam@hospital.org', phone: '+1 555-0105' },
      patient: { name: 'Alexander Hayes (Patient PAT-1001)', email: 'alex.hayes@example.com', phone: '+1 555-701-0001' },
      accountant: { name: 'Samantha Sterling (Finance)', email: 'billing.sam@hospital.org', phone: '+1 555-0106' },
    };

    const profile = roleProfiles[role];
    const demoUid = `demo-${role}`;

    // Ensure exists in DB
    const existing = await db.select().from(s.users).where(eq(s.users.uid, demoUid));
    let dbUser = existing[0];
    if (!dbUser) {
      const inserted = await db.insert(s.users).values({
        uid: demoUid,
        email: profile.email,
        name: profile.name,
        role: role,
        phone: profile.phone,
      }).returning();
      dbUser = inserted[0];
    }

    // Return token and user info
    res.json({
      token: `demo-token-${role}`,
      user: {
        id: dbUser.id,
        uid: dbUser.uid,
        name: profile.name,
        email: profile.email,
        role: role,
        phone: profile.phone,
      }
    });
  } catch (error: any) {
    console.error('Demo switch error:', error);
    res.status(500).json({ error: 'Failed to switch demo account' });
  }
});

// ==========================================
// 2. DASHBOARD AGGREGATED METRICS
// ==========================================
app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      patientsCount,
      doctorsCount,
      staffCount,
      totalAppointments,
      todayAppointments,
      emergencyCases,
      medicinesList,
      labTestsList,
      bedsList,
      billsList,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(s.patients),
      db.select({ count: sql<number>`count(*)` }).from(s.doctors),
      db.select({ count: sql<number>`count(*)` }).from(s.staff),
      db.select({ count: sql<number>`count(*)` }).from(s.appointments),
      db.select().from(s.appointments).where(eq(s.appointments.appointmentDate, todayStr)),
      db.select().from(s.emergencies),
      db.select().from(s.medicines),
      db.select().from(s.laboratoryTests),
      db.select().from(s.beds),
      db.select().from(s.bills),
    ]);

    const totalBeds = bedsList.length;
    const occupiedBeds = bedsList.filter((b) => b.status === 'Occupied').length;
    const availableBeds = bedsList.filter((b) => b.status === 'Available').length;
    const cleaningBeds = bedsList.filter((b) => b.status === 'Cleaning' || b.status === 'Maintenance').length;

    const pendingAppointments = todayAppointments.filter((a) => a.status === 'Pending' || a.status === 'Confirmed').length;
    const completedAppointments = todayAppointments.filter((a) => a.status === 'Completed').length;

    const lowStockMedicines = medicinesList.filter((m) => m.stockQuantity <= m.minStockLevel);
    const pendingLabTests = labTestsList.filter((t) => t.sampleStatus !== 'Completed');

    // Revenue calculation
    let todayRevenue = 0;
    let totalRevenue = 0;
    let pendingBillsTotal = 0;

    billsList.forEach((bill) => {
      const grandTotal = parseFloat(bill.grandTotal || '0');
      const paid = parseFloat(bill.paidAmount || '0');
      totalRevenue += paid;
      if (bill.billDate === todayStr) {
        todayRevenue += paid;
      }
      if (bill.status === 'Pending' || bill.status === 'Partially Paid') {
        pendingBillsTotal += (grandTotal - paid);
      }
    });

    // Recent queries
    const [recentAppointments, recentPatients, recentBills, recentEmergencies] = await Promise.all([
      db.select().from(s.appointments).orderBy(desc(s.appointments.createdAt)).limit(5),
      db.select().from(s.patients).orderBy(desc(s.patients.createdAt)).limit(5),
      db.select().from(s.bills).orderBy(desc(s.bills.createdAt)).limit(5),
      db.select().from(s.emergencies).orderBy(desc(s.emergencies.createdAt)).limit(4),
    ]);

    res.json({
      metrics: {
        totalPatients: Number(patientsCount[0]?.count || 0),
        totalDoctors: Number(doctorsCount[0]?.count || 0),
        totalStaff: Number(staffCount[0]?.count || 0),
        totalAppointments: Number(totalAppointments[0]?.count || 0),
        todayAppointments: todayAppointments.length,
        pendingAppointments,
        completedAppointments,
        emergencyCount: emergencyCases.length,
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        lowStockCount: lowStockMedicines.length,
        pendingLabCount: pendingLabTests.length,
        todayRevenue,
        totalRevenue,
        pendingBillsTotal,
      },
      recentAppointments,
      recentPatients,
      recentBills,
      recentEmergencies,
      lowStockMedicines,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to calculate dashboard statistics' });
  }
});

// ==========================================
// 3. PATIENTS MANAGEMENT
// ==========================================
app.get('/api/patients', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const bloodGroup = (req.query.bloodGroup as string) || '';

    let query = db.select().from(s.patients).orderBy(desc(s.patients.createdAt));
    const allPatients = await query;

    let filtered = allPatients;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientCode.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    if (bloodGroup && bloodGroup !== 'all') {
      filtered = filtered.filter(p => p.bloodGroup === bloodGroup);
    }

    res.json(filtered);
  } catch (error: any) {
    console.error('Fetch patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.get('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const patientRecord = await db.select().from(s.patients).where(eq(s.patients.id, id));
    if (!patientRecord.length) return res.status(404).json({ error: 'Patient not found' });

    const patient = patientRecord[0];

    // Fetch related records
    const [appointments, medicalRecords, prescriptions, labs, bills] = await Promise.all([
      db.select().from(s.appointments).where(eq(s.appointments.patientId, id)).orderBy(desc(s.appointments.appointmentDate)),
      db.select().from(s.medicalRecords).where(eq(s.medicalRecords.patientId, id)).orderBy(desc(s.medicalRecords.recordDate)),
      db.select().from(s.prescriptions).where(eq(s.prescriptions.patientId, id)).orderBy(desc(s.prescriptions.createdAt)),
      db.select().from(s.laboratoryTests).where(eq(s.laboratoryTests.patientId, id)).orderBy(desc(s.laboratoryTests.requestedDate)),
      db.select().from(s.bills).where(eq(s.bills.patientId, id)).orderBy(desc(s.bills.createdAt)),
    ]);

    res.json({
      patient,
      appointments,
      medicalRecords,
      prescriptions,
      laboratoryTests: labs,
      bills,
    });
  } catch (error: any) {
    console.error('Fetch patient detail error:', error);
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Auto-generate patientCode
    const existing = await db.select({ count: sql<number>`count(*)` }).from(s.patients);
    const nextCode = `PAT-${1001 + Number(existing[0]?.count || 0)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const inserted = await db.insert(s.patients).values({
      patientCode: nextCode,
      fullName: data.fullName,
      dob: data.dob || '1990-01-01',
      age: parseInt(data.age) || 30,
      gender: data.gender || 'Other',
      bloodGroup: data.bloodGroup || 'O+',
      phone: data.phone || '',
      email: data.email || `${nextCode.toLowerCase()}@patient.hospital`,
      address: data.address || '',
      emergencyContactName: data.emergencyContactName || 'Family Member',
      emergencyContactPhone: data.emergencyContactPhone || '',
      medicalHistory: data.medicalHistory || '',
      allergies: data.allergies || 'None',
      previousConditions: data.previousConditions || '',
      registrationDate: todayStr,
      status: 'Active',
    }).returning();

    // Audit log
    await db.insert(s.auditLogs).values({
      userName: data.createdByName || 'System / Reception Desk',
      userRole: 'receptionist',
      action: 'CREATE_PATIENT',
      module: 'Patients',
      recordId: nextCode,
      details: `Registered patient ${data.fullName} with code ${nextCode}`,
    });

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to register patient' });
  }
});

app.put('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updated = await db.update(s.patients).set({
      fullName: data.fullName,
      age: parseInt(data.age) || undefined,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      phone: data.phone,
      email: data.email,
      address: data.address,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      medicalHistory: data.medicalHistory,
      allergies: data.allergies,
      previousConditions: data.previousConditions,
      status: data.status,
    }).where(eq(s.patients.id, id)).returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// ==========================================
// 4. DOCTORS & DEPARTMENTS
// ==========================================
app.get('/api/doctors', async (req: Request, res: Response) => {
  try {
    const dept = req.query.department as string;
    let list = await db.select().from(s.doctors).orderBy(s.doctors.name);
    if (dept && dept !== 'all') {
      list = list.filter((d) => d.department.toLowerCase() === dept.toLowerCase());
    }
    res.json(list);
  } catch (error: any) {
    console.error('Fetch doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.post('/api/doctors', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const inserted = await db.insert(s.doctors).values({
      name: d.name,
      email: d.email,
      phone: d.phone,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      department: d.department,
      consultationFee: d.consultationFee ? String(d.consultationFee) : '600.00',
      availabilityStatus: d.availabilityStatus || 'Available',
      profilePhoto: d.profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

app.put('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const d = req.body;
    const updated = await db.update(s.doctors).set({
      name: d.name,
      email: d.email,
      phone: d.phone,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      department: d.department,
      consultationFee: d.consultationFee ? String(d.consultationFee) : undefined,
      availabilityStatus: d.availabilityStatus,
    }).where(eq(s.doctors.id, id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

app.get('/api/departments', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.departments).orderBy(s.departments.name);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// ==========================================
// 5. APPOINTMENTS (WITH CONFLICT PREVENTION)
// ==========================================
app.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : undefined;
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    const date = req.query.date as string;
    const status = req.query.status as string;

    let list = await db.select().from(s.appointments).orderBy(desc(s.appointments.appointmentDate), desc(s.appointments.appointmentTime));

    if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
    if (patientId) list = list.filter((a) => a.patientId === patientId);
    if (date) list = list.filter((a) => a.appointmentDate === date);
    if (status && status !== 'all') list = list.filter((a) => a.status === status);

    res.json(list);
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason, appointmentType } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Missing required appointment fields' });
    }

    // Double-booking conflict check for the same doctor at the same date and time
    const conflicts = await db.select().from(s.appointments).where(
      and(
        eq(s.appointments.doctorId, parseInt(doctorId)),
        eq(s.appointments.appointmentDate, appointmentDate),
        eq(s.appointments.appointmentTime, appointmentTime),
        sql`${s.appointments.status} NOT IN ('Cancelled', 'No-show')`
      )
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: `Schedule conflict: Dr. is already booked at ${appointmentTime} on ${appointmentDate}. Please choose another time slot.`,
      });
    }

    // Lookup patient & doctor details
    const [patient] = await db.select().from(s.patients).where(eq(s.patients.id, parseInt(patientId)));
    const [doctor] = await db.select().from(s.doctors).where(eq(s.doctors.id, parseInt(doctorId)));

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor not found' });
    }

    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.appointments);
    const appointmentCode = `APT-${2001 + Number(countRes[0]?.count || 0)}`;

    const inserted = await db.insert(s.appointments).values({
      appointmentCode,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      appointmentDate,
      appointmentTime,
      reason: reason || 'General Consultation',
      appointmentType: appointmentType || 'General Checkup',
      status: 'Confirmed',
    }).returning();

    // Create notification
    await db.insert(s.notifications).values({
      title: 'Appointment Booked',
      message: `Appointment ${appointmentCode} scheduled for ${patient.fullName} with ${doctor.name} on ${appointmentDate} at ${appointmentTime}.`,
      type: 'info',
      roleTarget: 'all',
    });

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

app.put('/api/appointments/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;

    const updated = await db.update(s.appointments).set({
      status,
      notes: notes !== undefined ? notes : undefined,
    }).where(eq(s.appointments.id, id)).returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ==========================================
// 6. MEDICAL RECORDS & CLINICAL CONSULTATION
// ==========================================
app.get('/api/medical-records', async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    let list = await db.select().from(s.medicalRecords).orderBy(desc(s.medicalRecords.recordDate));
    if (patientId) list = list.filter((r) => r.patientId === patientId);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch medical records error:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

app.post('/api/medical-records', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const inserted = await db.insert(s.medicalRecords).values({
      patientId: parseInt(d.patientId),
      doctorId: parseInt(d.doctorId),
      doctorName: d.doctorName || 'Attending Physician',
      appointmentId: d.appointmentId ? parseInt(d.appointmentId) : null,
      recordDate: d.recordDate || todayStr,
      diagnosis: d.diagnosis,
      symptoms: d.symptoms,
      doctorNotes: d.doctorNotes || '',
      treatmentPlan: d.treatmentPlan || '',
      bpSystolic: parseInt(d.bpSystolic) || 120,
      bpDiastolic: parseInt(d.bpDiastolic) || 80,
      heartRate: parseInt(d.heartRate) || 72,
      temperature: d.temperature ? String(d.temperature) : '98.6',
      respiratoryRate: parseInt(d.respiratoryRate) || 16,
      weightKg: d.weightKg ? String(d.weightKg) : '68.00',
    }).returning();

    // If an appointment was linked, mark it Completed
    if (d.appointmentId) {
      await db.update(s.appointments).set({ status: 'Completed' }).where(eq(s.appointments.id, parseInt(d.appointmentId)));
    }

    // Audit log
    await db.insert(s.auditLogs).values({
      userName: d.doctorName || 'Doctor',
      userRole: 'doctor',
      action: 'ADD_MEDICAL_RECORD',
      module: 'Medical Records',
      recordId: String(inserted[0].id),
      details: `Added clinical diagnosis: ${d.diagnosis} for Patient ID: ${d.patientId}`,
    });

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Add medical record error:', error);
    res.status(500).json({ error: 'Failed to save medical consultation record' });
  }
});

// ==========================================
// 7. PRESCRIPTIONS & DISPENSING
// ==========================================
app.get('/api/prescriptions', async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    const status = req.query.status as string;

    const list = await db.select().from(s.prescriptions).orderBy(desc(s.prescriptions.createdAt));
    let filtered = list;
    if (patientId) filtered = filtered.filter((p) => p.patientId === patientId);
    if (status && status !== 'all') filtered = filtered.filter((p) => p.status === status);

    // Fetch items for each prescription
    const allItems = await db.select().from(s.prescriptionItems);
    const enriched = filtered.map((p) => ({
      ...p,
      items: allItems.filter((i) => i.prescriptionId === p.id),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('Fetch prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

app.post('/api/prescriptions', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, notes, items } = req.body;
    const [patient] = await db.select().from(s.patients).where(eq(s.patients.id, parseInt(patientId)));
    const [doctor] = await db.select().from(s.doctors).where(eq(s.doctors.id, parseInt(doctorId)));

    if (!patient || !doctor) return res.status(404).json({ error: 'Patient or Doctor not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.prescriptions);
    const prescriptionCode = `RX-${3001 + Number(countRes[0]?.count || 0)}`;

    const [prescription] = await db.insert(s.prescriptions).values({
      prescriptionCode,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      appointmentId: appointmentId ? parseInt(appointmentId) : null,
      prescriptionDate: todayStr,
      diagnosis: diagnosis || 'General Prescription',
      notes: notes || '',
      status: 'Pending',
    }).returning();

    // Insert items
    if (Array.isArray(items) && items.length > 0) {
      await db.insert(s.prescriptionItems).values(
        items.map((it: any) => ({
          prescriptionId: prescription.id,
          medicineName: it.medicineName,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions || '',
          dispensed: 'No',
        }))
      );
    }

    // Notify pharmacy
    await db.insert(s.notifications).values({
      title: 'New Prescription Created',
      message: `Prescription ${prescriptionCode} generated for ${patient.fullName} by ${doctor.name}. Ready for pharmacy fulfillment.`,
      type: 'info',
      roleTarget: 'pharmacist',
    });

    res.status(201).json(prescription);
  } catch (error: any) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Dispense prescription medicines
app.post('/api/prescriptions/:id/dispense', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [prescription] = await db.select().from(s.prescriptions).where(eq(s.prescriptions.id, id));
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    // Mark prescription as Dispensed
    await db.update(s.prescriptions).set({ status: 'Dispensed' }).where(eq(s.prescriptions.id, id));
    await db.update(s.prescriptionItems).set({ dispensed: 'Yes' }).where(eq(s.prescriptionItems.prescriptionId, id));

    // Audit log
    await db.insert(s.auditLogs).values({
      userName: req.body.pharmacistName || 'Chief Pharmacist',
      userRole: 'pharmacist',
      action: 'DISPENSE_PRESCRIPTION',
      module: 'Pharmacy',
      recordId: prescription.prescriptionCode,
      details: `Prescription ${prescription.prescriptionCode} fulfilled and dispensed to patient ${prescription.patientName}`,
    });

    res.json({ success: true, message: 'Prescription marked as dispensed successfully' });
  } catch (error: any) {
    console.error('Dispense error:', error);
    res.status(500).json({ error: 'Failed to dispense prescription' });
  }
});

// ==========================================
// 8. PHARMACY & MEDICINES INVENTORY
// ==========================================
app.get('/api/medicines', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    let list = await db.select().from(s.medicines).orderBy(s.medicines.name);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.medicineCode.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'all') {
      list = list.filter((m) => m.category === category);
    }

    res.json(list);
  } catch (error: any) {
    console.error('Fetch medicines error:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

app.post('/api/medicines', async (req: Request, res: Response) => {
  try {
    const m = req.body;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.medicines);
    const medicineCode = `MED-${4001 + Number(countRes[0]?.count || 0)}`;

    const inserted = await db.insert(s.medicines).values({
      medicineCode,
      name: m.name,
      genericName: m.genericName,
      category: m.category,
      manufacturer: m.manufacturer,
      batchNumber: m.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
      expiryDate: m.expiryDate || '2028-12-31',
      purchasePrice: String(m.purchasePrice || '5.00'),
      sellingPrice: String(m.sellingPrice || '10.00'),
      stockQuantity: parseInt(m.stockQuantity) || 100,
      minStockLevel: parseInt(m.minStockLevel) || 20,
      locationRack: m.locationRack || 'Shelf A-1',
    }).returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Create medicine error:', error);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// Update stock (adjust or restock)
app.put('/api/medicines/:id/stock', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { delta, quantity } = req.body;
    const [current] = await db.select().from(s.medicines).where(eq(s.medicines.id, id));
    if (!current) return res.status(404).json({ error: 'Medicine not found' });

    let newQty = current.stockQuantity;
    if (quantity !== undefined) {
      newQty = parseInt(quantity);
    } else if (delta !== undefined) {
      newQty = Math.max(0, current.stockQuantity + parseInt(delta));
    }

    const updated = await db.update(s.medicines).set({ stockQuantity: newQty }).where(eq(s.medicines.id, id)).returning();

    // Check low stock alert
    if (newQty <= current.minStockLevel) {
      await db.insert(s.notifications).values({
        title: 'Critical Stock Warning',
        message: `Stock level for ${current.name} is down to ${newQty} units (Minimum required: ${current.minStockLevel}).`,
        type: 'warning',
        roleTarget: 'pharmacist',
      });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// ==========================================
// 9. LABORATORY MODULE
// ==========================================
app.get('/api/laboratory', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    let list = await db.select().from(s.laboratoryTests).orderBy(desc(s.laboratoryTests.createdAt));

    if (status && status !== 'all') list = list.filter((t) => t.sampleStatus === status);
    if (patientId) list = list.filter((t) => t.patientId === patientId);

    res.json(list);
  } catch (error: any) {
    console.error('Fetch lab tests error:', error);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
});

app.post('/api/laboratory', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const [patient] = await db.select().from(s.patients).where(eq(s.patients.id, parseInt(d.patientId)));
    const [doctor] = await db.select().from(s.doctors).where(eq(s.doctors.id, parseInt(d.doctorId)));

    if (!patient || !doctor) return res.status(404).json({ error: 'Patient or Doctor not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.laboratoryTests);
    const testCode = `LAB-${5001 + Number(countRes[0]?.count || 0)}`;

    const inserted = await db.insert(s.laboratoryTests).values({
      testCode,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      testName: d.testName,
      testCategory: d.testCategory || 'Biochemistry',
      requestedDate: todayStr,
      sampleStatus: 'Requested',
      referenceRange: d.referenceRange || '',
      cost: d.cost ? String(d.cost) : '400.00',
    }).returning();

    await db.insert(s.notifications).values({
      title: 'New Diagnostic Request',
      message: `${d.testName} requested for ${patient.fullName} by ${doctor.name}. Test ID: ${testCode}.`,
      type: 'info',
      roleTarget: 'lab_technician',
    });

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Create lab test error:', error);
    res.status(500).json({ error: 'Failed to order lab test' });
  }
});

app.put('/api/laboratory/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const d = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = await db.update(s.laboratoryTests).set({
      sampleStatus: d.sampleStatus,
      result: d.result !== undefined ? d.result : undefined,
      referenceRange: d.referenceRange !== undefined ? d.referenceRange : undefined,
      labTechnician: d.labTechnician || undefined,
      reportStatus: d.sampleStatus === 'Completed' ? 'Completed' : d.reportStatus,
      notes: d.notes !== undefined ? d.notes : undefined,
      completedDate: d.sampleStatus === 'Completed' ? todayStr : undefined,
    }).where(eq(s.laboratoryTests.id, id)).returning();

    if (d.sampleStatus === 'Completed') {
      await db.insert(s.notifications).values({
        title: 'Laboratory Report Finalized',
        message: `Results for ${updated[0].testName} (${updated[0].testCode}) are verified and ready for review.`,
        type: 'success',
        roleTarget: 'all',
      });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update lab test error:', error);
    res.status(500).json({ error: 'Failed to update lab test' });
  }
});

// ==========================================
// 10. ROOMS, BEDS & ADMISSIONS
// ==========================================
app.get('/api/rooms', async (_req: Request, res: Response) => {
  try {
    const [roomsList, bedsList] = await Promise.all([
      db.select().from(s.rooms).orderBy(s.rooms.roomNumber),
      db.select().from(s.beds).orderBy(s.beds.bedNumber),
    ]);

    const enriched = roomsList.map((room) => {
      const roomBeds = bedsList.filter((b) => b.roomId === room.id);
      return {
        ...room,
        beds: roomBeds,
        availableBeds: roomBeds.filter((b) => b.status === 'Available').length,
        occupiedBeds: roomBeds.filter((b) => b.status === 'Occupied').length,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    console.error('Fetch rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/beds', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.beds).orderBy(s.beds.bedNumber);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch beds error:', error);
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
});

app.put('/api/beds/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await db.update(s.beds).set({ status }).where(eq(s.beds.id, id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update bed status error:', error);
    res.status(500).json({ error: 'Failed to update bed status' });
  }
});

app.get('/api/admissions', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.admissions).orderBy(desc(s.admissions.createdAt));
    res.json(list);
  } catch (error: any) {
    console.error('Fetch admissions error:', error);
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
});

app.post('/api/admissions', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, bedId, reason, diagnosis, notes } = req.body;
    const [patient] = await db.select().from(s.patients).where(eq(s.patients.id, parseInt(patientId)));
    const [doctor] = await db.select().from(s.doctors).where(eq(s.doctors.id, parseInt(doctorId)));
    const [bed] = await db.select().from(s.beds).where(eq(s.beds.id, parseInt(bedId)));

    if (!patient || !doctor || !bed) {
      return res.status(404).json({ error: 'Patient, Doctor, or Bed not found' });
    }

    if (bed.status !== 'Available') {
      return res.status(400).json({ error: `Bed ${bed.bedNumber} is not currently available (Status: ${bed.status})` });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.admissions);
    const admissionCode = `ADM-${6001 + Number(countRes[0]?.count || 0)}`;

    const [admission] = await db.insert(s.admissions).values({
      admissionCode,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      roomId: bed.roomId,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      admissionDate: todayStr,
      reason,
      diagnosis,
      notes: notes || '',
      status: 'Admitted',
    }).returning();

    // Update bed status to Occupied
    await db.update(s.beds).set({
      status: 'Occupied',
      patientId: patient.id,
      patientName: patient.fullName,
      admissionDate: todayStr,
    }).where(eq(s.beds.id, bed.id));

    await db.insert(s.notifications).values({
      title: 'Inpatient Admitted',
      message: `${patient.fullName} admitted to ${bed.roomNumber} (${bed.bedNumber}) under ${doctor.name}.`,
      type: 'info',
      roleTarget: 'all',
    });

    res.status(201).json(admission);
  } catch (error: any) {
    console.error('Admission error:', error);
    res.status(500).json({ error: 'Failed to admit patient' });
  }
});

// Discharge patient
app.post('/api/discharges', async (req: Request, res: Response) => {
  try {
    const { admissionId, finalDiagnosis, doctorNotes, treatmentSummary, followUpInstructions } = req.body;
    const [admission] = await db.select().from(s.admissions).where(eq(s.admissions.id, parseInt(admissionId)));

    if (!admission) return res.status(404).json({ error: 'Admission record not found' });

    const todayStr = new Date().toISOString().split('T')[0];

    // Mark admission as Discharged
    await db.update(s.admissions).set({ status: 'Discharged' }).where(eq(s.admissions.id, admission.id));

    // Release bed -> status: Cleaning
    await db.update(s.beds).set({
      status: 'Cleaning',
      patientId: null,
      patientName: '',
      admissionDate: '',
    }).where(eq(s.beds.id, admission.bedId));

    const [discharge] = await db.insert(s.discharges).values({
      admissionId: admission.id,
      patientId: admission.patientId,
      patientName: admission.patientName,
      dischargeDate: todayStr,
      finalDiagnosis: finalDiagnosis || admission.diagnosis,
      doctorNotes: doctorNotes || '',
      treatmentSummary: treatmentSummary || 'Course completed successfully.',
      followUpInstructions: followUpInstructions || 'Review in OPD after 10 days.',
    }).returning();

    await db.insert(s.notifications).values({
      title: 'Patient Discharged',
      message: `${admission.patientName} successfully discharged from ${admission.bedNumber}. Bed marked for sanitation.`,
      type: 'success',
      roleTarget: 'all',
    });

    res.status(201).json(discharge);
  } catch (error: any) {
    console.error('Discharge error:', error);
    res.status(500).json({ error: 'Failed to discharge patient' });
  }
});

// ==========================================
// 11. BILLING & INVOICES
// ==========================================
app.get('/api/bills', async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    const status = req.query.status as string;

    let list = await db.select().from(s.bills).orderBy(desc(s.bills.createdAt));
    if (patientId) list = list.filter((b) => b.patientId === patientId);
    if (status && status !== 'all') list = list.filter((b) => b.status === status);

    const allItems = await db.select().from(s.billItems);
    const enriched = list.map((bill) => ({
      ...bill,
      items: allItems.filter((i) => i.billId === bill.id),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('Fetch bills error:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.post('/api/bills', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const [patient] = await db.select().from(s.patients).where(eq(s.patients.id, parseInt(d.patientId)));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.bills);
    const billCode = `INV-${7001 + Number(countRes[0]?.count || 0)}`;

    const consultation = parseFloat(d.consultationCharges || '0');
    const room = parseFloat(d.roomCharges || '0');
    const doctor = parseFloat(d.doctorCharges || '0');
    const lab = parseFloat(d.labCharges || '0');
    const pharmacy = parseFloat(d.pharmacyCharges || '0');
    const procedure = parseFloat(d.procedureCharges || '0');
    const other = parseFloat(d.otherCharges || '0');
    const discount = parseFloat(d.discount || '0');

    const subtotal = consultation + room + doctor + lab + pharmacy + procedure + other;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = +(taxableSubtotal * 0.05).toFixed(2); // 5% GST/Tax
    const grandTotal = +(taxableSubtotal + taxAmount).toFixed(2);

    const [bill] = await db.insert(s.bills).values({
      billCode,
      patientId: patient.id,
      patientName: patient.fullName,
      consultationCharges: consultation.toFixed(2),
      roomCharges: room.toFixed(2),
      doctorCharges: doctor.toFixed(2),
      labCharges: lab.toFixed(2),
      pharmacyCharges: pharmacy.toFixed(2),
      procedureCharges: procedure.toFixed(2),
      otherCharges: other.toFixed(2),
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      paidAmount: '0.00',
      status: 'Pending',
      billDate: todayStr,
      dueDate: d.dueDate || todayStr,
      notes: d.notes || '',
    }).returning();

    // Insert items if provided
    if (Array.isArray(d.items) && d.items.length > 0) {
      await db.insert(s.billItems).values(
        d.items.map((it: any) => ({
          billId: bill.id,
          itemDescription: it.description,
          category: it.category || 'Consultation',
          quantity: it.quantity || 1,
          unitPrice: String(it.unitPrice || '0.00'),
          totalAmount: String(it.totalAmount || '0.00'),
        }))
      );
    }

    res.status(201).json(bill);
  } catch (error: any) {
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// ==========================================
// 12. PAYMENTS (UPI, CARDS, NET BANKING, CASH)
// ==========================================
app.get('/api/payments', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.payments).orderBy(desc(s.payments.paymentDate));
    res.json(list);
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/payments', async (req: Request, res: Response) => {
  try {
    const { billId, amount, paymentMethod, transactionReference } = req.body;
    const [bill] = await db.select().from(s.bills).where(eq(s.bills.id, parseInt(billId)));

    if (!bill) return res.status(404).json({ error: 'Invoice not found' });

    const payAmt = parseFloat(amount || '0');
    if (payAmt <= 0) return res.status(400).json({ error: 'Invalid payment amount' });

    const currentPaid = parseFloat(bill.paidAmount || '0');
    const grandTotal = parseFloat(bill.grandTotal || '0');
    const newPaid = currentPaid + payAmt;

    const todayStr = new Date().toISOString().split('T')[0];
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.payments);
    const paymentCode = `PAY-${8001 + Number(countRes[0]?.count || 0)}`;

    const [payment] = await db.insert(s.payments).values({
      paymentCode,
      billId: bill.id,
      patientId: bill.patientId,
      patientName: bill.patientName,
      amount: payAmt.toFixed(2),
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Successful',
      transactionReference: transactionReference || `TXN-${Date.now().toString().slice(-8)}`,
      paymentDate: todayStr,
      receiptUrl: `/receipts/${paymentCode}.pdf`,
    }).returning();

    // Update bill paid status
    const newStatus = newPaid >= grandTotal ? 'Paid' : 'Partially Paid';
    await db.update(s.bills).set({
      paidAmount: newPaid.toFixed(2),
      status: newStatus,
    }).where(eq(s.bills.id, bill.id));

    // Audit log
    await db.insert(s.auditLogs).values({
      userName: req.body.processedByName || 'Billing Cashier',
      userRole: 'accountant',
      action: 'PAYMENT_RECEIVED',
      module: 'Billing',
      recordId: paymentCode,
      details: `Collected ${paymentMethod} payment of $${payAmt.toFixed(2)} for ${bill.billCode}`,
    });

    res.status(201).json({
      payment,
      billStatus: newStatus,
      paidAmount: newPaid,
      remainingBalance: Math.max(0, grandTotal - newPaid),
    });
  } catch (error: any) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// ==========================================
// 13. EMERGENCY ROOM MODULE
// ==========================================
app.get('/api/emergencies', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.emergencies).orderBy(desc(s.emergencies.createdAt));
    res.json(list);
  } catch (error: any) {
    console.error('Fetch emergencies error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency cases' });
  }
});

app.post('/api/emergencies', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.emergencies);
    const emergencyCode = `EMG-${9001 + Number(countRes[0]?.count || 0)}`;

    const [emergency] = await db.insert(s.emergencies).values({
      emergencyCode,
      patientName: d.patientName,
      age: parseInt(d.age) || 35,
      gender: d.gender || 'Unknown',
      priority: d.priority || 'High',
      assignedDoctor: d.assignedDoctor || 'Dr. Amanda Brooks',
      roomBed: d.roomBed || 'ER Bay 1',
      arrivalTime: d.arrivalTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Triaged',
      conditionNotes: d.conditionNotes || 'Immediate clinical triage required.',
    }).returning();

    await db.insert(s.notifications).values({
      title: `PRIORITY ALERT: ${emergency.priority} Case Received`,
      message: `${emergency.patientName} arrived at ${emergency.roomBed} under ${emergency.assignedDoctor}.`,
      type: emergency.priority === 'Critical' ? 'urgent' : 'warning',
      roleTarget: 'all',
    });

    res.status(201).json(emergency);
  } catch (error: any) {
    console.error('Register emergency error:', error);
    res.status(500).json({ error: 'Failed to register emergency case' });
  }
});

app.put('/api/emergencies/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, conditionNotes } = req.body;
    const updated = await db.update(s.emergencies).set({
      status,
      conditionNotes: conditionNotes || undefined,
    }).where(eq(s.emergencies.id, id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update emergency error:', error);
    res.status(500).json({ error: 'Failed to update emergency status' });
  }
});

// ==========================================
// 14. STAFF MANAGEMENT
// ==========================================
app.get('/api/staff', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.staff).orderBy(s.staff.name);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/staff', async (req: Request, res: Response) => {
  try {
    const d = req.body;
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(s.staff);
    const staffCode = `STF-${108 + Number(countRes[0]?.count || 0)}`;

    const [member] = await db.insert(s.staff).values({
      staffCode,
      name: d.name,
      role: d.role,
      department: d.department,
      phone: d.phone,
      email: d.email,
      joiningDate: d.joiningDate || new Date().toISOString().split('T')[0],
      shift: d.shift || 'Morning (8 AM - 4 PM)',
      status: 'Active',
      photoUrl: d.photoUrl || '',
    }).returning();

    res.status(201).json(member);
  } catch (error: any) {
    console.error('Add staff error:', error);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// ==========================================
// 15. NOTIFICATIONS & AUDIT LOGS
// ==========================================
app.get('/api/notifications', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.notifications).orderBy(desc(s.notifications.createdAt)).limit(30);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(s.notifications).set({ isRead: 'yes' }).where(eq(s.notifications.id, id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(s.auditLogs).orderBy(desc(s.auditLogs.createdAt)).limit(50);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ==========================================
// 16. REPORTS (REVENUE, PATIENTS, ADMISSIONS)
// ==========================================
app.get('/api/reports/summary', async (_req: Request, res: Response) => {
  try {
    const [patients, appointments, doctors, bills, medicines, beds] = await Promise.all([
      db.select().from(s.patients),
      db.select().from(s.appointments),
      db.select().from(s.doctors),
      db.select().from(s.bills),
      db.select().from(s.medicines),
      db.select().from(s.beds),
    ]);

    // Department breakdown
    const departmentBreakdown: Record<string, number> = {};
    doctors.forEach((d) => {
      departmentBreakdown[d.department] = (departmentBreakdown[d.department] || 0) + 1;
    });

    // Appointment status breakdown
    const appointmentStatusBreakdown: Record<string, number> = {};
    appointments.forEach((a) => {
      appointmentStatusBreakdown[a.status] = (appointmentStatusBreakdown[a.status] || 0) + 1;
    });

    // Pharmacy valuation
    let totalPharmacyInventoryValue = 0;
    medicines.forEach((m) => {
      totalPharmacyInventoryValue += m.stockQuantity * parseFloat(m.sellingPrice || '0');
    });

    res.json({
      departmentBreakdown,
      appointmentStatusBreakdown,
      totalPharmacyInventoryValue: +totalPharmacyInventoryValue.toFixed(2),
      totalPatientsCount: patients.length,
      totalAppointmentsCount: appointments.length,
      totalBeds: beds.length,
      occupiedBeds: beds.filter((b) => b.status === 'Occupied').length,
    });
  } catch (error: any) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

// VITE MIDDLEWARE SETUP FOR PRODUCTION / DEVELOPMENT
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital Management System server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
