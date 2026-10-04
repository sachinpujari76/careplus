import React from 'react';
import {
  Building2,
  MapPin,
  UserCheck,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { Department } from '../types/hms.ts';

interface DepartmentsViewProps {
  departments: Department[];
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ departments }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hospital Clinical Departments & Centers of Excellence</h1>
        <p className="text-xs text-slate-500 mt-0.5">Specialized medical units, division directors, and hospital floor maps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{dept.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Head: <strong className="text-slate-800">{dept.headDoctor || 'Dr. Department Lead'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{dept.location || 'Main Hospital Wing'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
