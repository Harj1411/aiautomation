import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Bot, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password, role);
    if (result?.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-800 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Create Operator Account</h2>
          <p className="text-xs text-slate-400 mt-1">Deploy your Agentflow_AI workspace session</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all"
              placeholder="Operator Name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all"
              placeholder="operator@company.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-all"
            >
              <option value="operator">Operator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand-500/20 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link href="/login" className="text-brand-400 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
