import { GitFork, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MetricGrid({ stats }) {
  const items = [
    {
      label: 'Total Workflows',
      value: stats?.totalWorkflows ?? 0,
      subtext: `${stats?.activeWorkflows ?? 0} active`,
      icon: GitFork,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
    },
    {
      label: 'Total Executions',
      value: stats?.totalExecutions ?? 0,
      subtext: 'Across all agent chains',
      icon: Activity,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Success Rate',
      value: `${stats?.successRate ?? 100}%`,
      subtext: `${stats?.completedExecutions ?? 0} completed runs`,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Failed Executions',
      value: stats?.failedExecutions ?? 0,
      subtext: 'Auto-recovered / Escalated',
      icon: AlertCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="glass-panel p-5 rounded-xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 block">{item.label}</span>
                <span className="text-2xl font-bold text-slate-100 tracking-tight mt-1 block">
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">{item.subtext}</span>
              </div>
              <div className={`p-3 rounded-xl border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
