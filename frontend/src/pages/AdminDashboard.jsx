import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Clock, ShieldAlert, IndianRupee,
  Search, Eye, RefreshCw, CheckCircle,
  Filter, Sparkles, TrendingUp, ChevronDown, ChevronUp,
  User, Mail, Building, GraduationCap, Calendar, FileText,
  AlertTriangle, BarChart3
} from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const STATUS_BADGE = {
  submitted:'badge-submitted', verified:'badge-verified', matched:'badge-matched',
  approved:'badge-approved', disbursed:'badge-disbursed', completed:'badge-completed', rejected:'badge-rejected',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifyingId, setVerifyingId] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [studentDetails, setStudentDetails]   = useState({});

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => { const r = await api.get('/requests'); return Array.isArray(r.data) ? r.data : []; },
    onError: () => toast.error('Failed to load requests'),
  });

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await api.post(`/verify/${id}`);
      toast.success('AI verification complete!');
      queryClient.invalidateQueries(['admin-requests']);
    } catch { toast.error('Verification failed'); }
    finally { setVerifyingId(null); }
  };



  const toggleExpand = (reqId, studentId) => {
    if (expandedRequest === reqId) { setExpandedRequest(null); return; }
    setExpandedRequest(reqId);
    if (studentId) fetchStudentDetails(studentId);
  };

  const total     = requests.length;
  const pending   = requests.filter(r => r.status === 'submitted').length;
  const flagged   = requests.filter(r => (r.fraud_score || 0) > 70).length;
  const disbursed = requests.filter(r => ['disbursed','completed'].includes(r.status)).reduce((s,r) => s+(r.amount||0), 0);

  const filtered = requests.filter(r => {
    const ms = (r.description||'').toLowerCase().includes(search.toLowerCase()) || (r.category||'').toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || r.status === statusFilter;
    return ms && mf;
  });

  const STATS = [
    { label:'Total Requests', value:total,     icon:Users,       color:'#6366f1' },
    { label:'Pending Review', value:pending,   icon:Clock,       color:'#f59e0b' },
    { label:'High Risk',      value:flagged,   icon:ShieldAlert, color:'#ef4444' },
    { label:'Disbursed',      value:`₹${(disbursed/100000).toFixed(1)}L`, icon:IndianRupee, color:'#10b981' },
  ];

  const infoRow = (label, value, icon, color) => (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.75rem', padding:'0.875rem 1rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.375rem' }}>
        {React.createElement(icon, { size:14, style:{ color } })}
        <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#e2e8f0', wordBreak:'break-all' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <span style={{ fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>VidyaFund AI</span>
          <span style={{ fontSize:'0.75rem', color:'#ec4899', fontWeight:700 }}>ADMIN</span>
        </div>

        <div className="page-header" style={{ paddingTop:'1.75rem', marginBottom:'1.75rem' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
            <div>
              <div className="eyebrow"><BarChart3 size={10} /> Admin Console</div>
              <h1 className="page-title">Requests <span className="gradient-text">Pipeline</span></h1>
              <p className="page-subtitle">Review, verify and manage student funding requests with AI insights.</p>
            </div>
            <button
              className="btn-secondary"
              style={{ flexShrink:0, marginTop:'0.5rem' }}
              onClick={() => queryClient.invalidateQueries(['admin-requests'])}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        <div className="page-body" style={{ paddingTop:0 }}>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} className="stat-card animate-fade-up" style={{ animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.75rem', background:`${s.color}20`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <TrendingUp size={13} style={{ color:'#10b981' }} />
                  </div>
                  <div style={{ fontSize:'1.75rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.25rem' }}>{s.value}</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}>{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="glass-card" style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', alignItems:'center' }}>
              {/* Search */}
              <div style={{ flex:'1 1 240px', position:'relative' }}>
                <Search size={15} style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search requests..."
                  className="input-dark"
                  style={{ height:'2.5rem', paddingLeft:'2.5rem' }}
                />
              </div>

              {/* Status filters */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', flexWrap:'wrap' }}>
                <Filter size={14} style={{ color:'#475569' }} />
                {['all','submitted','verified','approved','disbursed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding:'0.35rem 0.875rem', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700,
                      border: statusFilter === status ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                      background: statusFilter === status ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                      color: statusFilter === status ? '#a5b4fc' : '#64748b',
                      transition:'all 0.15s ease', textTransform:'capitalize',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#94a3b8' }}>
              {filtered.length} {statusFilter === 'all' ? 'total' : statusFilter} requests
            </h2>
          </div>

          {/* Requests */}
          {isLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
              <div style={{ width:'2rem', height:'2rem', border:'2px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding:'4rem', textAlign:'center' }}>
              <Search size={32} style={{ color:'#334155', margin:'0 auto 1rem' }} />
              <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.5rem' }}>No requests found</h3>
              <p style={{ color:'#475569', fontSize:'0.875rem' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {filtered.map((req, i) => {
                const fraud = req.fraud_score || 0;
                const isHighRisk = fraud > 70;
                const isExpanded = expandedRequest === req.id;
                const student = studentDetails[req.student_id];

                return (
                  <motion.div
                    key={req.id}
                    className="glass-card animate-fade-up"
                    style={{ animationDelay:`${i*0.03}s`, overflow:'hidden', border: isHighRisk ? '1px solid rgba(239,68,68,0.25)' : undefined }}
                  >
                    {/* Main row */}
                    <div style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
                      {/* Left */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem', flexWrap:'wrap' }}>
                          <h3 style={{ fontSize:'0.9375rem', fontWeight:700, color:'#e2e8f0', textTransform:'capitalize' }}>
                            {(req.category||'').replace(/_/g,' ')}
                          </h3>
                          <span className={`badge ${STATUS_BADGE[req.status]||''}`}>{req.status}</span>
                          {isHighRisk && (
                            <span className="badge" style={{ background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' }}>
                              <AlertTriangle size={10} /> High Risk
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'0.5rem', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {req.description}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', gap:'1rem', fontSize:'0.8rem' }}>
                          <span style={{ color:'#e2e8f0', fontWeight:700, fontFamily:'Outfit,sans-serif' }}>₹{(req.amount||0).toLocaleString()}</span>
                          {req.verification_score && (
                            <span style={{ color: req.verification_score >= 80 ? '#10b981' : req.verification_score >= 50 ? '#f59e0b' : '#ef4444', fontWeight:700 }}>
                              <Sparkles size={12} style={{ display:'inline', marginRight:'3px' }} />
                              AI {req.verification_score}/100
                            </span>
                          )}
                          {fraud > 0 && (
                            <span style={{ color: fraud > 70 ? '#ef4444' : fraud > 40 ? '#f59e0b' : '#10b981', fontWeight:600 }}>
                              Risk {fraud}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                        {req.status === 'submitted' && (
                          <button
                            onClick={() => handleVerify(req.id)}
                            disabled={verifyingId === req.id}
                            className="btn-primary"
                            style={{ fontSize:'0.8rem', padding:'0.45rem 0.875rem' }}
                          >
                            {verifyingId === req.id
                              ? <div style={{ width:'1rem', height:'1rem', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                              : <><CheckCircle size={14} /> Verify</>
                            }
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/status/${req.id}`)}
                          className="icon-btn"
                          title="View Status"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => toggleExpand(req.id, req.student_id)}
                          className="icon-btn"
                          title="Student Details"
                          style={{ color: isExpanded ? '#a5b4fc' : undefined, background: isExpanded ? 'rgba(99,102,241,0.12)' : undefined }}
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded student details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height:0, opacity:0 }}
                        animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }}
                        transition={{ duration:0.25 }}
                        style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(99,102,241,0.04)', padding:'1.25rem' }}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1rem' }}>
                          <div style={{ width:'2rem', height:'2rem', borderRadius:'0.5rem', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <User size={16} style={{ color:'#6366f1' }} />
                          </div>
                          <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.875rem' }}>Student Information</span>
                        </div>

                        {student ? (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'0.625rem' }}>
                            {infoRow('Full Name', student.full_name, User, '#6366f1')}
                            {infoRow('Email', student.email, Mail, '#8b5cf6')}
                            {infoRow('Institution', student.institution, Building, '#10b981')}
                            {infoRow('Enrollment ID', student.enrollment_id, GraduationCap, '#f59e0b')}
                            {infoRow('Joined', student.created_at ? new Date(student.created_at).toLocaleDateString() : null, Calendar, '#ec4899')}
                            {infoRow('Request Count', requests.filter(r=>r.student_id===req.student_id).length, FileText, '#a5b4fc')}
                          </div>
                        ) : (
                          <div style={{ display:'flex', justifyContent:'center', padding:'1.5rem' }}>
                            <div style={{ width:'1.5rem', height:'1.5rem', border:'2px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                          </div>
                        )}

                        <div style={{ marginTop:'0.875rem', paddingTop:'0.875rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'0.5rem' }}>
                          <div style={{ fontSize:'0.8rem', color:'#64748b' }}>
                            Deadline: <span style={{ color:'#e2e8f0', fontWeight:700 }}>{req.deadline_date ? new Date(req.deadline_date).toLocaleDateString() : '—'}</span>
                          </div>
                          <div style={{ fontSize:'0.8rem', color:'#64748b' }}>
                            Submitted: <span style={{ color:'#e2e8f0', fontWeight:700 }}>{req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
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
