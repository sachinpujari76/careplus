import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  CalendarCheck,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';
import { Doctor, Department, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface DoctorsViewProps {
  doctors: Doctor[];
  departments: Department[];
  currentRole: UserRole;
  onRefresh: () => void;
  onBookWithDoctor?: (doctor: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  departments,
  currentRole,
  onRefresh,
  onBookWithDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '10 Years',
    department: 'Cardiology',
    consultationFee: '750.00',
    availabilityStatus: 'Available' as const,
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = doctors.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.department.toLowerCase().includes(q);
    const matchDept = selectedDept === 'all' || doc.department === selectedDept;
    return matchSearch && matchDept;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createDoctor(formData);
      setShowAddModal(false);
      onRefresh();
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '10 Years',
        department: 'Cardiology',
        consultationFee: '750.00',
        availabilityStatus: 'Available',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Medical Specialists & Consulting Staff</h1>
          <p className="text-xs text-slate-500 mt-0.5">Physician directory, departments, and consultation scheduling</p>
        </div>

        {['admin', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specialist</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Doctor Name, Specialization, or Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={doc.profilePhoto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt={doc.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        doc.availabilityStatus === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {doc.availabilityStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5 truncate">{doc.name}</h3>
                  <p className="text-teal-700 font-medium text-xs truncate">{doc.specialization}</p>
                  <p className="text-slate-500 text-[11px] truncate">{doc.department}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span className="truncate">{doc.qualification} • {doc.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{doc.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</span>
                <p className="font-bold text-sm text-slate-900">${parseFloat(doc.consultationFee).toFixed(2)}</p>
              </div>

              {onBookWithDoctor && (
                <button
                  onClick={() => onBookWithDoctor(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Add Medical Specialist to Directory
            </h2>
            <p className="text-xs text-slate-500 mb-4">Register new consulting doctor and department affiliation.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jennifer Lawrence"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pediatric Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. MD, FACC, MBBS"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="doctor@hospital.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Add to Staff Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
