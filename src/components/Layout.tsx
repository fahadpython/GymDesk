import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, BarChart3, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [feesAlert, setFeesAlert] = React.useState(0);

  React.useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.overdueCount > 0 || data.expiringSoonCount > 0) {
          setFeesAlert(data.overdueCount + data.expiringSoonCount);
        }
      }).catch(() => {});
  }, []);

  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/members', icon: Users, label: 'Members' },
    { to: '/fees', icon: DollarSign, label: 'Fees', alert: feesAlert },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            GD
          </div>
          <span className="text-2xl font-bold text-white">GymDesk</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map(({ to, icon: Icon, label, alert }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-lg transition-colors justify-between',
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </div>
              {alert ? (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {alert}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-3 text-sm text-slate-400 mb-2 truncate">
            {user?.name || user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-left hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
              GD
            </div>
            <span className="text-xl font-bold">GymDesk</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:bg-slate-800">
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-slate-900 border-t border-slate-800 text-slate-300 pb-4">
            {links.map(({ to, icon: Icon, label, alert }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-6 py-3 text-lg',
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
                  )
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                {alert ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {alert}
                  </span>
                ) : null}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-6 py-3 w-full text-left hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </nav>
        )}

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
