import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import NodePalette from '../../components/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import { Save, Play, ArrowLeft, GitFork } from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const { activeWorkflow, setActiveWorkflow, nodes, edges } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workflows/${id}`);
      if (res.data.success) {
        setActiveWorkflow(res.data.workflow);
      }
    } catch (err) {
      console.error('Failed to load workflow details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await api.put(`/workflows/${id}`, {
        nodes,
        edges
      });
      alert('Workflow saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!id) return;
    try {
      await handleSave();
      const res = await api.post(`/workflows/${id}/execute`, {});
      if (res.data.success) {
        router.push(`/executions/${res.data.execution._id}`);
      }
    } catch (err) {
      console.error('Execution trigger failed:', err);
    }
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-6rem)] flex flex-col -m-6 md:-m-8">
        {/* Editor Toolbar */}
        <div className="h-14 bg-dark-800 border-b border-slate-800 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/workflows')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700"></div>
            <h2 className="text-sm font-semibold text-slate-100">
              {activeWorkflow?.name || 'Workflow Editor'}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
              v{activeWorkflow?.version || 1}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-dark-900 hover:bg-slate-800 text-slate-200 text-xs font-medium px-4 py-2 rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={handleExecute}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-4 h-4" />
              <span>Run Agent Chain</span>
            </button>
          </div>
        </div>

        {/* Editor 3-Column Canvas Workspace */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Loading visual workflow canvas...
          </div>
        ) : (
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            <NodePalette />
            <WorkflowCanvas />
            <NodeConfigPanel />
          </div>
        )}
      </div>
    </AppShell>
  );
}
