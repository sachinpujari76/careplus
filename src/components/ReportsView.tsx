import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Users,
} from 'lucide-react';
import { api } from '../services/api.ts';

export const ReportsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getReportsSummary()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Registered Patients', data.totalPatientsCount],
      ['Total Appointments Logged', data.totalAppointmentsCount],
      ['Total Inpatient Beds', data.totalBeds],
      ['Occupied Beds', data.occupiedBeds],
      ['Pharmacy Formulary Valuation ($)', data.totalPharmacyInventoryValue],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Executive Analytics & Operational Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Clinical performance indicators, bed utilization, and inventory valuations</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Pharmacy Formulary Valuation</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">${data.totalPharmacyInventoryValue.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-emerald-600">In Stock</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Inpatient Bed Utilization</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {Math.round((data.occupiedBeds / (data.totalBeds || 1)) * 100)}%
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              {data.occupiedBeds}/{data.totalBeds} Occupied
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cumulative Registered Records</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data.totalPatientsCount}</span>
            <span className="text-[11px] font-semibold text-teal-600">{data.totalAppointmentsCount} Appts</span>
          </div>
        </div>
      </div>

      {/* Grid of breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            Specialist Physicians by Department
          </h2>

          <div className="space-y-3">
            {Object.entries(data.departmentBreakdown || {}).map(([dept, count]: any) => (
              <div key={dept}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{dept}</span>
                  <span className="text-slate-500 font-mono">{count} Doctor(s)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (count / 4) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            OPD Consultation Status Breakdown
          </h2>

          <div className="space-y-3">
            {Object.entries(data.appointmentStatusBreakdown || {}).map(([status, count]: any) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{status}</span>
                  <span className="text-slate-500 font-mono">{count} Appointments</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'Completed'
                        ? 'bg-emerald-500'
                        : status === 'In Consultation'
                        ? 'bg-indigo-500'
                        : status === 'Cancelled'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (count / (data.totalAppointmentsCount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
