import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import NotificationsDrawer from './NotificationsDrawer';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-dark-800/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
            System Status: Operational
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'O'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-medium text-slate-200 block leading-none">
                {user?.name || 'Operator'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'operator'}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <NotificationsDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
