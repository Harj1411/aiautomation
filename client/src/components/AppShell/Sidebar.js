import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitFork,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bot
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', href: '/workflows', icon: GitFork },
    { label: 'AI Builder', href: '/workflows/builder', icon: Sparkles },
    { label: 'Executions', href: '/executions', icon: PlayCircle },
    { label: 'Integrations', href: '/integrations', icon: Puzzle },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-dark-800 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 tracking-wide text-sm block">Agentflow_AI</span>
            <span className="text-[10px] text-brand-400 font-mono">OPERATIONS CONSOLE</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              router.pathname === item.href ||
              (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Agent Substrate Status */}
      <div className="p-4 m-3 bg-dark-900/60 border border-slate-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-medium text-slate-300">5-Agent Chain Active</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Planner • Executor • Validator • Recovery • Monitoring</p>
      </div>
    </aside>
  );
}
