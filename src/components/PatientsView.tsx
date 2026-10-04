import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  Pill,
  FlaskConical,
  Receipt,
  X,
  CheckCircle,
} from 'lucide-react';
import { Patient, Appointment, MedicalRecord, Prescription, LaboratoryTest, Bill } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface PatientsViewProps {
  patients: Patient[];
  onRefresh: () => void;
  onOpenConsultation?: (patientId: number, patientName: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ patients, onRefresh, onOpenConsultation }) => {
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetail, setPatientDetail] = useState<{
    patient: Patient;
    appointments: Appointment[];
    medicalRecords: MedicalRecord[];
    prescriptions: Prescription[];
    laboratoryTests: LaboratoryTest[];
    bills: Bill[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<'overview' | 'records' | 'prescriptions' | 'labs' | 'bills'>('overview');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1992-05-15',
    age: '34',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    previousConditions: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Filtered patients
  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(q) ||
      p.patientCode.toLowerCase().includes(q) ||
      p.phone.includes(q);
    const matchesBlood = bloodFilter === 'all' || p.bloodGroup === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  const handleOpenDetail = async (id: number) => {
    setSelectedPatientId(id);
    setLoadingDetail(true);
    try {
      const data = await api.getPatient(id);
      setPatientDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPatient(formData);
      setShowRegisterModal(false);
      onRefresh();
      // Reset form
      setFormData({
        fullName: '',
        dob: '1992-05-15',
        age: '34',
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '',
        email: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalHistory: '',
        allergies: '',
        previousConditions: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patient Management & Electronic Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive electronic health dossiers and demographics</p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Registration</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Code (e.g. PAT-1001), Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Blood</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Allergies</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{p.patientCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="py-3 px-4">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>{p.phone}</div>
                      <div className="text-slate-400">{p.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {p.allergies && p.allergies !== 'None' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          {p.allergies}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Electronic Dossier Modal */}
      {selectedPatientId && patientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {patientDetail.patient.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{patientDetail.patient.fullName}</h2>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-mono text-xs font-semibold rounded">
                      {patientDetail.patient.patientCode}
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded">
                      {patientDetail.patient.bloodGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {patientDetail.patient.age} Yrs • {patientDetail.patient.gender} • Registered:{' '}
                    {patientDetail.patient.registrationDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setPatientDetail(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-white">
              {[
                { id: 'overview', label: 'Demographics & Vitals', icon: HeartPulse },
                { id: 'records', label: 'Clinical History', icon: FileText },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'labs', label: 'Lab Reports', icon: FlaskConical },
                { id: 'bills', label: 'Billing & Invoices', icon: Receipt },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDossierTab(tab.id as any)}
                    className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
                      isActive
                        ? 'border-teal-600 text-teal-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dossier Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeDossierTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
                      Contact Information
                    </h3>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>{patientDetail.patient.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      <span>{patientDetail.patient.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{patientDetail.patient.address}</span>
                    </p>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">Emergency Contact:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {patientDetail.patient.emergencyContactName} ({patientDetail.patient.emergencyContactPhone})
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
                      Clinical Risk Profile
                    </h3>
                    <div>
                      <span className="text-slate-500 font-medium">Allergies:</span>
                      <p className="text-amber-800 font-semibold bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                        {patientDetail.patient.allergies || 'No known drug allergies'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Known Medical History:</span>
                      <p className="text-slate-700 mt-0.5">{patientDetail.patient.medicalHistory || 'None on record'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Pre-existing Conditions:</span>
                      <p className="text-slate-700 mt-0.5">{patientDetail.patient.previousConditions || 'None'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'records' && (
                <div className="space-y-3">
                  {patientDetail.medicalRecords.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No medical records documented yet.</div>
                  ) : (
                    patientDetail.medicalRecords.map((rec) => (
                      <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="font-bold text-teal-800">{rec.diagnosis}</span>
                          <span className="text-slate-500">{rec.recordDate} • {rec.doctorName}</span>
                        </div>
                        <p><strong className="text-slate-700">Symptoms:</strong> {rec.symptoms}</p>
                        <p><strong className="text-slate-700">Doctor Notes:</strong> {rec.doctorNotes}</p>
                        <p><strong className="text-slate-700">Treatment Plan:</strong> {rec.treatmentPlan}</p>
                        {/* Vitals pill bar */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          <span className="bg-white px-2 py-0.5 border border-slate-200 rounded">
                            BP: {rec.bpSystolic}/{rec.bpDiastolic} mmHg
                          </span>
                          <span className="bg-white px-2 py-0.5 border border-slate-200 rounded">
                            Heart Rate: {rec.heartRate} bpm
                          </span>
                          <span className="bg-white px-2 py-0.5 border border-slate-200 rounded">
                            Temp: {rec.temperature}°F
                          </span>
                          <span className="bg-white px-2 py-0.5 border border-slate-200 rounded">
                            Weight: {rec.weightKg} kg
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDossierTab === 'prescriptions' && (
                <div className="space-y-3">
                  {patientDetail.prescriptions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No active digital prescriptions.</div>
                  ) : (
                    patientDetail.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <div>
                            <span className="font-bold text-teal-800">{rx.prescriptionCode}</span>
                            <span className="text-slate-500 ml-2">by {rx.doctorName}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {rx.status}
                          </span>
                        </div>
                        <p><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                        <p className="text-slate-500 italic">Instructions: {rx.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDossierTab === 'labs' && (
                <div className="space-y-3">
                  {patientDetail.laboratoryTests.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No lab diagnostics requested.</div>
                  ) : (
                    patientDetail.laboratoryTests.map((lab) => (
                      <div key={lab.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="font-bold text-slate-900">{lab.testName} ({lab.testCode})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                            {lab.sampleStatus}
                          </span>
                        </div>
                        <p><strong>Result:</strong> {lab.result || 'Pending laboratory analysis'}</p>
                        <p className="text-slate-500"><strong>Reference:</strong> {lab.referenceRange}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDossierTab === 'bills' && (
                <div className="space-y-3">
                  {patientDetail.bills.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No invoices generated for this patient.</div>
                  ) : (
                    patientDetail.bills.map((bill) => (
                      <div key={bill.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{bill.billCode}</span>
                          <span className="text-slate-500 ml-2">Date: {bill.billDate}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Total Charges: ${bill.grandTotal}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">${bill.grandTotal}</span>
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {bill.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">New Patient Admission & Registration</h2>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Primary Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, Postal Code"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Spouse / Sibling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+1 555-999-9999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Known Allergies (Crucial)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa, NSAIDs, Latex"
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Medical History & Chronic Conditions</label>
                <textarea
                  rows={2}
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Previous Cardiac Stent"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
