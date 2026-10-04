import React, { useState } from 'react';
import {
  UserCog,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  Plus,
  X,
  Shield,
} from 'lucide-react';
import { StaffMember, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface StaffViewProps {
  staff: StaffMember[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staff, currentRole, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Nurse',
    department: 'Cardiology ICU',
    phone: '',
    email: '',
    shift: 'Morning (8 AM - 4 PM)',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.staffCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roles = Array.from(new Set(staff.map((s) => s.role)));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createStaff(formData);
      setShowAddModal(false);
      onRefresh();
      setFormData({
        name: '',
        role: 'Nurse',
        department: 'Cardiology ICU',
        phone: '',
        email: '',
        shift: 'Morning (8 AM - 4 PM)',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Staff Administration & Duty Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">Nursing staff, front desk receptionists, pharmacists, and lab personnel</p>
        </div>

        {['admin', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Staff Name, Code, or Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{member.staffCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{member.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{member.department}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {member.shift}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    <div>{member.phone}</div>
                    <div className="text-slate-400">{member.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserCog className="w-4 h-4 text-teal-600" />
              Onboard Hospital Staff Member
            </h2>
            <p className="text-xs text-slate-500 mb-4">Register new administrative, nursing, or technician employee.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nurse Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Nurse">Staff Nurse</option>
                    <option value="Receptionist">Front Desk Receptionist</option>
                    <option value="Pharmacist">Clinical Pharmacist</option>
                    <option value="Lab Technician">Laboratory Technician</option>
                    <option value="Accountant">Billing & Finance Officer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emergency Medicine"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Schedule *</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Morning (8 AM - 4 PM)">Morning (8 AM - 4 PM)</option>
                  <option value="Evening (4 PM - 12 AM)">Evening (4 PM - 12 AM)</option>
                  <option value="Night (12 AM - 8 AM)">Night (12 AM - 8 AM)</option>
                  <option value="Day (9 AM - 5 PM)">General Day (9 AM - 5 PM)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0100"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@hospital.org"
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
                  {submitting ? 'Adding...' : 'Confirm Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
