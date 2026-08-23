import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProtectedRoute from '../ProtectedRoute';

export default function AppShell({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
