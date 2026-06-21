import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import {
  PlusCircle, Clock, CheckCircle2, IndianRupee,
  ChevronRight, FileText, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { getCategoryLabel, getStatusBadgeClass, formatDate, cn } from '../lib/utils';

const STATUS_STEP = { submitted:0, verified:1, matched:2, approved:3, disbursed:4, completed:4 };
const STEPS_LABEL = ['Submitted','Verified','Matched','Approved','Funded'];

const BADGE_STYLE = {
  submitted: 'badge-submitted', verified:'badge-verified', matched:'badge-matched',
  approved:'badge-approved', disbursed:'badge-disbursed', completed:'badge-completed', rejected:'badge-rejected',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['student-requests'],
    queryFn: async () => { const r = await api.get('/requests'); return Array.isArray(r.data) ? r.data : []; },
    onError: () => toast.error('Failed to load requests'),
  });

  const funded  = requests.filter(r => ['disbursed','completed'].includes(r.status));
  const active  = requests.filter(r => !['rejected','completed'].includes(r.status)).length;
  const totalAmt = funded.reduce((s,r) => s + (r.amount||0), 0);
  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  const STATS = [
    { label:'Active Requests', value: active,            icon: Clock,         color:'#6366f1', glow:'rgba(99,102,241,0.2)'  },
    { label:'Funded',          value: funded.length,     icon: CheckCircle2,  color:'#10b981', glow:'rgba(16,185,129,0.2)'  },
    { label:'Total Received',  value:`₹${totalAmt.toLocaleString()}`, icon:IndianRupee, color:'#8b5cf6', glow:'rgba(139,92,246,0.2)' },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <span style={{ fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>VidyaFund AI</span>
          <button className="btn-primary" style={{ padding:'0.4rem 0.875rem', fontSize:'0.8rem' }} onClick={() => navigate('/student/request')}>
            <PlusCircle size={14} /> New
          </button>
        </div>

        {/* Page header */}
        <div className="page-header" style={{ marginBottom:'1.75rem' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', paddingTop:'1.75rem' }}>
            <div>
              <div className="eyebrow"><Zap size={10} /> Student Workspace</div>
              <h1 className="page-title">
                Hello, <span className="gradient-text">{firstName}</span> 👋
              </h1>
              <p className="page-subtitle">Track your funding requests and verification milestones.</p>
            </div>
            <button className="btn-primary" style={{ flexShrink:0, marginTop:'0.5rem' }} onClick={() => navigate('/student/request')}>
              <PlusCircle size={16} /> New Request
            </button>
          </div>
        </div>

        <div className="page-body" style={{ paddingTop:0 }}>
          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} className="stat-card animate-fade-up" style={{ animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.75rem', background:`${s.color}20`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <TrendingUp size={14} style={{ color:'#10b981' }} />
                  </div>
                  <div style={{ fontSize:'1.875rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.25rem' }}>{s.value}</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}>{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Applications */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0' }}>
              Your Applications
            </h2>
            <span style={{ fontSize:'0.75rem', color:'#475569', background:'rgba(255,255,255,0.05)', padding:'0.25rem 0.75rem', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)' }}>
              {requests.length} total
            </span>
          </div>

          {isLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
              <div style={{ width:'2rem', height:'2rem', border:'2px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card" style={{ padding:'4rem', textAlign:'center' }}>
              <div style={{ width:'4rem', height:'4rem', borderRadius:'1rem', background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', border:'1px solid rgba(99,102,241,0.2)' }}>
                <FileText size={28} style={{ color:'#6366f1' }} />
              </div>
              <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.5rem' }}>No applications yet</h3>
              <p style={{ color:'#475569', marginBottom:'1.25rem', fontSize:'0.875rem' }}>Submit your first funding request to get started</p>
              <button className="btn-primary" onClick={() => navigate('/student/request')}>
                <PlusCircle size={16} /> Submit Request
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {requests.map((req, i) => {
                const step = STATUS_STEP[req.status] ?? 0;
                return (
                  <motion.div
                    key={req.id}
                    className="request-card animate-fade-up"
                    style={{ animationDelay:`${i*0.04}s` }}
                    onClick={() => navigate(`/status/${req.id}`)}
                  >
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', marginBottom:'0.875rem' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem' }}>
                          <h3 style={{ fontSize:'0.9375rem', fontWeight:700, color:'#e2e8f0' }}>{getCategoryLabel(req.category)}</h3>
                          <span className={`badge ${BADGE_STYLE[req.status] || ''}`}>{req.status}</span>
                        </div>
                        <p style={{ fontSize:'0.8rem', color:'#64748b', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {req.description}
                        </p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>₹{(req.amount||0).toLocaleString()}</div>
                        <div style={{ fontSize:'0.7rem', color:'#475569' }}>Due {formatDate(req.deadline_date)}</div>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.625rem' }}>
                      {STEPS_LABEL.map((label, idx) => {
                        const done = idx <= step;
                        return (
                          <div key={idx} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem' }}>
                            <div style={{ width:'100%', height:'3px', borderRadius:'2px', background: done ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.08)' }} />
                            <span style={{ fontSize:'0.6rem', color: done ? '#a5b4fc' : '#334155', fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.625rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize:'0.75rem', color:'#475569' }}>
                        {req.verification_score ? `AI Score: ${req.verification_score}/100` : 'Pending verification'}
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.75rem', color:'#6366f1', fontWeight:600 }}>
                        View Details <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
