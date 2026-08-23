import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Bot,
  Sparkles,
  GitFork,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Layers,
  Terminal
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">Agentflow_AI</span>
            <span className="text-[10px] text-brand-400 font-mono">AGENTIC AI PLATFORM</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-xs font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-brand-500/20"
          >
            Deploy Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-8 py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono mb-8">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Generation Operations Console</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Describe Automations in Plain English.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
            Executed by 5 Cooperating AI Agents.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
          Agentflow_AI turns natural language prompts into executable visual graphs, connects with real OAuth tools
          (Gmail, Slack, Discord, Google Sheets), streams live agent events, and automatically recovers from failures.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-brand-500/25"
          >
            <span>Launch Operator Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-800 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <span>Sign In to Environment</span>
          </Link>
        </div>

        {/* Multi-Agent Architecture Showcase */}
        <div className="mt-20 w-full glass-panel border border-slate-800 rounded-2xl p-8 shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <h3 className="font-semibold text-sm text-slate-200">5-Agent Chain Execution Substrate</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              LangGraph Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: 'Planner Agent', desc: 'Calculates topological node order and confidence score', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
              { title: 'Execution Agent', desc: 'Runs third-party integrations and AI providers', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
              { title: 'Validation Agent', desc: 'Verifies required output fields and schemas', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
              { title: 'Recovery Agent', desc: 'Classifies failure types and manages backoff/escalation', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
              { title: 'Monitoring Agent', desc: 'Emits Socket.IO real-time timeline events & audit logs', color: 'border-pink-500/30 bg-pink-500/10 text-pink-400' }
            ].map((agent, i) => (
              <div key={i} className={`p-4 rounded-xl border ${agent.color}`}>
                <span className="text-xs font-bold block mb-1">{agent.title}</span>
                <p className="text-[11px] opacity-80 leading-snug">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-8 text-center text-xs text-slate-500">
        Agentflow_AI Operations Console &copy; 2026. Built with Next.js, Express, MongoDB, Socket.IO & React Flow.
      </footer>
    </div>
  );
}
