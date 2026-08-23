import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import api from '../services/api';
import { Sparkles, GitFork, PlayCircle, Plus, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      if (res.data.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Operations Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Live multi-agent automation statistics and active workflow runs
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/workflows/builder"
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prompt AI Builder</span>
            </Link>

            <Link
              href="/workflows"
              className="bg-dark-800 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Workflow</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid Component */}
        <MetricGrid stats={stats} />

        {/* Recent Executions & Agent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Execution Activity Feed (2 Cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <PlayCircle className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-200">Recent Workflow Executions</h3>
              </div>
              <Link href="/executions" className="text-xs text-brand-400 hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading activity feed...</div>
            ) : !stats?.recentExecutions || stats.recentExecutions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No recent executions found. Trigger a workflow to see real-time agent output.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentExecutions.map((exec) => (
                  <div
                    key={exec._id}
                    className="p-4 rounded-xl bg-dark-900 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          exec.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : exec.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}
                      >
                        {exec.status === 'COMPLETED' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {exec.workflowId?.name || 'Workflow'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Status: {exec.status} • Duration: {exec.duration || 0}s
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/executions/${exec._id}`}
                      className="text-xs font-medium text-slate-400 hover:text-brand-400 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      View Live Stream
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Substrate Status Feed (1 Col) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200">AI Agent Layer Status</h3>
            </div>

            <div className="space-y-3">
              {[
                { agent: 'Planner Agent', status: 'Optimal', detail: 'Topological sorter active' },
                { agent: 'Execution Agent', status: 'Connected', detail: 'OAuth adapters bound' },
                { agent: 'Validation Agent', status: 'Active', detail: 'Required fields inspector' },
                { agent: 'Recovery Agent', status: 'Standby', detail: 'Auto-retry classification' },
                { agent: 'Monitoring Agent', status: 'Streaming', detail: 'Socket.IO live logger' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-900 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{item.agent}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
