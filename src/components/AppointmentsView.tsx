import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  UserCheck,
  Stethoscope,
  AlertCircle,
  X,
} from 'lucide-react';
import { Appointment, Doctor, Patient, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface AppointmentsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  currentRole: UserRole;
  onRefresh: () => void;
  onOpenConsultation?: (apt: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  doctors,
  patients,
  currentRole,
  onRefresh,
  onOpenConsultation,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);

  // Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    reason: '',
    appointmentType: 'Consultation',
  });
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const filtered = appointments.filter((apt) => {
    const matchesDoc = selectedDoctor === 'all' || apt.doctorId === parseInt(selectedDoctor);
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesDate = !selectedDate || apt.appointmentDate === selectedDate;
    return matchesDoc && matchesStatus && matchesDate;
  });

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);
    try {
      await api.bookAppointment(bookingForm);
      setShowBookModal(false);
      onRefresh();
      setBookingForm({
        patientId: '',
        doctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00',
        reason: '',
        appointmentType: 'Consultation',
      });
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">OPD & Specialist Appointment Scheduling</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated conflict prevention and consultation pipeline</p>
        </div>

        <button
          onClick={() => {
            setBookingError('');
            setShowBookModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Doctor selector */}
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.department})
              </option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointment List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Doctor / Department</th>
                <th className="py-3 px-4">Type & Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No appointments found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{apt.appointmentCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{apt.appointmentDate}</div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-teal-600" />
                        <span>{apt.appointmentTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{apt.patientName}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{apt.doctorName}</div>
                      <div className="text-teal-700 text-[11px]">{apt.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{apt.appointmentType}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{apt.reason}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'In Consultation'
                            ? 'bg-indigo-100 text-indigo-800 font-bold'
                            : apt.status === 'Checked-in'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Stepwise Pipeline actions */}
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                          className="px-2 py-1 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100"
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'Checked-in')}
                          className="px-2 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          Check-in
                        </button>
                      )}

                      {(apt.status === 'Checked-in' || apt.status === 'In Consultation') && onOpenConsultation && (
                        <button
                          onClick={() => onOpenConsultation(apt)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 text-white rounded hover:bg-teal-500 shadow-xs"
                        >
                          Consultation Room
                        </button>
                      )}

                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(apt.id, 'Cancelled')}
                          className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:text-rose-800"
                        >
                          Cancel
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

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">Book OPD Appointment</h2>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4 text-xs">
              {bookingError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Patient */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Patient *</label>
                <select
                  required
                  value={bookingForm.patientId}
                  onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientCode}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Attending Specialist *</label>
                <select
                  required
                  value={bookingForm.doctorId}
                  onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Doctor / Department --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.specialization} ({d.department}) [${d.consultationFee}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time Slot *</label>
                  <select
                    value={bookingForm.appointmentTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Appointment Type</label>
                <select
                  value={bookingForm.appointmentType}
                  onChange={(e) => setBookingForm({ ...bookingForm, appointmentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Followup">Followup</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Post-Op Review">Post-Op Review</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chief Complaints / Symptoms</label>
                <textarea
                  rows={2}
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  placeholder="e.g. Chest pain with radiating left arm discomfort"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Checking Schedule...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
