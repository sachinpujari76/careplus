import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Menu,
  X,
  UserCheck,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  LogIn,
  LogOut,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { UserRole, NotificationItem, UserProfile } from '../types/hms.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut } from 'firebase/auth';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onRoleChange: (role: UserRole) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number) => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenEmergency: () => void;
}

const ROLES: { id: UserRole; label: string; badge: string; desc: string }[] = [
  { id: 'admin', label: 'Admin', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', desc: 'Full Hospital Operations' },
  { id: 'super_admin', label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 border-purple-200', desc: 'System & Executive Control' },
  { id: 'doctor', label: 'Doctor', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Clinical & Prescriptions' },
  { id: 'nurse', label: 'Nurse', badge: 'bg-teal-100 text-teal-800 border-teal-200', desc: 'Inpatient & Vital Signs' },
  { id: 'receptionist', label: 'Receptionist', badge: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Check-in & Booking' },
  { id: 'pharmacist', label: 'Pharmacist', badge: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Dispensary & Stock' },
  { id: 'lab_technician', label: 'Lab Tech', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', desc: 'Diagnostic Tests' },
  { id: 'patient', label: 'Patient', badge: 'bg-rose-100 text-rose-800 border-rose-200', desc: 'Appointments & Bills' },
  { id: 'accountant', label: 'Accountant', badge: 'bg-slate-100 text-slate-800 border-slate-200', desc: 'Billing & Invoices' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onOpenMobileMenu,
  isMobileMenuOpen,
  onOpenEmergency,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const unreadCount = notifications.filter((n) => n.isRead === 'no').length;

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const user = cred.user;
      const token = await user.getIdToken();
      onRoleChange('doctor'); // default authenticated user to doctor / admin
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onRoleChange('patient');
  };

  const currentRoleInfo = ROLES.find((r) => r.id === currentRole) || ROLES[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">CarePulse HMS</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    PROD v2.4
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Hospital Management & Clinical System</p>
              </div>
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>ER Trauma Desk</span>
            </button>

            {/* Role Switcher Pill / Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-normal hidden md:inline">Role:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${currentRoleInfo.badge}`}>
                    {currentRoleInfo.label}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Switch Demo Persona</p>
                    <p className="text-[11px] text-slate-500">Test role-based permissions immediately</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onRoleChange(r.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors ${
                          currentRole === r.id ? 'bg-teal-50/70 font-semibold' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium">{r.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${r.badge}`}>
                              {r.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{r.desc}</span>
                        </div>
                        {currentRole === r.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowRoleDropdown(false);
                }}
                className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Hospital Alerts & Updates</span>
                    <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">No notifications at this time</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            n.isRead === 'no' ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`w-2 h-2 mt-1 rounded-full shrink-0 ${
                                n.type === 'urgent'
                                  ? 'bg-rose-500'
                                  : n.type === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-teal-500'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User / Google Sign-In */}
            <div className="hidden sm:flex items-center pl-2 border-l border-slate-200">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Auth</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
