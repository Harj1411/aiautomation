import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { GitFork, Search, Plus, Play, Copy, Trash2, Edit3, Sparkles } from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, [search]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workflows?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setWorkflows(res.data.workflows || []);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Custom Workflow',
        description: 'Visual automation workflow canvas',
        nodes: [
          {
            id: 'trigger_1',
            type: 'input',
            position: { x: 250, y: 100 },
            data: { label: 'Webhook Trigger', type: 'trigger', config: { provider: 'webhook' } }
          }
        ],
        edges: []
      });
      if (res.data.success) {
        router.push(`/workflows/${res.data.workflow._id}`);
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  };

  const handleExecute = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/execute`, {});
      if (res.data.success) {
        router.push(`/executions/${res.data.execution._id}`);
      }
    } catch (err) {
      console.error('Execution trigger failed:', err);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Workflow Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, configure, and execute multi-agent operational workflows
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/workflows/builder"
              className="bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 font-medium text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prompt AI Builder</span>
            </Link>

            <button
              onClick={handleCreateNew}
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Canvas Workflow</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by name or description..."
            className="w-full bg-dark-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Workflow Grid */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <GitFork className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No Workflows Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by creating a new workflow manually or using the AI Prompt Builder.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={handleCreateNew}
                className="bg-brand-600 text-white text-xs font-medium px-4 py-2 rounded-lg"
              >
                Create Blank Canvas
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflows.map((wf) => (
              <div
                key={wf._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-400 transition-colors">
                      {wf.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      v{wf.version || 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {wf.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(wf.tags || ['Automated']).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-dark-900 text-slate-400 px-2.5 py-1 rounded-md border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded">
                      {wf.nodes?.length || 0} nodes
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExecute(wf._id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Run</span>
                    </button>

                    <Link
                      href={`/workflows/${wf._id}`}
                      className="bg-dark-900 hover:bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDuplicate(wf._id)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wf._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
