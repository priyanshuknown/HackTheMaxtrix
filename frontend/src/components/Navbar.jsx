import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Building2, Shield, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  // All pages now use dedicated sidebars — navbar is fully disabled
  return null;

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) {
    return null;
  }

  const navItems = {
    student: [
      { to: '/student/request', label: 'New Request' },
      { to: '/student/dashboard', label: 'My Requests' },
    ],
    funder: [
      { to: '/funder/dashboard', label: 'Dashboard' },
    ],
    admin: [
      { to: '/admin', label: 'Admin Panel' },
      { to: '/funder/dashboard', label: 'Funder View' },
    ],
  };

  const roleIcon = {
    student: <GraduationCap size={15} />,
    funder: <Building2 size={15} />,
    admin: <Shield size={15} />,
  };

  const roleColor = {
    student: 'bg-emerald-100 text-emerald-700',
    funder: 'bg-blue-100 text-blue-700',
    admin: 'bg-amber-100 text-amber-700',
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            VidyaFund AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {(navItems[user.role] || []).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all no-underline ${
                  isActive
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User badge + Logout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${roleColor[user.role]}`}>
              {roleIcon[user.role]}
            </div>
            <span className="text-sm text-slate-700 font-medium">{user.full_name}</span>
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border border-slate-200">
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Logout">
            <LogOut size={17} />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-5 pb-4 space-y-1 bg-white border-t border-slate-100 pt-3 shadow-lg">
          {(navItems[user.role] || []).map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg no-underline transition-all font-medium">
              {item.label}
            </Link>
          ))}
          <div className="section-divider my-2" />
          <button onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
