import { db } from './index.ts';
import * as s from './schema.ts';
import { sql } from 'drizzle-orm';

export async function seedDatabaseIfEmpty() {
  try {
    // Check if doctors table has records
    const existingDoctors = await db.select({ count: sql<number>`count(*)` }).from(s.doctors);
    const count = Number(existingDoctors[0]?.count || 0);

    if (count > 0) {
      console.log('Database already contains records. Skipping seed.');
      return;
    }

    console.log('Database is empty. Seeding initial data...');

    // 1. Departments
    await db.insert(s.departments).values([
      { name: 'Cardiology', code: 'CARD', description: 'Comprehensive heart & cardiovascular care', headDoctor: 'Dr. Sarah Mitchell', location: 'Wing A, Floor 2' },
      { name: 'Neurology', code: 'NEUR', description: 'Brain, spinal cord, and nerve disorders', headDoctor: 'Dr. James Chen', location: 'Wing B, Floor 3' },
      { name: 'Orthopedics', code: 'ORTH', description: 'Bones, joints, ligaments, and tendons', headDoctor: 'Dr. Robert Miller', location: 'Wing C, Floor 1' },
      { name: 'Pediatrics', code: 'PEDI', description: 'Infant, child, and adolescent healthcare', headDoctor: 'Dr. Emily Watson', location: 'Wing A, Floor 1' },
      { name: 'General Medicine', code: 'GENM', description: 'Adult primary and internal medicine', headDoctor: 'Dr. Rajesh Sharma', location: 'Main Building, Floor 1' },
      { name: 'General Surgery', code: 'SURG', description: 'Inpatient and outpatient surgical care', headDoctor: 'Dr. David Taylor', location: 'Wing D, Floor 4' },
      { name: 'Dermatology', code: 'DERM', description: 'Skin, hair, and nail treatments', headDoctor: 'Dr. Aisha Patel', location: 'Wing B, Floor 2' },
      { name: 'Gynecology & Obstetrics', code: 'GYNE', description: 'Women healthcare, maternity, and delivery', headDoctor: 'Dr. Linda Davis', location: 'Wing C, Floor 3' },
      { name: 'ENT (Otolaryngology)', code: 'ENT', description: 'Ear, nose, and throat diagnostics & surgeries', headDoctor: 'Dr. Mark Wilson', location: 'Wing A, Floor 3' },
      { name: 'Emergency Medicine', code: 'EMER', description: '24/7 Level-1 Trauma and Acute Care', headDoctor: 'Dr. Amanda Brooks', location: 'Ground Floor, ER Entrance' },
      { name: 'Radiology & Imaging', code: 'RADI', description: 'MRI, CT scan, Ultrasound, and X-Ray', headDoctor: 'Dr. Kevin White', location: 'Basement 1, Diagnostic Center' },
      { name: 'Pathology & Laboratory', code: 'PATH', description: 'Automated blood, tissue, and clinical microbiology', headDoctor: 'Dr. Sophia Anderson', location: 'Basement 1, Central Lab' },
    ]);

    // 2. Doctors (12 doctors)
    const insertedDoctors = await db.insert(s.doctors).values([
      { name: 'Dr. Sarah Mitchell', email: 'dr.mitchell@hospital.org', phone: '+1 (555) 234-5678', specialization: 'Interventional Cardiology', qualification: 'MD, FACC, FSCAI', experience: '15 Years', department: 'Cardiology', consultationFee: '800.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. James Chen', email: 'dr.chen@hospital.org', phone: '+1 (555) 345-6789', specialization: 'Neurosurgeon & Neuro-oncology', qualification: 'MD, PhD, FACS', experience: '18 Years', department: 'Neurology', consultationFee: '1000.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Robert Miller', email: 'dr.miller@hospital.org', phone: '+1 (555) 456-7890', specialization: 'Joint Replacement & Sports Injury', qualification: 'MS (Ortho), FRCS', experience: '12 Years', department: 'Orthopedics', consultationFee: '750.00', availabilityStatus: 'In Consultation', profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Emily Watson', email: 'dr.watson@hospital.org', phone: '+1 (555) 567-8901', specialization: 'Pediatric Care & Neonatology', qualification: 'MD, DNB (Pediatrics)', experience: '10 Years', department: 'Pediatrics', consultationFee: '600.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1594824813579-a78b5c907137?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Rajesh Sharma', email: 'dr.sharma@hospital.org', phone: '+1 (555) 678-9012', specialization: 'Internal Medicine & Diabetology', qualification: 'MBBS, MD (Medicine)', experience: '20 Years', department: 'General Medicine', consultationFee: '500.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. David Taylor', email: 'dr.taylor@hospital.org', phone: '+1 (555) 789-0123', specialization: 'Laparoscopic & Bariatric Surgery', qualification: 'MS, FRCS, FMAS', experience: '16 Years', department: 'General Surgery', consultationFee: '900.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Aisha Patel', email: 'dr.patel@hospital.org', phone: '+1 (555) 890-1234', specialization: 'Clinical Dermatology & Cosmetology', qualification: 'MD (Derm), FAAD', experience: '9 Years', department: 'Dermatology', consultationFee: '650.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Linda Davis', email: 'dr.davis@hospital.org', phone: '+1 (555) 901-2345', specialization: 'Obstetrics & High-Risk Pregnancy', qualification: 'MD, FACOG', experience: '14 Years', department: 'Gynecology & Obstetrics', consultationFee: '700.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1594824813579-a78b5c907137?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Mark Wilson', email: 'dr.wilson@hospital.org', phone: '+1 (555) 012-3456', specialization: 'ENT Head & Neck Surgery', qualification: 'MS (ENT), DLO', experience: '11 Years', department: 'ENT (Otolaryngology)', consultationFee: '600.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dr. Amanda Brooks', email: 'dr.brooks@hospital.org', phone: '+1 (555) 123-4560', specialization: 'Trauma & Critical Care', qualification: 'MD (Emergency Medicine)', experience: '13 Years', department: 'Emergency Medicine', consultationFee: '850.00', availabilityStatus: 'Available', profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' },
    ]).returning();

    // 3. Staff members
    await db.insert(s.staff).values([
      { staffCode: 'STF-101', name: 'Nurse Clara Oswald', role: 'Nurse', department: 'Emergency Medicine', phone: '+1 555-0101', email: 'nurse.clara@hospital.org', joiningDate: '2023-01-15', shift: 'Morning (8 AM - 4 PM)', status: 'Active' },
      { staffCode: 'STF-102', name: 'Nurse John Watson', role: 'Nurse', department: 'Cardiology ICU', phone: '+1 555-0102', email: 'nurse.john@hospital.org', joiningDate: '2022-06-10', shift: 'Night (8 PM - 4 AM)', status: 'Active' },
      { staffCode: 'STF-103', name: 'Elena Rostova', role: 'Receptionist', department: 'Front Desk', phone: '+1 555-0103', email: 'reception.elena@hospital.org', joiningDate: '2023-03-01', shift: 'Morning (8 AM - 4 PM)', status: 'Active' },
      { staffCode: 'STF-104', name: 'Marcus Vance', role: 'Pharmacist', department: 'Central Pharmacy', phone: '+1 555-0104', email: 'pharmacy.marcus@hospital.org', joiningDate: '2021-11-20', shift: 'Day (10 AM - 6 PM)', status: 'Active' },
      { staffCode: 'STF-105', name: 'Dr. Liam Thorne', role: 'Lab Technician', department: 'Pathology & Laboratory', phone: '+1 555-0105', email: 'lab.liam@hospital.org', joiningDate: '2022-02-14', shift: 'Morning (8 AM - 4 PM)', status: 'Active' },
      { staffCode: 'STF-106', name: 'Samantha Sterling', role: 'Accountant', department: 'Finance & Billing', phone: '+1 555-0106', email: 'billing.sam@hospital.org', joiningDate: '2021-08-05', shift: 'Day (9 AM - 5 PM)', status: 'Active' },
      { staffCode: 'STF-107', name: 'Arthur Pendelton', role: 'Admin', department: 'Hospital Administration', phone: '+1 555-0107', email: 'admin.arthur@hospital.org', joiningDate: '2020-04-01', shift: 'Day (9 AM - 5 PM)', status: 'Active' },
    ]);

    // 4. Patients (22 patients)
    const insertedPatients = await db.insert(s.patients).values([
      { patientCode: 'PAT-1001', fullName: 'Alexander Hayes', dob: '1988-04-12', age: 38, gender: 'Male', bloodGroup: 'O+', phone: '+1 555-701-0001', email: 'alex.hayes@example.com', address: '742 Evergreen Terrace, Springfield', emergencyContactName: 'Helen Hayes (Spouse)', emergencyContactPhone: '+1 555-701-0002', medicalHistory: 'Hypertension diagnosed 2021', allergies: 'Penicillin', previousConditions: 'Mild Asthmatic', registrationDate: '2026-01-10', status: 'Active' },
      { patientCode: 'PAT-1002', fullName: 'Beatrice Gomez', dob: '1995-09-23', age: 31, gender: 'Female', bloodGroup: 'A+', phone: '+1 555-701-0003', email: 'beatrice.g@example.com', address: '124 Conch Street, Pacific City', emergencyContactName: 'Carlos Gomez (Brother)', emergencyContactPhone: '+1 555-701-0004', medicalHistory: 'Migraine attacks', allergies: 'Sulfa Drugs', previousConditions: 'None', registrationDate: '2026-01-15', status: 'Active' },
      { patientCode: 'PAT-1003', fullName: 'Charles Montgomery', dob: '1958-02-18', age: 68, gender: 'Male', bloodGroup: 'B+', phone: '+1 555-701-0005', email: 'charles.m@example.com', address: '450 Oak Ridge Dr, Metroville', emergencyContactName: 'Eleanor Montgomery', emergencyContactPhone: '+1 555-701-0006', medicalHistory: 'Coronary artery disease, Stent placed 2022', allergies: 'Aspirin (Mild GI)', previousConditions: 'Type 2 Diabetes', registrationDate: '2026-01-18', status: 'Active' },
      { patientCode: 'PAT-1004', fullName: 'Diana Prince', dob: '1992-11-05', age: 33, gender: 'Female', bloodGroup: 'AB+', phone: '+1 555-701-0007', email: 'diana.p@example.com', address: '300 Paradise Island Rd, Metropolis', emergencyContactName: 'Steve Trevor', emergencyContactPhone: '+1 555-701-0008', medicalHistory: 'Seasonal Rhinitis', allergies: 'None', previousConditions: 'None', registrationDate: '2026-01-20', status: 'Active' },
      { patientCode: 'PAT-1005', fullName: 'Edward Norton', dob: '1975-07-30', age: 51, gender: 'Male', bloodGroup: 'O-', phone: '+1 555-701-0009', email: 'edward.n@example.com', address: '88 Cedar Court, Gotham', emergencyContactName: 'Laura Norton', emergencyContactPhone: '+1 555-701-0010', medicalHistory: 'Lumbar disc herniation L4-L5', allergies: 'Ibuprofen', previousConditions: 'Sciatica', registrationDate: '2026-02-01', status: 'Active' },
      { patientCode: 'PAT-1006', fullName: 'Fiona Gallagher', dob: '2001-03-14', age: 25, gender: 'Female', bloodGroup: 'A-', phone: '+1 555-701-0011', email: 'fiona.g@example.com', address: '2119 S Wallace St, Chicago', emergencyContactName: 'Lip Gallagher', emergencyContactPhone: '+1 555-701-0012', medicalHistory: 'Gastritis', allergies: 'Latex', previousConditions: 'None', registrationDate: '2026-02-05', status: 'Active' },
      { patientCode: 'PAT-1007', fullName: 'George Harrison', dob: '1963-06-25', age: 63, gender: 'Male', bloodGroup: 'B-', phone: '+1 555-701-0013', email: 'george.h@example.com', address: '9 Abbey Road, Liverpool District', emergencyContactName: 'Olivia Harrison', emergencyContactPhone: '+1 555-701-0014', medicalHistory: 'COPD stage 1', allergies: 'Peanuts', previousConditions: 'Chronic Bronchitis', registrationDate: '2026-02-12', status: 'Active' },
      { patientCode: 'PAT-1008', fullName: 'Hannah Abbott', dob: '2005-08-19', age: 21, gender: 'Female', bloodGroup: 'O+', phone: '+1 555-701-0015', email: 'hannah.a@example.com', address: '12 Godric Hollow, Bristol', emergencyContactName: 'Alice Abbott', emergencyContactPhone: '+1 555-701-0016', medicalHistory: 'Eczema', allergies: 'Nickel, Dust Mites', previousConditions: 'Childhood Asthma', registrationDate: '2026-02-18', status: 'Active' },
      { patientCode: 'PAT-1009', fullName: 'Ian Malcolm', dob: '1970-12-01', age: 55, gender: 'Male', bloodGroup: 'AB-', phone: '+1 555-701-0017', email: 'ian.m@example.com', address: '500 Isla Nublar Way, San Jose', emergencyContactName: 'Kelly Malcolm', emergencyContactPhone: '+1 555-701-0018', medicalHistory: 'Previous leg fracture fixation', allergies: 'Morphine (Nausea)', previousConditions: 'Osteoarthritis right knee', registrationDate: '2026-02-22', status: 'Active' },
      { patientCode: 'PAT-1010', fullName: 'Julia Roberts', dob: '1985-10-28', age: 40, gender: 'Female', bloodGroup: 'A+', phone: '+1 555-701-0019', email: 'julia.r@example.com', address: '17 Sunset Blvd, Los Angeles', emergencyContactName: 'Daniel Moder', emergencyContactPhone: '+1 555-701-0020', medicalHistory: 'Hypothyroidism on Levothyroxine', allergies: 'None', previousConditions: 'None', registrationDate: '2026-03-01', status: 'Active' },
      { patientCode: 'PAT-1011', fullName: 'Kevin Costner', dob: '1960-01-18', age: 66, gender: 'Male', bloodGroup: 'O+', phone: '+1 555-701-0021', email: 'kevin.c@example.com', address: '99 Yellowstone Trail, Bozeman', emergencyContactName: 'Christine Baumgartner', emergencyContactPhone: '+1 555-701-0022', medicalHistory: 'Hyperlipidemia', allergies: 'Codeine', previousConditions: 'Gout', registrationDate: '2026-03-05', status: 'Active' },
      { patientCode: 'PAT-1012', fullName: 'Lily Potter', dob: '1990-01-30', age: 36, gender: 'Female', bloodGroup: 'B+', phone: '+1 555-701-0023', email: 'lily.p@example.com', address: '4 Privet Drive, Surrey', emergencyContactName: 'James Potter', emergencyContactPhone: '+1 555-701-0024', medicalHistory: 'Iron deficiency anemia', allergies: 'Sulfa', previousConditions: 'None', registrationDate: '2026-03-10', status: 'Active' },
    ]).returning();

    // 5. Rooms and Beds
    const insertedRooms = await db.insert(s.rooms).values([
      { roomNumber: 'ICU-101', roomType: 'ICU', floor: 'Floor 3', dailyRate: '3500.00', totalBeds: 2 },
      { roomNumber: 'ICU-102', roomType: 'ICU', floor: 'Floor 3', dailyRate: '3500.00', totalBeds: 2 },
      { roomNumber: 'GEN-201', roomType: 'General', floor: 'Floor 2', dailyRate: '800.00', totalBeds: 4 },
      { roomNumber: 'GEN-202', roomType: 'General', floor: 'Floor 2', dailyRate: '800.00', totalBeds: 4 },
      { roomNumber: 'PVT-301', roomType: 'Private', floor: 'Floor 4', dailyRate: '2200.00', totalBeds: 1 },
      { roomNumber: 'PVT-302', roomType: 'Private', floor: 'Floor 4', dailyRate: '2200.00', totalBeds: 1 },
      { roomNumber: 'SEMI-401', roomType: 'Semi-private', floor: 'Floor 2', dailyRate: '1400.00', totalBeds: 2 },
      { roomNumber: 'ER-BAY-1', roomType: 'Emergency', floor: 'Ground Floor', dailyRate: '1200.00', totalBeds: 2 },
      { roomNumber: 'OT-1', roomType: 'Operation Theatre', floor: 'Floor 4', dailyRate: '5000.00', totalBeds: 1 },
    ]).returning();

    // Beds
    await db.insert(s.beds).values([
      { bedNumber: 'ICU-101-A', roomId: insertedRooms[0].id, roomNumber: 'ICU-101', roomType: 'ICU', status: 'Occupied', patientId: insertedPatients[2].id, patientName: 'Charles Montgomery', admissionDate: '2026-10-01' },
      { bedNumber: 'ICU-101-B', roomId: insertedRooms[0].id, roomNumber: 'ICU-101', roomType: 'ICU', status: 'Available' },
      { bedNumber: 'ICU-102-A', roomId: insertedRooms[1].id, roomNumber: 'ICU-102', roomType: 'ICU', status: 'Cleaning' },
      { bedNumber: 'ICU-102-B', roomId: insertedRooms[1].id, roomNumber: 'ICU-102', roomType: 'ICU', status: 'Available' },
      { bedNumber: 'GEN-201-1', roomId: insertedRooms[2].id, roomNumber: 'GEN-201', roomType: 'General', status: 'Occupied', patientId: insertedPatients[4].id, patientName: 'Edward Norton', admissionDate: '2026-10-02' },
      { bedNumber: 'GEN-201-2', roomId: insertedRooms[2].id, roomNumber: 'GEN-201', roomType: 'General', status: 'Available' },
      { bedNumber: 'GEN-201-3', roomId: insertedRooms[2].id, roomNumber: 'GEN-201', roomType: 'General', status: 'Available' },
      { bedNumber: 'GEN-201-4', roomId: insertedRooms[2].id, roomNumber: 'GEN-201', roomType: 'General', status: 'Maintenance' },
      { bedNumber: 'PVT-301-A', roomId: insertedRooms[4].id, roomNumber: 'PVT-301', roomType: 'Private', status: 'Occupied', patientId: insertedPatients[0].id, patientName: 'Alexander Hayes', admissionDate: '2026-10-03' },
      { bedNumber: 'PVT-302-A', roomId: insertedRooms[5].id, roomNumber: 'PVT-302', roomType: 'Private', status: 'Available' },
      { bedNumber: 'SEMI-401-A', roomId: insertedRooms[6].id, roomNumber: 'SEMI-401', roomType: 'Semi-private', status: 'Available' },
      { bedNumber: 'SEMI-401-B', roomId: insertedRooms[6].id, roomNumber: 'SEMI-401', roomType: 'Semi-private', status: 'Available' },
    ]);

    // 6. Pharmacy Medicines (20+ items)
    await db.insert(s.medicines).values([
      { medicineCode: 'MED-4001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Apex Pharma', batchNumber: 'APX-2026-01', expiryDate: '2028-05-30', purchasePrice: '1.20', sellingPrice: '3.50', stockQuantity: 450, minStockLevel: 50, locationRack: 'Shelf A-1' },
      { medicineCode: 'MED-4002', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', manufacturer: 'Cipla Global', batchNumber: 'CIP-2025-44', expiryDate: '2027-08-15', purchasePrice: '5.50', sellingPrice: '12.00', stockQuantity: 180, minStockLevel: 40, locationRack: 'Shelf A-2' },
      { medicineCode: 'MED-4003', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', manufacturer: 'Pfizer Labs', batchNumber: 'PFZ-2025-88', expiryDate: '2027-12-01', purchasePrice: '8.00', sellingPrice: '18.50', stockQuantity: 95, minStockLevel: 30, locationRack: 'Shelf B-1' },
      { medicineCode: 'MED-4004', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Sun Pharma', batchNumber: 'SUN-2026-12', expiryDate: '2028-02-28', purchasePrice: '2.50', sellingPrice: '6.00', stockQuantity: 210, minStockLevel: 50, locationRack: 'Shelf B-2' },
      { medicineCode: 'MED-4005', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Antacid / PPI', manufacturer: 'Dr. Reddy Labs', batchNumber: 'DRL-2025-99', expiryDate: '2027-09-30', purchasePrice: '4.00', sellingPrice: '9.00', stockQuantity: 320, minStockLevel: 50, locationRack: 'Shelf C-1' },
      { medicineCode: 'MED-4006', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Lupin Meds', batchNumber: 'LUP-2025-17', expiryDate: '2027-04-20', purchasePrice: '14.00', sellingPrice: '28.00', stockQuantity: 8, minStockLevel: 25, locationRack: 'Shelf A-3' }, // Low stock alert!
      { medicineCode: 'MED-4007', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Cardiovascular', manufacturer: 'Cadila Healthcare', batchNumber: 'CAD-2026-05', expiryDate: '2028-01-15', purchasePrice: '3.00', sellingPrice: '7.50', stockQuantity: 140, minStockLevel: 30, locationRack: 'Shelf B-3' },
      { medicineCode: 'MED-4008', name: 'Salbutamol Inhaler 100mcg', genericName: 'Albuterol', category: 'Respiratory', manufacturer: 'GSK Life', batchNumber: 'GSK-2025-63', expiryDate: '2027-06-30', purchasePrice: '22.00', sellingPrice: '45.00', stockQuantity: 45, minStockLevel: 15, locationRack: 'Shelf D-1' },
      { medicineCode: 'MED-4009', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', manufacturer: 'Torrent Pharma', batchNumber: 'TOR-2025-23', expiryDate: '2026-11-30', purchasePrice: '6.00', sellingPrice: '14.00', stockQuantity: 5, minStockLevel: 20, locationRack: 'Shelf A-4' }, // Low stock!
      { medicineCode: 'MED-4010', name: 'Cetirizine 10mg', genericName: 'Cetirizine Hydrochloride', category: 'Antihistamine', manufacturer: 'Alkem Labs', batchNumber: 'ALK-2026-77', expiryDate: '2028-10-10', purchasePrice: '1.00', sellingPrice: '3.00', stockQuantity: 380, minStockLevel: 40, locationRack: 'Shelf C-2' },
      { medicineCode: 'MED-4011', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', manufacturer: 'AstraZeneca', batchNumber: 'AST-2026-09', expiryDate: '2027-11-20', purchasePrice: '3.50', sellingPrice: '8.00', stockQuantity: 150, minStockLevel: 30, locationRack: 'Shelf C-3' },
      { medicineCode: 'MED-4012', name: 'Insulin Glargine 100IU/ml', genericName: 'Insulin Glargine', category: 'Antidiabetic', manufacturer: 'Sanofi Aventis', batchNumber: 'SAN-2025-82', expiryDate: '2027-03-31', purchasePrice: '120.00', sellingPrice: '210.00', stockQuantity: 28, minStockLevel: 10, locationRack: 'Cold Storage 1' },
      { medicineCode: 'MED-4013', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic / NSAID', manufacturer: 'Abbott Healthcare', batchNumber: 'ABB-2026-31', expiryDate: '2028-06-15', purchasePrice: '2.00', sellingPrice: '5.00', stockQuantity: 290, minStockLevel: 40, locationRack: 'Shelf A-5' },
      { medicineCode: 'MED-4014', name: 'Levothyroxine 50mcg', genericName: 'Levothyroxine Sodium', category: 'Endocrine', manufacturer: 'Merck Health', batchNumber: 'MRC-2026-40', expiryDate: '2028-04-12', purchasePrice: '4.50', sellingPrice: '10.00', stockQuantity: 130, minStockLevel: 25, locationRack: 'Shelf B-4' },
      { medicineCode: 'MED-4015', name: 'Diclofenac Gel 30g', genericName: 'Diclofenac Diethylamine', category: 'Topical Analgesic', manufacturer: 'Novartis', batchNumber: 'NOV-2025-50', expiryDate: '2027-07-25', purchasePrice: '8.50', sellingPrice: '16.00', stockQuantity: 65, minStockLevel: 15, locationRack: 'Shelf D-2' },
    ]);

    // 7. Appointments (Today and upcoming)
    const todayStr = new Date().toISOString().split('T')[0];
    await db.insert(s.appointments).values([
      { appointmentCode: 'APT-2001', patientId: insertedPatients[0].id, patientName: insertedPatients[0].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, department: 'Cardiology', appointmentDate: todayStr, appointmentTime: '09:30', reason: 'Routine cardiology followup and BP check', appointmentType: 'Followup', status: 'In Consultation', notes: 'Patient reports occasional palpitations' },
      { appointmentCode: 'APT-2002', patientId: insertedPatients[1].id, patientName: insertedPatients[1].fullName, doctorId: insertedDoctors[1].id, doctorName: insertedDoctors[1].name, department: 'Neurology', appointmentDate: todayStr, appointmentTime: '10:15', reason: 'Severe recurring migraine with aura', appointmentType: 'Consultation', status: 'Confirmed', notes: 'Scheduled for morning session' },
      { appointmentCode: 'APT-2003', patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, department: 'Cardiology', appointmentDate: todayStr, appointmentTime: '11:00', reason: 'Post-op stent evaluation', appointmentType: 'Specialist Review', status: 'Checked-in', notes: 'Arrived at reception, vitals taken' },
      { appointmentCode: 'APT-2004', patientId: insertedPatients[3].id, patientName: insertedPatients[3].fullName, doctorId: insertedDoctors[4].id, doctorName: insertedDoctors[4].name, department: 'General Medicine', appointmentDate: todayStr, appointmentTime: '11:30', reason: 'Persistent cough and low-grade fever', appointmentType: 'General Checkup', status: 'Pending', notes: '' },
      { appointmentCode: 'APT-2005', patientId: insertedPatients[4].id, patientName: insertedPatients[4].fullName, doctorId: insertedDoctors[2].id, doctorName: insertedDoctors[2].name, department: 'Orthopedics', appointmentDate: todayStr, appointmentTime: '12:00', reason: 'Lower back radiating pain', appointmentType: 'Consultation', status: 'Confirmed', notes: 'MRI films requested' },
      { appointmentCode: 'APT-2006', patientId: insertedPatients[5].id, patientName: insertedPatients[5].fullName, doctorId: insertedDoctors[6].id, doctorName: insertedDoctors[6].name, department: 'Dermatology', appointmentDate: todayStr, appointmentTime: '14:00', reason: 'Allergic skin reaction on forearm', appointmentType: 'Consultation', status: 'Pending', notes: '' },
      { appointmentCode: 'APT-2007', patientId: insertedPatients[6].id, patientName: insertedPatients[6].fullName, doctorId: insertedDoctors[4].id, doctorName: insertedDoctors[4].name, department: 'General Medicine', appointmentDate: todayStr, appointmentTime: '14:30', reason: 'Shortness of breath on mild exertion', appointmentType: 'Consultation', status: 'Pending', notes: '' },
      { appointmentCode: 'APT-2008', patientId: insertedPatients[7].id, patientName: insertedPatients[7].fullName, doctorId: insertedDoctors[3].id, doctorName: insertedDoctors[3].name, department: 'Pediatrics', appointmentDate: todayStr, appointmentTime: '15:00', reason: 'Wellness checkup and vaccine update', appointmentType: 'Vaccination', status: 'Pending', notes: '' },
      { appointmentCode: 'APT-2009', patientId: insertedPatients[8].id, patientName: insertedPatients[8].fullName, doctorId: insertedDoctors[2].id, doctorName: insertedDoctors[2].name, department: 'Orthopedics', appointmentDate: todayStr, appointmentTime: '16:00', reason: 'Right knee joint stiffness', appointmentType: 'Followup', status: 'Pending', notes: '' },
      { appointmentCode: 'APT-2010', patientId: insertedPatients[9].id, patientName: insertedPatients[9].fullName, doctorId: insertedDoctors[4].id, doctorName: insertedDoctors[4].name, department: 'General Medicine', appointmentDate: todayStr, appointmentTime: '16:30', reason: 'Thyroid profile discussion and dosage adjustment', appointmentType: 'Consultation', status: 'Pending', notes: '' },
    ]);

    // 8. Electronic Medical Records & Vital Signs
    await db.insert(s.medicalRecords).values([
      { patientId: insertedPatients[0].id, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, appointmentId: 1, recordDate: todayStr, diagnosis: 'Essential Hypertension, Stage 1', symptoms: 'Occasional mild morning dizziness, throbbing temporal headache', doctorNotes: 'Patient adhering to low-sodium diet. Systolic pressure slightly elevated. Advised home BP monitoring twice weekly.', treatmentPlan: 'Increase Amlodipine to 5mg OD; recommend 30-min brisk walk 5x/week.', bpSystolic: 138, bpDiastolic: 86, heartRate: 74, temperature: '98.4', respiratoryRate: 16, weightKg: '76.50' },
      { patientId: insertedPatients[2].id, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, appointmentId: 3, recordDate: todayStr, diagnosis: 'Stable Ischemic Heart Disease', symptoms: 'Mild exertional dyspnea on climbing 2 flights of stairs', doctorNotes: 'ECG regular sinus rhythm. Chest clear on auscultation. Echocardiogram shows preserved ejection fraction (EF 55%).', treatmentPlan: 'Continue Atorvastatin 20mg and antiplatelet therapy. Repeat lipid profile in 3 months.', bpSystolic: 126, bpDiastolic: 78, heartRate: 68, temperature: '98.6', respiratoryRate: 14, weightKg: '71.20' },
    ]);

    // 9. Prescriptions & Items
    const insertedPrescriptions = await db.insert(s.prescriptions).values([
      { prescriptionCode: 'RX-3001', patientId: insertedPatients[0].id, patientName: insertedPatients[0].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, appointmentId: 1, prescriptionDate: todayStr, diagnosis: 'Essential Hypertension Stage 1', notes: 'Take medicines after food with a full glass of water.', status: 'Pending' },
      { prescriptionCode: 'RX-3002', patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, appointmentId: 3, prescriptionDate: todayStr, diagnosis: 'Hyperlipidemia & Post-PCI Maintenance', notes: 'Strict low cholesterol diet. Avoid abrupt cessation.', status: 'Dispensed' },
    ]).returning();

    await db.insert(s.prescriptionItems).values([
      { prescriptionId: insertedPrescriptions[0].id, medicineName: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take after breakfast', dispensed: 'No' },
      { prescriptionId: insertedPrescriptions[0].id, medicineName: 'Paracetamol', dosage: '500 mg', frequency: 'SOS (as needed)', duration: '5 days', instructions: 'Max 3 tablets in 24 hours for headache', dispensed: 'No' },
      { prescriptionId: insertedPrescriptions[1].id, medicineName: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily (night)', duration: '60 days', instructions: 'Take after dinner', dispensed: 'Yes' },
      { prescriptionId: insertedPrescriptions[1].id, medicineName: 'Pantoprazole', dosage: '40 mg', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take 30 minutes before breakfast', dispensed: 'Yes' },
    ]);

    // 10. Laboratory Tests
    await db.insert(s.laboratoryTests).values([
      { testCode: 'LAB-5001', patientId: insertedPatients[0].id, patientName: insertedPatients[0].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, testName: 'Complete Blood Count (CBC)', testCategory: 'Hematology', requestedDate: todayStr, sampleStatus: 'Completed', result: 'Hb: 14.2 g/dL, WBC: 7,400 /mcL, Platelets: 245,000 /mcL, RBC: 4.8 M/mcL', referenceRange: 'Hb: 13.0-17.0 g/dL | WBC: 4,000-11,000 /mcL | Platelets: 150k-450k', labTechnician: 'Dr. Liam Thorne', reportStatus: 'Completed', notes: 'All hematological parameters within normal clinical limits.', completedDate: todayStr, cost: '350.00' },
      { testCode: 'LAB-5002', patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, testName: 'Comprehensive Lipid Profile', testCategory: 'Biochemistry', requestedDate: todayStr, sampleStatus: 'Completed', result: 'Total Cholesterol: 172 mg/dL, HDL: 46 mg/dL, LDL: 94 mg/dL, Triglycerides: 140 mg/dL', referenceRange: 'Cholesterol < 200 mg/dL | LDL < 100 mg/dL | Triglycerides < 150 mg/dL', labTechnician: 'Dr. Liam Thorne', reportStatus: 'Completed', notes: 'Optimal lipid target achieved under statin therapy.', completedDate: todayStr, cost: '550.00' },
      { testCode: 'LAB-5003', patientId: insertedPatients[1].id, patientName: insertedPatients[1].fullName, doctorId: insertedDoctors[1].id, doctorName: insertedDoctors[1].name, testName: 'Serum Electrolytes & Kidney Function (KFT)', testCategory: 'Biochemistry', requestedDate: todayStr, sampleStatus: 'Processing', result: '', referenceRange: 'Sodium: 135-145 mEq/L | Potassium: 3.5-5.0 mEq/L | Creatinine: 0.7-1.2 mg/dL', labTechnician: 'Dr. Liam Thorne', reportStatus: 'Pending', notes: 'Blood sample received in central lab.', completedDate: '', cost: '480.00' },
      { testCode: 'LAB-5004', patientId: insertedPatients[3].id, patientName: insertedPatients[3].fullName, doctorId: insertedDoctors[4].id, doctorName: insertedDoctors[4].name, testName: 'Chest X-Ray PA View', testCategory: 'Radiology', requestedDate: todayStr, sampleStatus: 'Sample Collected', result: '', referenceRange: 'Normal lung parenchymal markings', labTechnician: 'Kevin White', reportStatus: 'Pending', notes: 'Awaiting imaging scan at radiology bay', completedDate: '', cost: '600.00' },
    ]);

    // 11. Admissions
    await db.insert(s.admissions).values([
      { admissionCode: 'ADM-6001', patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, doctorId: insertedDoctors[0].id, doctorName: insertedDoctors[0].name, roomId: insertedRooms[0].id, bedId: 1, bedNumber: 'ICU-101-A', admissionDate: '2026-10-01', reason: 'Post-cardiac intervention observation', diagnosis: 'Coronary Stent Surveillance', notes: 'Telemetry monitoring active. Vitals steady.', status: 'Admitted' },
      { admissionCode: 'ADM-6002', patientId: insertedPatients[4].id, patientName: insertedPatients[4].fullName, doctorId: insertedDoctors[2].id, doctorName: insertedDoctors[2].name, roomId: insertedRooms[2].id, bedId: 5, bedNumber: 'GEN-201-1', admissionDate: '2026-10-02', reason: 'Acute Lumbar Disc Herniation and Pain Management', diagnosis: 'L4-L5 Radiculopathy', notes: 'Physical therapy started. Epidural analgesia given.', status: 'Admitted' },
    ]);

    // 12. Bills & Invoices
    const insertedBills = await db.insert(s.bills).values([
      { billCode: 'INV-7001', patientId: insertedPatients[0].id, patientName: insertedPatients[0].fullName, consultationCharges: '800.00', roomCharges: '0.00', doctorCharges: '0.00', labCharges: '350.00', pharmacyCharges: '110.00', procedureCharges: '0.00', otherCharges: '50.00', subtotal: '1310.00', discount: '100.00', taxAmount: '60.50', grandTotal: '1270.50', paidAmount: '1270.50', status: 'Paid', billDate: todayStr, dueDate: todayStr, notes: 'Paid in full via UPI' },
      { billCode: 'INV-7002', patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, consultationCharges: '800.00', roomCharges: '7000.00', doctorCharges: '2500.00', labCharges: '550.00', pharmacyCharges: '320.00', procedureCharges: '1500.00', otherCharges: '150.00', subtotal: '12820.00', discount: '500.00', taxAmount: '616.00', grandTotal: '12936.00', paidAmount: '5000.00', status: 'Partially Paid', billDate: todayStr, dueDate: todayStr, notes: 'Initial deposit paid by family' },
      { billCode: 'INV-7003', patientId: insertedPatients[1].id, patientName: insertedPatients[1].fullName, consultationCharges: '1000.00', roomCharges: '0.00', doctorCharges: '0.00', labCharges: '480.00', pharmacyCharges: '0.00', procedureCharges: '0.00', otherCharges: '20.00', subtotal: '1500.00', discount: '0.00', taxAmount: '75.00', grandTotal: '1575.00', paidAmount: '0.00', status: 'Pending', billDate: todayStr, dueDate: todayStr, notes: 'Pending payment at billing counter' },
    ]).returning();

    // Bill line items
    await db.insert(s.billItems).values([
      { billId: insertedBills[0].id, itemDescription: 'Cardiology Specialist Consultation (Dr. Sarah Mitchell)', category: 'Consultation', quantity: 1, unitPrice: '800.00', totalAmount: '800.00' },
      { billId: insertedBills[0].id, itemDescription: 'Complete Blood Count (CBC) Automated', category: 'Lab', quantity: 1, unitPrice: '350.00', totalAmount: '350.00' },
      { billId: insertedBills[0].id, itemDescription: 'Medications (Amlodipine + Paracetamol)', category: 'Medicine', quantity: 1, unitPrice: '110.00', totalAmount: '110.00' },
      { billId: insertedBills[0].id, itemDescription: 'Hospital Registration & Administrative Fee', category: 'Other', quantity: 1, unitPrice: '50.00', totalAmount: '50.00' },
    ]);

    // 13. Payments
    await db.insert(s.payments).values([
      { paymentCode: 'PAY-8001', billId: insertedBills[0].id, patientId: insertedPatients[0].id, patientName: insertedPatients[0].fullName, amount: '1270.50', paymentMethod: 'UPI', paymentStatus: 'Successful', transactionReference: 'UPI-TXN-98421044', paymentDate: todayStr, receiptUrl: '/receipts/PAY-8001.pdf' },
      { paymentCode: 'PAY-8002', billId: insertedBills[1].id, patientId: insertedPatients[2].id, patientName: insertedPatients[2].fullName, amount: '5000.00', paymentMethod: 'Credit Card', paymentStatus: 'Successful', transactionReference: 'CC-AUTH-884129', paymentDate: todayStr, receiptUrl: '/receipts/PAY-8002.pdf' },
    ]);

    // 14. Emergency Department
    await db.insert(s.emergencies).values([
      { emergencyCode: 'EMG-9001', patientName: 'Arthur Dent', age: 42, gender: 'Male', priority: 'Critical', assignedDoctor: 'Dr. Amanda Brooks', roomBed: 'ER Trauma Bay 1', arrivalTime: '08:45 AM', status: 'In Treatment', conditionNotes: 'Blunt trauma chest wall following road accident. SpO2 91%. Fast scan in progress.' },
      { emergencyCode: 'EMG-9002', patientName: 'Maria Santos', age: 29, gender: 'Female', priority: 'High', assignedDoctor: 'Dr. Amanda Brooks', roomBed: 'ER Bay 2', arrivalTime: '09:20 AM', status: 'Triaged', conditionNotes: 'Severe acute right lower quadrant abdominal pain with fever. Suspected acute appendicitis.' },
      { emergencyCode: 'EMG-9003', patientName: 'Robert Vance', age: 58, gender: 'Male', priority: 'Medium', assignedDoctor: 'Dr. Rajesh Sharma', roomBed: 'ER Bay 3', arrivalTime: '09:55 AM', status: 'Stabilized', conditionNotes: 'Uncontrolled hyperglycemia (Blood sugar 380 mg/dL). IV fluids and insulin administered.' },
    ]);

    // 15. Notifications
    await db.insert(s.notifications).values([
      { title: 'New Emergency Admission', message: 'Trauma case received at ER Bay 1 under Dr. Amanda Brooks.', type: 'urgent', roleTarget: 'all', isRead: 'no' },
      { title: 'Low Inventory Alert', message: 'Azithromycin 500mg has reached 8 units (Threshold: 25 units). Please restock.', type: 'warning', roleTarget: 'pharmacist', isRead: 'no' },
      { title: 'Lab Report Finalized', message: 'Complete Blood Count (CBC) report ready for Alexander Hayes (PAT-1001).', type: 'success', roleTarget: 'doctor', isRead: 'no' },
      { title: 'ICU Bed Occupancy Notice', message: 'ICU Bed 101-A allocated to patient Charles Montgomery.', type: 'info', roleTarget: 'nurse', isRead: 'no' },
    ]);

    // 16. Audit Logs
    await db.insert(s.auditLogs).values([
      { userName: 'Dr. Sarah Mitchell', userRole: 'doctor', action: 'CREATE_PRESCRIPTION', module: 'Prescriptions', recordId: 'RX-3001', details: 'Prescribed Amlodipine 5mg and Paracetamol 500mg for Alexander Hayes' },
      { userName: 'Elena Rostova', userRole: 'receptionist', action: 'PATIENT_REGISTRATION', module: 'Patients', recordId: 'PAT-1012', details: 'Registered new patient Lily Potter' },
      { userName: 'Samantha Sterling', userRole: 'accountant', action: 'PAYMENT_PROCESSED', module: 'Billing', recordId: 'PAY-8001', details: 'Recorded UPI payment of $1,270.50 for Invoice INV-7001' },
      { userName: 'Dr. Liam Thorne', userRole: 'lab_technician', action: 'REPORT_VERIFIED', module: 'Laboratory', recordId: 'LAB-5001', details: 'Signed off CBC report for Alexander Hayes' },
    ]);

    console.log('Database seeded successfully with comprehensive production data!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
