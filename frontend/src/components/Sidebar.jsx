import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers, LayoutDashboard, FileText, PlusCircle,
  Building2, ShieldCheck, BarChart3, LogOut,
  ChevronRight, Sparkles, Users, Zap
} from 'lucide-react';

const NAV = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'New Request',  icon: PlusCircle,    path: '/student/request'   },
  ],
  funder: [
    { label: 'Discovery Feed', icon: Sparkles,       path: '/funder/dashboard' },
    { label: 'My Impact',      icon: BarChart3,      path: '/funder/dashboard' },
  ],
  admin: [
    { label: 'Requests Pipeline', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users',             icon: Users,          path: '/admin/dashboard' },
    { label: 'Analytics',         icon: BarChart3,      path: '/admin/dashboard' },
  ],
};

const ROLE_CONFIG = {
  student: { label: 'Student', color: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
  funder:  { label: 'Funder',  color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  admin:   { label: 'Admin',   color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'student';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const links = NAV[role] || [];
  const initials = (user?.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Layers size={16} style={{ color: 'white' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif' }}>
            VidyaFund
          </div>
          <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, letterSpacing: '0.04em' }}>
            AI Platform
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '0.75rem 1.25rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: `${cfg.color}18`,
          border: `1px solid ${cfg.color}30`,
          borderRadius: '0.625rem',
        }}>
          <div style={{
            width: '0.5rem', height: '0.5rem', borderRadius: '50%',
            background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {cfg.label} Console
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: '1px solid transparent' }}
            >
              <Icon size={16} className="nav-icon" />
              {link.label}
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#6366f1' }} />}
            </button>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>System</div>
        <button
          className="nav-link"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: '1px solid transparent', color: '#64748b' }}
        >
          <LogOut size={16} className="nav-icon" />
          Sign Out
        </button>
      </nav>

      {/* Footer — user card */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
