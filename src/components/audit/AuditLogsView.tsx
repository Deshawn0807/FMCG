import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  User, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useFMCG } from '../../context/FMCGContext.tsx';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useFMCG();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const modules = Array.from(new Set(auditLogs.map(l => l.module)));

  const filteredLogs = auditLogs.filter(log => {
    if (selectedModule !== 'all' && log.module !== selectedModule) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return log.action.toLowerCase().includes(q) ||
             log.user.toLowerCase().includes(q) ||
             log.details.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Timestamp,User,Role,Action,Module,Details,Old Value,New Value\n" +
      filteredLogs.map(l => 
        `"${l.timestamp}","${l.user}","${l.userRole}","${l.action}","${l.module}","${l.details.replace(/"/g, '""')}","${(l.oldValue || '').replace(/"/g, '""')}","${(l.newValue || '').replace(/"/g, '""')}"`
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DistriCore_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <span>Immutable System Audit & Traceability Ledger</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographic timestamped log of stock reconciliations, order status modifications, and financial actions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, operator, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden w-full sm:w-48"
          >
            <option value="all">All Modules</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5 w-44">Timestamp</th>
                <th className="py-3 px-3.5">Operator & Role</th>
                <th className="py-3 px-3.5">Action Event</th>
                <th className="py-3 px-3.5">Module</th>
                <th className="py-3 px-3.5">Audit Event Details</th>
                <th className="py-3 px-3.5">State Transition (Old ➔ New)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{log.user}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{log.userRole.replace('_', ' ')}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-slate-700">
                      {log.details}
                    </td>

                    <td className="py-3 px-3.5">
                      {log.oldValue && log.newValue ? (
                        <div className="font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-slate-500">{log.oldValue}</span>
                          <span className="text-blue-600 font-bold mx-1.5">➔</span>
                          <span className="text-slate-800 font-semibold">{log.newValue}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
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
