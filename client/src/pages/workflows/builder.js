import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  Bot,
  GitFork,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Play,
  Copy,
  Mail,
  MessageSquare,
  Table,
  Cpu,
  Layers,
  Wand2,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [modelTier, setModelTier] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    {
      category: 'Sales & Lead Ops',
      prompts: [
        'When a new lead row is added to Google Sheets, send an email via Gmail and post a notification to Slack #sales-leads',
        'Extract client invoice PDF attachment, parse total sum, log to Google Sheets, and alert finance manager on Slack'
      ]
    },
    {
      category: 'SecOps & Dev Alerts',
      prompts: [
        'Post an urgent security alert to Discord bot when a Webhook error event is received and notify on-call engineer',
        'Listen for API rate limit warnings, attempt automatic recovery backoff, and log audit event to database'
      ]
    },
    {
      category: 'Support & Escalation',
      prompts: [
        'Summarize urgent customer support ticket with AI, route high-priority tickets to Discord, and email team lead'
      ]
    }
  ];

  const synthesisSteps = [
    { name: 'Planner Agent', desc: 'Analyzing natural language intent & topological DAG sequence...', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { name: 'Execution Agent', desc: 'Binding OAuth integration adapters (Gmail, Slack, Sheets)...', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { name: 'Validation Agent', desc: 'Generating required schema fields & validation contracts...', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { name: 'Recovery Agent', desc: 'Configuring failure classification & backoff policy...', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
  ];

  const handleGenerate = async (targetPrompt) => {
    const finalPrompt = targetPrompt || prompt;
    if (!finalPrompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setGeneratedWorkflow(null);
      setSynthesisStep(0);

      // Simulate multi-agent step progress for dramatic visual feedback
      const stepInterval = setInterval(() => {
        setSynthesisStep((prev) => {
          if (prev < 3) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 500);

      const res = await api.post('/workflows/generate', { prompt: finalPrompt });
      clearInterval(stepInterval);

      if (res.data.success) {
        setSynthesisStep(3);
        setGeneratedWorkflow(res.data.workflow);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'AI Synthesis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    setPrompt(
      `${prompt.trim()}. Add automatic error validation, log retry telemetry, and send failure escalation alert.`
    );
  };

  const handleOpenCanvas = () => {
    if (generatedWorkflow) {
      router.push(`/workflows/${generatedWorkflow._id}`);
    }
  };

  const handleExecuteNow = async () => {
    if (!generatedWorkflow) return;
    try {
      const res = await api.post(`/workflows/${generatedWorkflow._id}/execute`, {});
      if (res.data.success) {
        router.push(`/executions/${res.data.execution._id}`);
      }
    } catch (err) {
      console.error('Trigger failed:', err);
    }
  };

  const handleCopyBlueprint = () => {
    if (generatedWorkflow) {
      navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const providerBadges = {
    gmail: { icon: Mail, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    slack: { icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    discord: { icon: Bot, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    'google-sheets': { icon: Table, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    webhook: { icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    openrouter: { icon: Cpu, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    gemini: { icon: Sparkles, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Futuristic Hero Header */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-dark-800 via-dark-900 to-slate-950 shadow-2xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs font-mono shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                <span>AI Prompt-to-Workflow Synthesis</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs font-mono border border-slate-700/80">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span>3-Tier Engine (OpenRouter • Gemini • Rule Engine)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn Natural Language into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
                Executable Agent Workflows
              </span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Describe your automation intent in plain English. Our multi-agent compiler evaluates node DAG dependencies,
              wires OAuth integrations, establishes required validation schemas, and compiles a production-ready graph.
            </p>
          </div>
        </div>

        {/* Prompt Input Workbench Studio */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 bg-dark-800/60 backdrop-blur-xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Automation Prompt Studio
              </h2>
            </div>

            {/* Model Tier Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono">AI Provider:</span>
              <select
                value={modelTier}
                onChange={(e) => setModelTier(e.target.value)}
                className="bg-dark-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
              >
                <option value="auto">Auto-Select (Recommended)</option>
                <option value="openrouter">OpenRouter Claude-3</option>
                <option value="gemini">Google Gemini 1.5</option>
                <option value="rule">Deterministic Fast Engine</option>
              </select>
            </div>
          </div>

          {/* Interactive Textarea Box */}
          <div className="relative group">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-dark-900/90 border border-slate-700/80 group-focus-within:border-brand-500 group-focus-within:ring-2 group-focus-within:ring-brand-500/20 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all leading-relaxed shadow-inner"
              placeholder="e.g. When a new lead row is added to Google Sheets, send an email to sales manager via Gmail and post a summary alert to Slack #sales-leads..."
            />

            {/* Quick Action Overlay inside Input */}
            <div className="absolute right-4 bottom-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-brand-300 text-[11px] font-medium border border-slate-700/80 flex items-center space-x-1.5 transition-all"
                title="Automatically append error handling and escalation logic"
              >
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>Enhance Prompt</span>
              </button>
            </div>
          </div>

          {/* Prompt Controls & Sample Prompts Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-slate-400">
                Prompt Templates & Recipes:
              </span>

              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-brand-500/25 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? 'Synthesizing Workflow...' : 'Generate Visual Workflow'}</span>
              </button>
            </div>

            {/* Prompts Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categories.map((cat, cIdx) => (
                <div key={cIdx} className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                    {cat.category}
                  </span>
                  <div className="space-y-1.5">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          setPrompt(p);
                          handleGenerate(p);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-dark-950/80 hover:bg-brand-500/10 hover:border-brand-500/30 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-all line-clamp-2 leading-relaxed"
                      >
                        "{p}"
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Multi-Agent Synthesis Telemetry Status */}
        {loading && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-dark-800/80 animate-pulse">
            <div className="flex items-center space-x-2 text-xs font-mono text-brand-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Multi-Agent Compiler In Progress...</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {synthesisSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    synthesisStep >= idx ? step.color : 'border-slate-800 bg-dark-900 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{step.name}</span>
                    {synthesisStep > idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : synthesisStep === idx ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    )}
                  </div>
                  <p className="text-[10px] opacity-80 mt-1 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Synthesis Error</span>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Compiled Workflow Graph Showcase & Preview */}
        {generatedWorkflow && !loading && (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 bg-dark-800/80 shadow-2xl">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-slate-100">{generatedWorkflow.name}</h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Compiled Graph Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{generatedWorkflow.description}</p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyBlueprint}
                  className="bg-dark-900 hover:bg-slate-800 text-slate-300 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Blueprint' : 'Copy Blueprint JSON'}</span>
                </button>

                <button
                  onClick={handleExecuteNow}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Immediately</span>
                </button>

                <button
                  onClick={handleOpenCanvas}
                  className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-xl shadow-brand-500/25"
                >
                  <GitFork className="w-4 h-4" />
                  <span>Open Visual Canvas Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Compiled Node DAG Sequence */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Compiled Execution Node Chain ({generatedWorkflow.nodes?.length || 0} Steps)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Topological Topological Ordering</span>
              </div>

              {/* Node Sequence Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedWorkflow.nodes?.map((node, i) => {
                  const config = node.data?.config || {};
                  const providerKey = config.provider || node.type || 'webhook';
                  const badge = providerBadges[providerKey] || providerBadges.webhook;
                  const Icon = badge.icon;

                  return (
                    <div
                      key={node.id}
                      className="p-5 rounded-2xl bg-dark-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl border ${badge.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200 block group-hover:text-brand-400 transition-colors">
                              {node.data?.label || node.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono capitalize">
                              Step #{i + 1} • {providerKey}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800/60 text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Action:</span>
                          <span className="text-slate-200 font-bold">{config.action || 'execute'}</span>
                        </div>
                        {config.to && (
                          <div className="flex justify-between text-slate-400">
                            <span>To:</span>
                            <span className="text-brand-300 truncate max-w-[140px]">{config.to}</span>
                          </div>
                        )}
                        {config.channel && (
                          <div className="flex justify-between text-slate-400">
                            <span>Channel:</span>
                            <span className="text-emerald-300">{config.channel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
