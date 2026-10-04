import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  CreditCard,
  Building2,
  UserCog,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  LogOut,
  Hospital,
} from 'lucide-react';
import { UserRole } from '../types/hms.ts';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'records'
  | 'prescriptions'
  | 'pharmacy'
  | 'laboratory'
  | 'rooms'
  | 'admissions'
  | 'billing'
  | 'emergency'
  | 'staff'
  | 'departments'
  | 'reports'
  | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onTabSelect: (tab: NavTab) => void;
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient', 'accountant'],
  },
  {
    id: 'patients',
    label: 'Patients Management',
    icon: Users,
    roles: ['super_admin', 'admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    id: 'doctors',
    label: 'Doctors & Specialists',
    icon: Stethoscope,
    roles: ['super_admin', 'admin', 'receptionist', 'patient', 'doctor', 'nurse'],
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: CalendarDays,
    roles: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient', 'nurse'],
  },
  {
    id: 'records',
    label: 'Medical Records (EMR)',
    icon: FileText,
    roles: ['super_admin', 'admin', 'doctor', 'nurse', 'patient'],
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: ClipboardList,
    roles: ['super_admin', 'admin', 'doctor', 'pharmacist', 'patient', 'nurse'],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy & Stock',
    icon: Pill,
    roles: ['super_admin', 'admin', 'pharmacist', 'doctor'],
  },
  {
    id: 'laboratory',
    label: 'Laboratory Tests',
    icon: FlaskConical,
    roles: ['super_admin', 'admin', 'lab_technician', 'doctor', 'patient', 'nurse'],
  },
  {
    id: 'rooms',
    label: 'Rooms & Beds',
    icon: BedDouble,
    roles: ['super_admin', 'admin', 'nurse', 'receptionist', 'doctor'],
  },
  {
    id: 'admissions',
    label: 'Admissions & Discharge',
    icon: Hospital,
    roles: ['super_admin', 'admin', 'receptionist', 'nurse'],
  },
  {
    id: 'billing',
    label: 'Billing & Payments',
    icon: Receipt,
    roles: ['super_admin', 'admin', 'accountant', 'receptionist', 'patient'],
  },
  {
    id: 'emergency',
    label: 'Emergency Desk',
    icon: AlertTriangle,
    roles: ['super_admin', 'admin', 'doctor', 'nurse', 'receptionist'],
    badge: '24/7',
  },
  {
    id: 'staff',
    label: 'Staff Management',
    icon: UserCog,
    roles: ['super_admin', 'admin'],
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: Building2,
    roles: ['super_admin', 'admin', 'doctor'],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    roles: ['super_admin', 'admin', 'accountant'],
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabSelect,
  currentRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Filter items visible to current user's role
  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">CLINICAL PORTAL</h2>
            <p className="text-[11px] text-slate-400 capitalize">{currentRole.replace('_', ' ')} Space</p>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabSelect(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-xs shadow-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Connected: PostgreSQL</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-800">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
