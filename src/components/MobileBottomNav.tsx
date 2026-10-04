import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  BedDouble,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { UserRole } from '../types/hms.ts';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onTabSelect: (tab: NavTab) => void;
  currentRole: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabSelect,
  currentRole,
}) => {
  // Mobile quick links tailored to role
  const getTabs = () => {
    if (currentRole === 'patient') {
      return [
        { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
        { id: 'appointments' as NavTab, label: 'Appts', icon: CalendarDays },
        { id: 'prescriptions' as NavTab, label: 'Rx', icon: ClipboardList },
        { id: 'billing' as NavTab, label: 'Bills', icon: Receipt },
      ];
    }
    if (currentRole === 'doctor') {
      return [
        { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
        { id: 'appointments' as NavTab, label: 'Appts', icon: CalendarDays },
        { id: 'patients' as NavTab, label: 'Patients', icon: Users },
        { id: 'prescriptions' as NavTab, label: 'Rx', icon: ClipboardList },
        { id: 'emergency' as NavTab, label: 'ER', icon: AlertTriangle },
      ];
    }
    return [
      { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
      { id: 'patients' as NavTab, label: 'Patients', icon: Users },
      { id: 'appointments' as NavTab, label: 'Appts', icon: CalendarDays },
      { id: 'rooms' as NavTab, label: 'Beds', icon: BedDouble },
      { id: 'emergency' as NavTab, label: 'ER', icon: AlertTriangle },
    ];
  };

  const tabs = getTabs();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
