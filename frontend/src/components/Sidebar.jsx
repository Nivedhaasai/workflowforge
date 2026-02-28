import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { History } from 'lucide-react';

const NAV = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard'  },
  { to: '/workflows',  icon: '🔀', label: 'Workflows'   },
  { to: '/templates',  icon: '📋', label: 'Templates'   },
  { to: '/runs',       icon: null, lucide: true, label: 'Run History' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
    : 'WF';

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="text-xl">⚡</span>
          <span className="font-bold text-slate-900 dark:text-white text-lg">WorkflowForge</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }>
            {item.lucide ? <History size={18} /> : <span>{item.icon}</span>}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{user.name || user.email}</span>
          </div>
        )}
        <div className="flex items-center justify-between px-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition">
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
