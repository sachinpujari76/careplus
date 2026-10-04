import React, { useState } from 'react';
import {
  Stethoscope,
  HeartPulse,
  Pill,
  FlaskConical,
  CheckCircle,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { Appointment, Doctor, Patient } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface DoctorConsultationModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export const DoctorConsultationModal: React.FC<DoctorConsultationModalProps> = ({
  appointment,
  onClose,
  onSuccess,
}) => {
  // Clinical Notes State
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState(appointment.reason || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [weightKg, setWeightKg] = useState('68.0');

  // Prescriptions List State
  const [prescriptionItems, setPrescriptionItems] = useState<
    { medicineName: string; dosage: string; frequency: string; duration: string; instructions: string }[]
  >([
    { medicineName: 'Paracetamol', dosage: '500 mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
  ]);

  // Lab Test Ordering State
  const [orderLabTest, setOrderLabTest] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState('Complete Blood Count (CBC)');
  const [selectedLabCategory, setSelectedLabCategory] = useState('Hematology');

  const [saving, setSaving] = useState(false);

  const handleAddMedication = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '500 mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take with water' },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: string, val: string) => {
    const copy = [...prescriptionItems];
    (copy[index] as any)[field] = val;
    setPrescriptionItems(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) {
      alert('Please enter a clinical diagnosis before finalizing consultation.');
      return;
    }

    setSaving(true);
    try {
      // 1. Save Medical Record (EMR)
      await api.createMedicalRecord({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        appointmentId: appointment.id,
        diagnosis,
        symptoms,
        doctorNotes,
        treatmentPlan,
        bpSystolic,
        bpDiastolic,
        heartRate,
        temperature,
        respiratoryRate,
        weightKg,
      });

      // 2. Create Digital Prescription if medications exist
      if (prescriptionItems.length > 0 && prescriptionItems.some((m) => m.medicineName.trim() !== '')) {
        await api.createPrescription({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          diagnosis,
          notes: treatmentPlan,
          items: prescriptionItems.filter((m) => m.medicineName.trim() !== ''),
        });
      }

      // 3. Order Lab Diagnostic Test if selected
      if (orderLabTest) {
        await api.orderLabTest({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          testName: selectedLabTest,
          testCategory: selectedLabCategory,
          referenceRange: 'Standard clinical reference values',
          cost: '450.00',
        });
      }

      // 4. Update appointment to Completed
      await api.updateAppointmentStatus(appointment.id, 'Completed');

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to complete clinical consultation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Physician Clinical Consultation</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded">
                  {appointment.appointmentCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-800">{appointment.patientName}</span> • Attending:{' '}
                {appointment.doctorName} ({appointment.department})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consultation Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Vitals Section */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/60">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-teal-900">Current Vital Signs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">BP Systolic</label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">BP Diastolic</label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">Temp (°F)</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">Resp. Rate</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Clinical Findings & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Diagnosis * <span className="text-slate-400 font-normal">(Primary condition)</span>
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Presented Symptoms</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Dry cough, fever for 3 days, dyspnea"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Examination</label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Chest examination: bilateral wheezing, heart sounds S1 S2 normal..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Digital Prescription Builder */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-900">Digital Prescription (Rx)</span>
              </div>
              <button
                type="button"
                onClick={handleAddMedication}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            <div className="space-y-2">
              {prescriptionItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Amoxicillin 500mg)"
                      value={item.medicineName}
                      onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={item.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 2x/day)"
                      value={item.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={item.duration}
                      onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Lab Ordering */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderLabTest}
                  onChange={(e) => setOrderLabTest(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-cyan-600" />
                  Order Laboratory Diagnostics
                </span>
              </label>
            </div>

            {orderLabTest && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Select Diagnostic Test</label>
                  <select
                    value={selectedLabTest}
                    onChange={(e) => setSelectedLabTest(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                    <option value="Comprehensive Lipid Profile">Comprehensive Lipid Profile</option>
                    <option value="Serum Electrolytes & Kidney Function (KFT)">Serum Electrolytes & Kidney Function (KFT)</option>
                    <option value="HbA1c Glycated Hemoglobin">HbA1c Glycated Hemoglobin</option>
                    <option value="Thyroid Profile (T3, T4, TSH)">Thyroid Profile (T3, T4, TSH)</option>
                    <option value="Chest X-Ray PA View">Chest X-Ray PA View</option>
                    <option value="12-Lead Electrocardiogram (ECG)">12-Lead Electrocardiogram (ECG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Department Category</label>
                  <select
                    value={selectedLabCategory}
                    onChange={(e) => setSelectedLabCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              <span>{saving ? 'Finalizing...' : 'Complete Consultation & Issue Rx'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
