import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (socket) {
      const channel = `notification:${user._id}`;
      socket.on(channel, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
      return () => {
        socket.off(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-dark-800 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-sm text-slate-100">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No notifications yet.</div>
          ) : (
            notifications.map((item) => {
              const Icon =
                item.type === 'success'
                  ? CheckCircle
                  : item.type === 'failure' || item.type === 'escalation'
                  ? AlertCircle
                  : item.type === 'warning'
                  ? AlertTriangle
                  : Info;

              const colorClass =
                item.type === 'success'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : item.type === 'failure'
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-brand-400 bg-brand-500/10';

              return (
                <div
                  key={item._id}
                  onClick={() => markRead(item._id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-dark-900/40 border-slate-800/60 opacity-70'
                      : 'bg-dark-900 border-slate-700/80 shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
