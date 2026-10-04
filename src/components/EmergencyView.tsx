import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserPlus,
  Stethoscope,
  BedDouble,
  CheckCircle,
  X,
  Activity,
} from 'lucide-react';
import { EmergencyCase, Doctor, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface EmergencyViewProps {
  emergencies: EmergencyCase[];
  doctors: Doctor[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  emergencies,
  doctors,
  currentRole,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    age: '35',
    gender: 'Male',
    priority: 'Critical' as 'Critical' | 'High' | 'Medium' | 'Low',
    assignedDoctor: 'Dr. Amanda Brooks',
    roomBed: 'ER Trauma Bay 1',
    conditionNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.updateEmergencyStatus(id, status);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update emergency status');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEmergency(form);
      setShowAddModal(false);
      onRefresh();
      setForm({
        patientName: '',
        age: '35',
        gender: 'Male',
        priority: 'Critical',
        assignedDoctor: 'Dr. Amanda Brooks',
        roomBed: 'ER Trauma Bay 1',
        conditionNotes: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to register emergency');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-600 text-white animate-pulse';
      case 'High':
        return 'bg-amber-600 text-white';
      case 'Medium':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Emergency & Acute Trauma Care Deck</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
              24/7 LEVEL-1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Rapid triage assessment, on-duty trauma physicians, and immediate resuscitation bays</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>New Emergency Arrival</span>
        </button>
      </div>

      {/* Grid of Emergency Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencies.map((emg) => (
          <div
            key={emg.id}
            className={`p-5 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
              emg.priority === 'Critical'
                ? 'bg-rose-50/50 border-rose-200'
                : emg.priority === 'High'
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-mono font-bold text-xs text-slate-900">{emg.emergencyCode}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(emg.priority)}`}>
                  {emg.priority} PRIORITY
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-base text-slate-900">{emg.patientName}</h3>
                <p className="text-xs text-slate-500">
                  {emg.age} Yrs • {emg.gender} • Arrived at {emg.arrivalTime}
                </p>
              </div>

              <div className="mt-3 p-3 bg-white/80 rounded-lg border border-slate-200/80 text-xs">
                <p className="text-slate-700 leading-relaxed font-medium">{emg.conditionNotes}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Bay: <strong className="text-slate-900">{emg.roomBed}</strong></span>
                  <span>MD: <strong className="text-slate-900">{emg.assignedDoctor}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Status: <strong className="text-teal-700">{emg.status}</strong></span>
              <div className="flex items-center gap-1.5">
                {emg.status === 'Triaged' && (
                  <button
                    onClick={() => handleStatusChange(emg.id, 'In Treatment')}
                    className="px-2 py-1 text-[11px] font-medium bg-indigo-600 text-white rounded hover:bg-indigo-500"
                  >
                    Start Treatment
                  </button>
                )}
                {emg.status === 'In Treatment' && (
                  <button
                    onClick={() => handleStatusChange(emg.id, 'Stabilized')}
                    className="px-2 py-1 text-[11px] font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500"
                  >
                    Stabilize
                  </button>
                )}
                {emg.status === 'Stabilized' && (
                  <button
                    onClick={() => handleStatusChange(emg.id, 'Admitted')}
                    className="px-2 py-1 text-[11px] font-medium bg-teal-600 text-white rounded hover:bg-teal-500"
                  >
                    Transfer to Ward
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Intake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Emergency Room Patient Triage Intake
            </h2>
            <p className="text-xs text-slate-500 mb-4">Immediate recording of incoming acute trauma or emergency case.</p>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Patient name or Unknown Trauma Victim"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Triage Priority *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-lg text-xs font-bold text-rose-900"
                  >
                    <option value="Critical">Critical (Immediate Resuscitation)</option>
                    <option value="High">High (Urgent - &lt;15 min)</option>
                    <option value="Medium">Medium (Semi-Urgent)</option>
                    <option value="Low">Low (Non-Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned ER Bay</label>
                  <input
                    type="text"
                    value={form.roomBed}
                    onChange={(e) => setForm({ ...form, roomBed: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">On-Duty Emergency Physician</label>
                <select
                  value={form.assignedDoctor}
                  onChange={(e) => setForm({ ...form, assignedDoctor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Dr. Amanda Brooks">Dr. Amanda Brooks (Trauma Lead)</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Presenting Condition & Vitals Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe mechanism of injury, Glasgow Coma Scale, oxygen saturation, bleeding..."
                  value={form.conditionNotes}
                  onChange={(e) => setForm({ ...form, conditionNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {submitting ? 'Admitting...' : 'Alert ER Team & Admit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
