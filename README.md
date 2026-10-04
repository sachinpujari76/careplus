# CarePulse Hospital Management System (HMS)

A complete, full-stack, enterprise-style Hospital Management System designed for hospital operations, clinical consultations, electronic medical records (EMR), pharmacy dispensaries, diagnostic laboratories, inpatient bed management, and online payment processing.

---

## Key Modules & Features

1. **Role-Based Access Control (RBAC)**:
   - Dedicated access workflows for **Super Admin, Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, Patient, and Accountant**.
   - Instant live demo switcher and Firebase Google OAuth.
2. **Patient Management & EMR**:
   - Automated Patient Code (`PAT-1001`) generation.
   - Clinical dossier with medical history, allergy alerts, vital signs tracking (BP, Pulse, Temperature, Respiratory Rate, Weight).
3. **Outpatient Appointments & Scheduling**:
   - Double-booking prevention algorithm.
   - Real-time pipeline: *Pending → Confirmed → Checked-in → In Consultation → Completed*.
4. **Physician Clinical Consultation Desk**:
   - Clinical diagnosis, symptoms, clinical notes, treatment plan.
   - Built-in e-prescribing and diagnostic lab order dispatch.
5. **Digital Prescriptions (Rx)**:
   - Formal formatted prescription slip with verification token and physician signature.
   - Pharmacist one-click dispensing with automatic formulary inventory reduction.
6. **Pharmacy Formulary & Inventory**:
   - Stock level tracking, batch numbers, manufacturer info, expiry alert dates.
   - Low-stock warnings and restock batching.
7. **Pathology & Diagnostic Laboratory**:
   - Automated sample chain-of-custody: *Requested → Sample Collected → Processing → Completed*.
   - Quantitative analyzer findings, biological reference intervals, pathologist sign-off, printable certified report.
8. **Rooms & Inpatient Bed Allocation**:
   - Interactive visual bed matrix (ICU, General Ward, Semi-Private, Private, Emergency, OT).
   - Dynamic statuses: *Available (Emerald), Occupied (Rose), Reserved (Blue), Cleaning (Amber), Maintenance (Slate)*.
   - Inpatient admission and discharge summary generation.
9. **Emergency & Acute Trauma Care Deck**:
   - 24/7 Level-1 triage desk with priority indicators (*Critical, High, Medium, Low*).
   - Trauma bay allocation and emergency on-duty physician assignments.
10. **Billing, Invoices & Online Payments**:
    - Automatic calculation: *Consultation + Bed/Room + Lab + Pharmacy + Procedures + 5% GST/Tax - Institutional Discount*.
    - Online Payment Gateway support: **UPI (Google Pay, PhonePe, Paytm, QR), Credit/Debit Cards, Net Banking, and Hospital Counter Cash**.
11. **Security, Compliance & Audit Trail**:
    - Immutable operational audit log of every medical record edit, patient admission, prescription, and financial transaction.
12. **Mobile-First Responsive Interface**:
    - Touch-optimized drawer navigation, bottom navigation bar, and responsive modals.

---

## Technical Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express.js REST API (`server.ts`).
- **Database**: Cloud SQL / PostgreSQL managed relational database.
- **ORM & Migrations**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **Authentication**: Firebase Authentication & Role-Based Session Tokens.

---

## Beginner-Friendly Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database connection credentials (`SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD`) are present.

### 3. Create & Apply Database Schema
Generate and push tables into PostgreSQL using Drizzle Kit:
```bash
npx drizzle-kit push
```

### 4. Start the Full-Stack Application
```bash
npm run dev
```
The server will boot on port `3000` with the Vite frontend mounted seamlessly on Express. Initial mock clinical data (20+ patients, 12 doctors, 20+ medicines, rooms, beds, appointments) will seed automatically if the database is fresh.

### 5. Testing Role Workflows
Use the **Role** pill dropdown in the top navigation bar to test any role instantly:
- **Doctor**: Click *Consultation Room* on checked-in appointments to document vitals, diagnose, issue prescriptions, and order lab tests.
- **Pharmacist**: View incoming prescriptions in the *Prescriptions* tab and click *Dispense Rx* to deduct stock.
- **Lab Technician**: Open *Laboratory Tests* to collect samples, enter numerical findings, and sign off certified reports.
- **Receptionist**: Open *Patients* to register new patients and *Appointments* to check in arriving visitors.
- **Accountant**: Navigate to *Billing & Payments* to issue invoices and process online UPI/Card payments.
