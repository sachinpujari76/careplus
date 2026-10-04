import React, { useState } from 'react';
import {
  BedDouble,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Wrench,
  UserPlus,
  UserMinus,
  X,
  FileCheck,
  Building,
} from 'lucide-react';
import { Room, Bed, Patient, Doctor, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface RoomsViewProps {
  rooms: Room[];
  beds: Bed[];
  patients: Patient[];
  doctors: Doctor[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  beds,
  patients,
  doctors,
  currentRole,
  onRefresh,
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<Bed | null>(null);
  const [selectedBedForDischarge, setSelectedBedForDischarge] = useState<Bed | null>(null);

  // Admission Form
  const [admissionForm, setAdmissionForm] = useState({
    patientId: '',
    doctorId: '',
    reason: '',
    diagnosis: '',
    notes: '',
  });
  const [admitting, setAdmitting] = useState(false);

  // Discharge Form
  const [dischargeForm, setDischargeForm] = useState({
    finalDiagnosis: '',
    treatmentSummary: 'Patient responded favorably to inpatient medical management. Vitals stable.',
    followUpInstructions: 'Review in OPD after 7 days with repeat CBC. Strict compliance with medications.',
    doctorNotes: '',
  });
  const [discharging, setDischarging] = useState(false);

  const roomTypes = Array.from(new Set(rooms.map((r) => r.roomType)));

  const filteredRooms = rooms.filter((r) => {
    return selectedType === 'all' || r.roomType === selectedType;
  });

  const handleBedStatusUpdate = async (bedId: number, status: string) => {
    try {
      await api.updateBedStatus(bedId, status);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update bed status');
    }
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForAdmission) return;
    setAdmitting(true);
    try {
      await api.admitPatient({
        patientId: admissionForm.patientId,
        doctorId: admissionForm.doctorId,
        bedId: selectedBedForAdmission.id,
        reason: admissionForm.reason || 'Inpatient therapeutic observation',
        diagnosis: admissionForm.diagnosis || 'Clinical evaluation',
        notes: admissionForm.notes,
      });
      setSelectedBedForAdmission(null);
      setAdmissionForm({ patientId: '', doctorId: '', reason: '', diagnosis: '', notes: '' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to admit patient');
    } finally {
      setAdmitting(false);
    }
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForDischarge) return;
    setDischarging(true);
    try {
      // Find the admission record
      const admissions = await api.request<any[]>('/api/admissions');
      const activeAdmission = admissions.find(
        (a) => a.bedId === selectedBedForDischarge.id && a.status === 'Admitted'
      );

      if (!activeAdmission) {
        // Fallback: update bed directly
        await api.updateBedStatus(selectedBedForDischarge.id, 'Cleaning');
      } else {
        await api.dischargePatient({
          admissionId: activeAdmission.id,
          finalDiagnosis: dischargeForm.finalDiagnosis || activeAdmission.diagnosis,
          doctorNotes: dischargeForm.doctorNotes,
          treatmentSummary: dischargeForm.treatmentSummary,
          followUpInstructions: dischargeForm.followUpInstructions,
        });
      }

      setSelectedBedForDischarge(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to discharge patient');
    } finally {
      setDischarging(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
      case 'Occupied':
        return 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100';
      case 'Reserved':
        return 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100';
      case 'Cleaning':
        return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
      case 'Maintenance':
        return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inpatient Wards, Rooms & Bed Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time floor occupancy, sanitization workflow, and patient admissions</p>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">Bed Status Legend:</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Reserved
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Cleaning
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Maintenance
          </span>
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Ward Types</option>
          {roomTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms & Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const roomBeds = beds.filter((b) => b.roomId === room.id);
          const occupiedCount = roomBeds.filter((b) => b.status === 'Occupied').length;
          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{room.roomNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {room.roomType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {room.floor} • Rate: <span className="font-semibold text-slate-800">${room.dailyRate}/day</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {occupiedCount}/{roomBeds.length} Beds Occupied
                  </span>
                </div>

                {/* Beds in Room */}
                <div className="mt-4 grid grid-cols-1 gap-2.5">
                  {roomBeds.map((bed) => (
                    <div
                      key={bed.id}
                      className={`p-3 rounded-lg border text-xs transition-all ${getStatusColor(bed.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-sm">{bed.bedNumber}</span>
                        <span className="font-bold text-[10px] uppercase tracking-wider">{bed.status}</span>
                      </div>

                      {bed.status === 'Occupied' && (
                        <div className="mt-2 pt-2 border-t border-rose-200 text-rose-900 text-[11px]">
                          <p className="font-semibold">{bed.patientName}</p>
                          <p className="text-[10px] text-rose-700">Admitted: {bed.admissionDate}</p>
                        </div>
                      )}

                      {/* Bed Action buttons */}
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between gap-1 text-[11px]">
                        {bed.status === 'Available' && ['receptionist', 'nurse', 'admin', 'super_admin'].includes(currentRole) && (
                          <button
                            onClick={() => setSelectedBedForAdmission(bed)}
                            className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Admit Patient</span>
                          </button>
                        )}

                        {bed.status === 'Occupied' && ['nurse', 'doctor', 'admin', 'super_admin'].includes(currentRole) && (
                          <button
                            onClick={() => setSelectedBedForDischarge(bed)}
                            className="flex items-center gap-1 font-semibold text-rose-800 hover:text-rose-950 underline"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Discharge Patient</span>
                          </button>
                        )}

                        {bed.status === 'Cleaning' && (
                          <button
                            onClick={() => handleBedStatusUpdate(bed.id, 'Available')}
                            className="flex items-center gap-1 font-semibold text-teal-800 hover:text-teal-950 underline"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>Mark Cleaned & Ready</span>
                          </button>
                        )}

                        {bed.status === 'Maintenance' && (
                          <button
                            onClick={() => handleBedStatusUpdate(bed.id, 'Available')}
                            className="flex items-center gap-1 font-semibold text-slate-800 underline"
                          >
                            <Wrench className="w-3.5 h-3.5 text-slate-600" />
                            <span>Finish Repairs</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inpatient Admission Modal */}
      {selectedBedForAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-600" />
              Inpatient Bed Admission - Bed {selectedBedForAdmission.bedNumber}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Allocate room {selectedBedForAdmission.roomNumber} ({selectedBedForAdmission.roomType}) to registered patient.
            </p>

            <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Patient *</label>
                <select
                  required
                  value={admissionForm.patientId}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientCode}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attending Physician *</label>
                <select
                  required
                  value={admissionForm.doctorId}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, doctorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Attending Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admission Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Appendicitis / Post-Cardiac Observation"
                  value={admissionForm.diagnosis}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Inpatient Stay</label>
                <textarea
                  rows={2}
                  placeholder="Clinical indication for hospital stay..."
                  value={admissionForm.reason}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBedForAdmission(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={admitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {admitting ? 'Admitting...' : 'Confirm Inpatient Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Summary Modal */}
      {selectedBedForDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-rose-600" />
              Patient Discharge & Final Summary - {selectedBedForDischarge.patientName}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Discharge patient from Bed {selectedBedForDischarge.bedNumber} and transition bed to sanitation.
            </p>

            <form onSubmit={handleDischargeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Final Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Resolved Acute Appendicitis post-appendectomy"
                  value={dischargeForm.finalDiagnosis}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, finalDiagnosis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical Treatment Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={dischargeForm.treatmentSummary}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, treatmentSummary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Follow-Up & Discharge Instructions *</label>
                <textarea
                  rows={2}
                  required
                  value={dischargeForm.followUpInstructions}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, followUpInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBedForDischarge(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={discharging}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {discharging ? 'Discharging...' : 'Discharge & Free Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
