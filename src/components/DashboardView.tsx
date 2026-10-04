import React from 'react';
import {
  Users,
  Stethoscope,
  CalendarCheck2,
  BedDouble,
  Pill,
  FlaskConical,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { DashboardMetrics, Appointment, Patient, Bill, EmergencyCase, Medicine, UserRole } from '../types/hms.ts';
import { NavTab } from './Sidebar.tsx';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  recentAppointments: Appointment[];
  recentPatients: Patient[];
  recentBills: Bill[];
  recentEmergencies: EmergencyCase[];
  lowStockMedicines: Medicine[];
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
  onOpenConsultation?: (apt: Appointment) => void;
  onCheckInAppointment?: (aptId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentAppointments,
  recentPatients,
  recentBills,
  recentEmergencies,
  lowStockMedicines,
  currentRole,
  onNavigate,
  onOpenConsultation,
  onCheckInAppointment,
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded">
              Live Clinical Node
            </span>
            <span className="text-xs text-slate-400">PostgreSQL Cloud Database</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">CarePulse Hospital Operations Center</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time inpatient beds, diagnostic labs, clinical consultations, and pharmacy inventory.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['admin', 'receptionist', 'super_admin'].includes(currentRole) && (
            <button
              onClick={() => onNavigate('patients')}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('appointments')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <CalendarCheck2 className="w-4 h-4 text-teal-400" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Triage</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalPatients}</span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> EMR Active
            </span>
          </div>
        </div>

        {/* Today's Appointments */}
        <div
          onClick={() => onNavigate('appointments')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.todayAppointments}</span>
            <span className="text-[11px] font-medium text-indigo-600">
              {metrics.completedAppointments} Done / {metrics.pendingAppointments} Pending
            </span>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div
          onClick={() => onNavigate('rooms')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bed Occupancy Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{metrics.occupancyRate}%</span>
            <span className="text-[11px] font-medium text-slate-600">
              {metrics.occupiedBeds}/{metrics.totalBeds} Inpatients
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                metrics.occupancyRate > 80 ? 'bg-rose-500' : metrics.occupancyRate > 50 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(100, metrics.occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Revenue Today */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">${metrics.todayRevenue.toLocaleString()}</span>
            <span className="text-[11px] font-medium text-slate-500">
              ${metrics.totalRevenue.toLocaleString()} Total
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Emergency Cases</p>
            <p className="text-sm font-bold text-slate-900">{metrics.emergencyCount} Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-l border-slate-200">
          <FlaskConical className="w-4 h-4 text-cyan-600" />
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Pending Lab Orders</p>
            <p className="text-sm font-bold text-slate-900">{metrics.pendingLabCount} Tests</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-l border-slate-200">
          <Pill className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Low Stock Alerts</p>
            <p className="text-sm font-bold text-amber-700">{metrics.lowStockCount} Medicines</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-l border-slate-200">
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <div>
            <p className="text-[11px] text-slate-500 font-medium">On-Duty Doctors</p>
            <p className="text-sm font-bold text-slate-900">{metrics.totalDoctors} Specialists</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Appointments + Emergency Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-900">Recent OPD Appointments</h2>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No appointments scheduled for today</div>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {apt.appointmentTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900">{apt.patientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({apt.appointmentCode})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {apt.doctorName} • <span className="text-teal-700 font-medium">{apt.department}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{apt.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'In Consultation'
                          ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                          : apt.status === 'Checked-in'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>

                    {/* Quick action button based on appointment status */}
                    {apt.status === 'Confirmed' && onCheckInAppointment && (
                      <button
                        onClick={() => onCheckInAppointment(apt.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        Check-in
                      </button>
                    )}

                    {['doctor', 'admin', 'super_admin'].includes(currentRole) && apt.status !== 'Completed' && onOpenConsultation && (
                      <button
                        onClick={() => onOpenConsultation(apt)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-teal-600 text-white rounded hover:bg-teal-500 transition-colors"
                      >
                        Consult
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Emergency Trauma Monitor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-semibold text-slate-900">Emergency Trauma Deck</h2>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded">
              24/7 ACTIVE
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3">
            {recentEmergencies.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No active trauma cases in triage</div>
            ) : (
              recentEmergencies.map((emg) => (
                <div
                  key={emg.id}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    emg.priority === 'Critical'
                      ? 'bg-rose-50/70 border-rose-200'
                      : emg.priority === 'High'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{emg.patientName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        emg.priority === 'Critical'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : emg.priority === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {emg.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-2">{emg.conditionNotes}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{emg.roomBed}</span>
                    <span className="font-semibold text-slate-700">{emg.assignedDoctor}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigate('emergency')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Open Full Emergency Console →
            </button>
          </div>
        </div>
      </div>

      {/* Lower Row: Low-Stock Inventory Warnings & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pharmacy Low-Stock Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-semibold text-slate-900">Pharmacy Inventory Alerts</h2>
            </div>
            <button
              onClick={() => onNavigate('pharmacy')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Manage Pharmacy →
            </button>
          </div>

          <div className="p-4">
            {lowStockMedicines.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-600 font-medium">
                ✓ All pharmacy medications meet stock requirements
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockMedicines.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/60 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-slate-500">{med.genericName} • {med.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900">
                        {med.stockQuantity} Left
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Min: {med.minStockLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices / Payments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Invoices & Cashflow</h2>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Billing Center →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentBills.map((bill) => (
              <div key={bill.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{bill.patientName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({bill.billCode})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{bill.billDate}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">${parseFloat(bill.grandTotal).toFixed(2)}</span>
                  <div className="mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        bill.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.status === 'Partially Paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
