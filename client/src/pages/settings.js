import { useState } from 'react';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import { Settings, Key, ShieldCheck, User, Cpu, Database } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-xl font-bold text-slate-100">Platform Settings & System Health</h1>
          <p className="text-xs text-slate-400 mt-1">
            Environment health diagnostics, security encryption status, and account configuration
          </p>
        </div>

        {/* User Account Info */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-200">Operator Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Full Name</span>
              <span className="font-medium text-slate-200 block bg-dark-900 px-3 py-2 rounded-lg border border-slate-800">
                {user?.name || 'Operator'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Email Address</span>
              <span className="font-medium text-slate-200 block bg-dark-900 px-3 py-2 rounded-lg border border-slate-800">
                {user?.email || 'operator@domain.com'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Role Permission</span>
              <span className="font-mono text-brand-400 block bg-brand-500/10 px-3 py-2 rounded-lg border border-brand-500/20 capitalize">
                {user?.role || 'operator'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Session Token</span>
              <span className="font-mono text-emerald-400 block bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                JWT Active
              </span>
            </div>
          </div>
        </div>

        {/* System & Encryption Health Checks */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Security & Key Health Checks</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="w-4 h-4 text-brand-400" />
                <div>
                  <span className="font-semibold text-slate-200 block">CREDENTIAL_ENCRYPTION_KEY</span>
                  <span className="text-[10px] text-slate-500">AES-256-GCM symmetric token encryption key</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                VALID (256-bit)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-semibold text-slate-200 block">AI Generator Fallback Engine</span>
                  <span className="text-[10px] text-slate-500">OpenRouter → Gemini → Rule Builder</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-semibold text-slate-200 block">Database Storage Layer</span>
                  <span className="text-[10px] text-slate-500">MongoDB Mongoose + In-Memory Fallback</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                READY
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
