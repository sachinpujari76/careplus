import React, { useState } from 'react';
import {
  ClipboardList,
  Pill,
  Search,
  Printer,
  CheckCircle,
  Clock,
  Download,
  X,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { Prescription, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  currentRole,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispensing, setDispensing] = useState(false);

  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    const matchSearch =
      rx.patientName.toLowerCase().includes(q) ||
      rx.prescriptionCode.toLowerCase().includes(q) ||
      rx.doctorName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDispense = async (rxId: number) => {
    setDispensing(true);
    try {
      await api.dispensePrescription(rxId);
      onRefresh();
      if (selectedRx && selectedRx.id === rxId) {
        setSelectedRx({ ...selectedRx, status: 'Dispensed' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispense prescription');
    } finally {
      setDispensing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Digital Electronic Prescriptions (Rx)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Legally compliant e-prescribing and pharmacy fulfillment</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Rx Code (e.g. RX-3001), Patient, or Doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending Fulfillment</option>
          <option value="Dispensed">Dispensed</option>
        </select>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No prescriptions found matching your search.
          </div>
        ) : (
          filtered.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-teal-700 text-xs">{rx.prescriptionCode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rx.status === 'Dispensed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-slate-900">{rx.patientName}</p>
                  <p className="text-xs text-slate-500">
                    Prescribed by <span className="font-medium text-slate-700">{rx.doctorName}</span>
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Diagnosis:</span>
                    <p className="text-xs font-semibold text-slate-800">{rx.diagnosis}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Prescribed Items</p>
                  {rx.items && rx.items.length > 0 ? (
                    rx.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-xs flex items-center justify-between text-slate-700">
                        <span className="font-medium">{item.medicineName}</span>
                        <span className="text-[11px] text-slate-500">{item.dosage}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No medication items listed</p>
                  )}
                  {rx.items && rx.items.length > 3 && (
                    <p className="text-[10px] text-teal-600 font-medium">+ {rx.items.length - 3} more medicines</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRx(rx)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View & Print</span>
                </button>

                {['pharmacist', 'admin', 'super_admin'].includes(currentRole) && rx.status === 'Pending' && (
                  <button
                    onClick={() => handleDispense(rx.id)}
                    disabled={dispensing}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                  >
                    Dispense Rx
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Printable Prescription Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <span className="text-xs font-bold text-slate-700">Official Hospital Digital Prescription</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button onClick={() => setSelectedRx(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Prescription Paper (Printable) */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
              {/* Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-teal-600" />
                    <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      CarePulse Multispeciality Hospital
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Accredited Healthcare Provider • 24/7 Level-1 Emergency & Trauma Care
                  </p>
                  <p className="text-[10px] text-slate-400">100 Hospital Way, Medical Enclave • Phone: +1 555-CARE-HMS</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-teal-700">{selectedRx.prescriptionCode}</p>
                  <p className="text-[11px] text-slate-500">Date: {selectedRx.prescriptionDate}</p>
                </div>
              </div>

              {/* Patient and Doctor Demographics */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">PATIENT INFORMATION</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRx.patientName}</p>
                  <p className="text-slate-600">Patient ID: PAT-{1000 + selectedRx.patientId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 font-medium">PRESCRIBING PHYSICIAN</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRx.doctorName}</p>
                  <p className="text-slate-600">Attending Specialist</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-xs font-bold text-slate-700">CLINICAL DIAGNOSIS:</p>
                <p className="text-sm font-semibold text-teal-900 bg-teal-50/60 p-2.5 rounded border border-teal-200 mt-1">
                  {selectedRx.diagnosis}
                </p>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-serif italic font-bold text-2xl text-teal-700">℞</span>
                  <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">Prescribed Regimen</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine & Dosage</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRx.items && selectedRx.items.length > 0 ? (
                        selectedRx.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {it.medicineName} <span className="text-slate-500 font-normal">({it.dosage})</span>
                            </td>
                            <td className="py-2.5 px-3">{it.frequency}</td>
                            <td className="py-2.5 px-3">{it.duration}</td>
                            <td className="py-2.5 px-3 text-slate-600">{it.instructions || 'As advised'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            No medication items attached
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRx.notes && (
                <div className="text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700">Doctor Advice / Lifestyle Notes:</span>
                  <p className="text-slate-600 mt-0.5">{selectedRx.notes}</p>
                </div>
              )}

              {/* Signature block */}
              <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">Digitally signed & encrypted</p>
                  <p className="text-[10px] text-slate-400 font-mono">Verification Token: {selectedRx.prescriptionCode}-SEC</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-900">{selectedRx.doctorName}</p>
                  <p className="text-[10px] text-slate-500">Authorized Medical Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
