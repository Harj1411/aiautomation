import { useState, useEffect } from 'react';
import { X, Sliders, Save, ShieldAlert } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeConfig } = useWorkflowStore();

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [action, setAction] = useState('send_email');
  const [target, setTarget] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (selectedNode) {
      const data = selectedNode.data || {};
      const config = data.config || {};
      setLabel(data.label || selectedNode.id);
      setProvider(config.provider || 'gmail');
      setAction(config.action || 'send_email');
      setTarget(config.to || config.channel || config.spreadsheetId || '');
      setPrompt(config.prompt || '');
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleSave = () => {
    updateNodeConfig(selectedNode.id, {
      provider,
      action,
      to: target,
      channel: target,
      spreadsheetId: target,
      prompt
    });
  };

  return (
    <div className="w-80 bg-dark-800 border-l border-slate-800 p-4 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-semibold text-slate-200">Node Configuration</h3>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Node Title</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Integration Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          >
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="discord">Discord</option>
            <option value="google-sheets">Google Sheets</option>
            <option value="openrouter">OpenRouter AI</option>
            <option value="gemini">Google Gemini AI</option>
            <option value="webhook">Webhook Trigger</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Action / Command</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. send_email, post_message"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Target Destination (Email / Channel / Sheet ID)
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="recipient@domain.com or #general"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Prompt / Instructions</label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="Custom instructions for AI processing..."
          />
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            Validation Agent will verify outputs against these required properties during step execution.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleSave}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Save className="w-4 h-4" />
          <span>Apply Configuration</span>
        </button>
      </div>
    </div>
  );
}
