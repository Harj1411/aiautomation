import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { PlayCircle, Clock, CheckCircle2, AlertCircle, RefreshCw, Filter } from 'lucide-react';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/executions?status=${statusFilter}`);
      if (res.data.success) {
        setExecutions(res.data.executions || []);
      }
    } catch (err) {
      console.error('Failed to load executions list:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Execution History & Real-Time Runs</h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit trail of every agent-orchestrated run across all registered workflows
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="RUNNING">RUNNING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="PAUSED">PAUSED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
              onClick={fetchExecutions}
              className="p-2 rounded-xl bg-dark-800 hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-slate-500">Loading execution runs...</div>
          ) : executions.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500">No execution runs recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-800/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Workflow</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Start Time</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {executions.map((exec) => (
                  <tr key={exec._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {exec.workflowId?.name || 'Workflow Run'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                          exec.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : exec.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : exec.status === 'RUNNING'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span>{exec.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(exec.startTime || exec.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {exec.duration ? `${exec.duration}s` : 'In Progress'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/executions/${exec._id}`}
                        className="text-brand-400 hover:text-brand-300 font-medium hover:underline inline-flex items-center space-x-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Live Stream</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
