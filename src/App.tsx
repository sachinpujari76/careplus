import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PatientsView } from './components/PatientsView.tsx';
import { AppointmentsView } from './components/AppointmentsView.tsx';
import { DoctorConsultationModal } from './components/DoctorConsultationModal.tsx';
import { PrescriptionsView } from './components/PrescriptionsView.tsx';
import { PharmacyView } from './components/PharmacyView.tsx';
import { LaboratoryView } from './components/LaboratoryView.tsx';
import { RoomsView } from './components/RoomsView.tsx';
import { BillingView } from './components/BillingView.tsx';
import { EmergencyView } from './components/EmergencyView.tsx';
import { DoctorsView } from './components/DoctorsView.tsx';
import { StaffView } from './components/StaffView.tsx';
import { DepartmentsView } from './components/DepartmentsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';

import {
  UserRole,
  UserProfile,
  DashboardMetrics,
  Patient,
  Doctor,
  Department,
  Appointment,
  Prescription,
  Medicine,
  LaboratoryTest,
  Room,
  Bed,
  Bill,
  Payment,
  EmergencyCase,
  StaffMember,
  NotificationItem,
} from './types/hms.ts';
import { api } from './services/api.ts';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(api.getRole() || 'admin');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(api.getUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data States
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<EmergencyCase[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labTests, setLabTests] = useState<LaboratoryTest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Active consultation modal
  const [activeConsultationApt, setActiveConsultationApt] = useState<Appointment | null>(null);

  // Load Dashboard Data
  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      if (data) {
        setMetrics(data.metrics);
        setRecentAppointments(data.recentAppointments || []);
        setRecentPatients(data.recentPatients || []);
        setRecentBills(data.recentBills || []);
        setRecentEmergencies(data.recentEmergencies || []);
        setLowStockMedicines(data.lowStockMedicines || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, []);

  // Comprehensive Refresh
  const refreshAll = useCallback(async () => {
    loadDashboard();
    api.getPatients().then(setPatients).catch(console.error);
    api.getDoctors().then(setDoctors).catch(console.error);
    api.getDepartments().then(setDepartments).catch(console.error);
    api.getAppointments().then(setAppointments).catch(console.error);
    api.getPrescriptions().then(setPrescriptions).catch(console.error);
    api.getMedicines().then(setMedicines).catch(console.error);
    api.getLaboratoryTests().then(setLabTests).catch(console.error);
    api.getRooms().then(setRooms).catch(console.error);
    api.getBeds().then(setBeds).catch(console.error);
    api.getBills().then(setBills).catch(console.error);
    api.getPayments().then(setPayments).catch(console.error);
    api.getEmergencies().then(setEmergencies).catch(console.error);
    api.getStaff().then(setStaff).catch(console.error);
    api.getNotifications().then(setNotifications).catch(console.error);
  }, [loadDashboard]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Handle Role Switch
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    try {
      const res = await api.switchDemoRole(newRole);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
    // Set appropriate landing tab
    if (newRole === 'patient') setCurrentTab('dashboard');
    else if (newRole === 'pharmacist') setCurrentTab('pharmacy');
    else if (newRole === 'lab_technician') setCurrentTab('laboratory');
    else if (newRole === 'accountant') setCurrentTab('billing');
    else setCurrentTab('dashboard');

    refreshAll();
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: 'yes' } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async (aptId: number) => {
    try {
      await api.updateAppointmentStatus(aptId, 'Checked-in');
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenEmergency={() => setCurrentTab('emergency')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          currentTab={currentTab}
          onTabSelect={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          currentRole={currentRole}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentAppointments={recentAppointments}
              recentPatients={recentPatients}
              recentBills={recentBills}
              recentEmergencies={recentEmergencies}
              lowStockMedicines={lowStockMedicines}
              currentRole={currentRole}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenConsultation={(apt) => setActiveConsultationApt(apt)}
              onCheckInAppointment={handleCheckIn}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              patients={patients}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'doctors' && (
            <DoctorsView
              doctors={doctors}
              departments={departments}
              currentRole={currentRole}
              onRefresh={refreshAll}
              onBookWithDoctor={(doc) => {
                setCurrentTab('appointments');
              }}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              doctors={doctors}
              patients={patients}
              currentRole={currentRole}
              onRefresh={refreshAll}
              onOpenConsultation={(apt) => setActiveConsultationApt(apt)}
            />
          )}

          {currentTab === 'prescriptions' && (
            <PrescriptionsView
              prescriptions={prescriptions}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'pharmacy' && (
            <PharmacyView
              medicines={medicines}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'laboratory' && (
            <LaboratoryView
              tests={labTests}
              doctors={doctors}
              patients={patients}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'rooms' && (
            <RoomsView
              rooms={rooms}
              beds={beds}
              patients={patients}
              doctors={doctors}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'admissions' && (
            <RoomsView
              rooms={rooms}
              beds={beds}
              patients={patients}
              doctors={doctors}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              bills={bills}
              patients={patients}
              payments={payments}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'emergency' && (
            <EmergencyView
              emergencies={emergencies}
              doctors={doctors}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'staff' && (
            <StaffView
              staff={staff}
              currentRole={currentRole}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsView departments={departments} />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'audit' && (
            <AuditLogsView />
          )}

          {currentTab === 'records' && (
            <PatientsView
              patients={patients}
              onRefresh={refreshAll}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabSelect={(tab) => setCurrentTab(tab)}
        currentRole={currentRole}
      />

      {/* Doctor Clinical Consultation Modal */}
      {activeConsultationApt && (
        <DoctorConsultationModal
          appointment={activeConsultationApt}
          onClose={() => setActiveConsultationApt(null)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  );
}
