import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Clock, User, Activity } from 'lucide-react';
import { AuditLogItem } from '../types/hms.ts';
import { api } from '../services/api.ts';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditLogs()
      .then((res) => setLogs(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hospital Compliance & Security Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail of all electronic patient record operations and financial transactions</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, action, module, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record Ref</th>
                <th className="py-3 px-4">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-teal-700">{log.module}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-700 font-bold">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.recordId || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
