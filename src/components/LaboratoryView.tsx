import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  FileCheck,
  Eye,
  Plus,
  X,
  Stethoscope,
  Microscope,
} from 'lucide-react';
import { LaboratoryTest, Doctor, Patient, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface LaboratoryViewProps {
  tests: LaboratoryTest[];
  doctors: Doctor[];
  patients: Patient[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({
  tests,
  doctors,
  patients,
  currentRole,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTest, setSelectedTest] = useState<LaboratoryTest | null>(null);
  const [editingResultId, setEditingResultId] = useState<number | null>(null);

  // Form states for entering results
  const [resultText, setResultText] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [technicianName, setTechnicianName] = useState('Dr. Liam Thorne');
  const [notes, setNotes] = useState('');
  const [savingResult, setSavingResult] = useState(false);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    doctorId: '',
    testName: 'Complete Blood Count (CBC)',
    testCategory: 'Hematology',
    cost: '350.00',
    referenceRange: 'Hb: 13-17 g/dL | WBC: 4000-11000 /mcL',
  });
  const [ordering, setOrdering] = useState(false);

  const filtered = tests.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.testName.toLowerCase().includes(q) ||
      t.testCode.toLowerCase().includes(q) ||
      t.patientName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.sampleStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateSampleStatus = async (id: number, sampleStatus: string) => {
    try {
      await api.updateLabTest(id, { sampleStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update sample status');
    }
  };

  const handleOpenResultEditor = (test: LaboratoryTest) => {
    setEditingResultId(test.id);
    setResultText(test.result || '');
    setReferenceText(test.referenceRange || 'Within normal limits');
    setNotes(test.notes || '');
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResultId) return;
    setSavingResult(true);
    try {
      await api.updateLabTest(editingResultId, {
        result: resultText,
        referenceRange: referenceText,
        labTechnician: technicianName,
        sampleStatus: 'Completed',
        notes,
      });
      setEditingResultId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete lab test');
    } finally {
      setSavingResult(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrdering(true);
    try {
      await api.orderLabTest(orderForm);
      setShowOrderModal(false);
      onRefresh();
      setOrderForm({
        patientId: '',
        doctorId: '',
        testName: 'Complete Blood Count (CBC)',
        testCategory: 'Hematology',
        cost: '350.00',
        referenceRange: 'Hb: 13-17 g/dL | WBC: 4000-11000 /mcL',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to order lab test');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pathology & Diagnostic Laboratory Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sample chain of custody, automated analyzers, and verified reports</p>
        </div>

        {['doctor', 'lab_technician', 'admin', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Order Diagnostic Test</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Test Name, Test Code (e.g. LAB-5001), or Patient..."
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
          <option value="all">All Sample Statuses</option>
          <option value="Requested">Requested</option>
          <option value="Sample Collected">Sample Collected</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Test Code</th>
                <th className="py-3 px-4">Test Name / Discipline</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Ordering Physician</th>
                <th className="py-3 px-4">Date Requested</th>
                <th className="py-3 px-4">Sample Status</th>
                <th className="py-3 px-4 text-right">Laboratory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No diagnostic tests found in the laboratory queue.
                  </td>
                </tr>
              ) : (
                filtered.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{test.testCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{test.testName}</div>
                      <div className="text-cyan-700 text-[11px] font-medium">{test.testCategory}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{test.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">{test.doctorName}</td>
                    <td className="py-3 px-4 text-slate-500">{test.requestedDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          test.sampleStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : test.sampleStatus === 'Processing'
                            ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                            : test.sampleStatus === 'Sample Collected'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {test.sampleStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Technician Actions */}
                      {['lab_technician', 'admin', 'super_admin'].includes(currentRole) && (
                        <>
                          {test.sampleStatus === 'Requested' && (
                            <button
                              onClick={() => handleUpdateSampleStatus(test.id, 'Sample Collected')}
                              className="px-2 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                            >
                              Collect Sample
                            </button>
                          )}
                          {test.sampleStatus === 'Sample Collected' && (
                            <button
                              onClick={() => handleUpdateSampleStatus(test.id, 'Processing')}
                              className="px-2 py-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100"
                            >
                              Start Analysis
                            </button>
                          )}
                          {test.sampleStatus !== 'Completed' && (
                            <button
                              onClick={() => handleOpenResultEditor(test)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 text-white rounded hover:bg-teal-500"
                            >
                              Enter Result
                            </button>
                          )}
                        </>
                      )}

                      {test.sampleStatus === 'Completed' && (
                        <button
                          onClick={() => setSelectedTest(test)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Result Modal */}
      {editingResultId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Microscope className="w-4 h-4 text-teal-600" />
              Document Laboratory Test Results
            </h2>
            <p className="text-xs text-slate-500 mb-4">Input verified analyzer parameters and biological reference intervals.</p>

            <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Analyzer Findings / Quantified Values *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Hb: 14.2 g/dL, Total WBC: 7,400 /mcL, Platelets: 245,000 /mcL"
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Biological Reference Range</label>
                <input
                  type="text"
                  placeholder="e.g. Normal: 13.0 - 17.0 g/dL"
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Certifying Pathologist / Technician</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Diagnostic Interpretation / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Morphology normal. No atypical cells detected."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResultId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResult}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {savingResult ? 'Verifying...' : 'Sign Off & Finalize Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Printable Lab Report Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700">Certified Diagnostic Report</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button onClick={() => setSelectedTest(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">CarePulse Clinical Laboratories</h2>
                  <p className="text-[11px] text-slate-500">Department of Pathology & Molecular Diagnostics</p>
                  <p className="text-[10px] text-slate-400">Central Diagnostics Bay • CAP & NABL Accredited</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-teal-700">{selectedTest.testCode}</p>
                  <p className="text-slate-500">Sample Date: {selectedTest.requestedDate}</p>
                  <p className="text-slate-500">Report Date: {selectedTest.completedDate || selectedTest.requestedDate}</p>
                </div>
              </div>

              {/* Patient and Doctor */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">PATIENT NAME</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedTest.patientName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium">ORDERING PHYSICIAN</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedTest.doctorName}</p>
                </div>
              </div>

              {/* Investigation Box */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-sm text-slate-900">{selectedTest.testName}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-800">
                    {selectedTest.testCategory}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-600">FINDINGS / RESULTS:</span>
                  <p className="font-mono font-bold text-teal-900 bg-teal-50 p-3 rounded-lg border border-teal-200 mt-1 whitespace-pre-wrap">
                    {selectedTest.result || 'No numeric values recorded'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-600">BIOLOGICAL REFERENCE INTERVAL:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
                    {selectedTest.referenceRange || 'Standard population reference ranges apply'}
                  </p>
                </div>

                {selectedTest.notes && (
                  <div>
                    <span className="font-semibold text-slate-600">INTERPRETIVE REMARKS:</span>
                    <p className="text-slate-600 italic mt-0.5">{selectedTest.notes}</p>
                  </div>
                )}
              </div>

              {/* Signoff */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <p className="text-[10px] text-slate-400 font-mono">
                  Verified Electronically by {selectedTest.labTechnician || 'Laboratory Staff'}
                </p>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-900">{selectedTest.labTechnician || 'Dr. Liam Thorne'}</p>
                  <p className="text-[10px] text-slate-500">Chief Clinical Pathologist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Test Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Order New Diagnostic Investigation
            </h2>
            <p className="text-xs text-slate-500 mb-4">Request blood, radiology, or pathology investigation for patient.</p>

            <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Patient *</label>
                <select
                  required
                  value={orderForm.patientId}
                  onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Referring Physician *</label>
                <select
                  required
                  value={orderForm.doctorId}
                  onChange={(e) => setOrderForm({ ...orderForm, doctorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={orderForm.testName}
                  onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discipline Category</label>
                  <select
                    value={orderForm.testCategory}
                    onChange={(e) => setOrderForm({ ...orderForm, testCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Standard Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.cost}
                    onChange={(e) => setOrderForm({ ...orderForm, cost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ordering}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {ordering ? 'Ordering...' : 'Submit Diagnostic Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
