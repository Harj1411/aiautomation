import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  Play,
  Pause,
  XCircle,
  Activity,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ExecutionLiveStreamPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExecutionDetails();
      fetchTimelineLogs();

      // Join Socket.IO execution room for real-time live events
      joinExecutionRoom(id);
      const socket = getSocket();

      if (socket) {
        socket.on('agent:step', (eventData) => {
          if (String(eventData.executionId) === String(id)) {
            setLogs((prevLogs) => [...prevLogs, eventData]);
          }
        });
      }

      return () => {
        leaveExecutionRoom(id);
      };
    }
  }, [id]);

  const fetchExecutionDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/executions/${id}`);
      if (res.data.success) {
        setExecution(res.data.execution);
      }
    } catch (err) {
      console.error('Failed to fetch execution:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineLogs = async () => {
    try {
      const res = await api.get(`/executions/${id}/timeline`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch timeline logs:', err);
    }
  };

  const handlePause = async () => {
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = async () => {
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecutionDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const agentBadgeColors = {
    planner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    execution: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    validation: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    recovery: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    monitoring: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/executions')}
              className="p-2 rounded-xl bg-dark-800 border border-slate-700 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-100">
                  {execution?.workflowId?.name || 'Workflow Run'}
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {execution?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time Socket.IO agent telemetry stream • ID: {id}
              </p>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex items-center space-x-2">
            {execution?.status === 'RUNNING' && (
              <button
                onClick={handlePause}
                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            {execution?.status === 'PAUSED' && (
              <button
                onClick={handleResume}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            {(execution?.status === 'RUNNING' || execution?.status === 'PAUSED') && (
              <button
                onClick={handleCancel}
                className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Run</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Timeline Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-200">Live Agent Event Stream</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{logs.length} events logged</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                Waiting for agent events from server broadcast...
              </div>
            ) : (
              logs.map((log, index) => {
                const agent = log.agent || 'monitoring';
                const badgeColor = agentBadgeColors[agent] || agentBadgeColors.monitoring;

                return (
                  <div
                    key={log._id || index}
                    className="p-4 rounded-xl bg-dark-900 border border-slate-800/80 flex items-start space-x-3 transition-all hover:border-slate-700"
                  >
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-md border ${badgeColor} flex-shrink-0`}
                    >
                      {agent}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{log.message}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-2 p-2.5 rounded-lg bg-dark-950 border border-slate-800/60 text-[10px] font-mono text-slate-400 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                      {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
