import { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import api from '../services/api';
import { Puzzle, ShieldCheck, Mail, MessageSquare, Bot, Table, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualProvider, setManualProvider] = useState(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      if (res.data.success) {
        setIntegrations(res.data.integrations || []);
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOAuth = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert(`OAuth flow start failed: ${err.message}`);
    }
  };

  const handleManualSave = async () => {
    if (!manualProvider || !apiKey.trim()) return;
    try {
      await api.post('/integrations', {
        provider: manualProvider,
        credentials: { apiKey }
      });
      setManualProvider(null);
      setApiKey('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async (provider) => {
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const providers = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send and receive automated emails via Google OAuth2',
      icon: Mail,
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Post automated notifications to workspace channels',
      icon: MessageSquare,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Broadcast bot notifications & channel updates',
      icon: Bot,
      color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Append lead rows & query operational spreadsheets',
      icon: Table,
      color: 'border-teal-500/30 text-teal-400 bg-teal-500/10'
    }
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Third-Party Integrations</h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect real OAuth tools with AES-256-GCM encrypted credentials at rest
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>CREDENTIAL_ENCRYPTION_KEY Active</span>
          </div>
        </div>

        {/* Integration Cards */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading integration status...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((item) => {
              const Icon = item.icon;
              const status = integrations.find((i) => i.provider === item.id);
              const isConnected = status?.isConnected || false;

              return (
                <div
                  key={item.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl border ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">{item.name}</h3>
                          <span
                            className={`inline-flex items-center space-x-1 text-[10px] font-mono mt-0.5 ${
                              isConnected ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{isConnected ? 'Connected & Verified' : 'Disconnected'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(item.id)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Disconnect Credentials
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartOAuth(item.id)}
                          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-brand-500/20"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>OAuth Connect</span>
                        </button>
                        <button
                          onClick={() => setManualProvider(item.id)}
                          className="bg-dark-900 hover:bg-slate-800 text-slate-300 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700"
                        >
                          Manual Key
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Manual Key Modal */}
        {manualProvider && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-100 capitalize">
                Manual Token Setup: {manualProvider}
              </h3>
              <p className="text-xs text-slate-400">Enter API key or access token for local dev environment.</p>

              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key / Access Token..."
                className="w-full bg-dark-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setManualProvider(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSave}
                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2 rounded-xl"
                >
                  Save Credential
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
