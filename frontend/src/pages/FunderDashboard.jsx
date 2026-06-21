import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import {
  HandHeart, TrendingUp, Award, Sparkles, History,
  ShieldCheck, Zap, CheckCircle2, ChevronRight, ExternalLink
} from 'lucide-react';

const CAT = {
  exam_fee:         { label:'Exam Fee',         color:'#6366f1' },
  certification_fee:{ label:'Certification',    color:'#8b5cf6' },
  device_repair:    { label:'Device Repair',    color:'#f59e0b' },
  interview_travel: { label:'Interview Travel', color:'#10b981' },
};

export default function FunderDashboard() {
  const [tab, setTab] = useState('discover');
  const [actionLoading, setActionLoading] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['funder-requests'],
    queryFn: async () => { const r = await api.get('/requests'); return Array.isArray(r.data) ? r.data : []; },
    onError: () => toast.error('Failed to load requests'),
  });

  const handleDisburse = async (id) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      const matchRes = await api.get(`/match/${id}`);
      const topMatch = matchRes.data.matches?.[0];
      if (!topMatch) throw new Error('No matches found');
      const res = await api.post(`/disburse/${topMatch.match_id}`);
      await api.post('/verify-payment', {
        razorpay_order_id: res.data.razorpay_order_id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      });
      toast.success('Funds disbursed successfully!');
      queryClient.invalidateQueries(['funder-requests']);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Disbursement failed');
    } finally { setActionLoading(p => ({ ...p, [id]: false })); }
  };

  const pending = requests.filter(r => ['verified','matched','approved'].includes(r.status));
  const history = requests.filter(r => ['disbursed','completed'].includes(r.status));
  const totalDisbursed = history.reduce((s, r) => s + (r.amount || 0), 0);
  const firstName = user?.full_name?.split(' ')[0] || 'Partner';

  const STATS = [
    { label:'Waiting to Fund', value: pending.length,                        icon: HandHeart,  color:'#8b5cf6' },
    { label:'Students Helped',  value: history.length,                        icon: Award,      color:'#10b981' },
    { label:'Total Impact',     value:`₹${(totalDisbursed/1000).toFixed(0)}K`, icon: TrendingUp, color:'#6366f1' },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <span style={{ fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>VidyaFund AI</span>
          <span style={{ fontSize:'0.75rem', color:'#8b5cf6', fontWeight:700 }}>FUNDER</span>
        </div>

        <div className="page-header" style={{ paddingTop:'1.75rem', marginBottom:'1.75rem' }}>
          <div className="eyebrow"><Sparkles size={10} /> Funder Console</div>
          <h1 className="page-title">
            Welcome, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="page-subtitle">Fund verified student requests and track your education impact.</p>
        </div>

        <div className="page-body" style={{ paddingTop:0 }}>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} className="stat-card animate-fade-up" style={{ animationDelay:`${i*0.07}s` }}>
                  <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.75rem', background:`${s.color}20`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <div style={{ fontSize:'1.875rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.25rem' }}>{s.value}</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}>{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:'0.375rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.875rem', padding:'0.375rem', width:'fit-content', marginBottom:'1.75rem' }}>
            {[{ key:'discover', label:'Discovery Feed', icon:Sparkles }, { key:'history', label:'My Impact', icon:History }].map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    padding:'0.5rem 1.25rem', borderRadius:'0.625rem',
                    fontWeight:700, fontSize:'0.85rem', transition:'all 0.15s ease',
                    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                    color: active ? 'white' : '#64748b',
                    border:'none', boxShadow: active ? '0 4px 15px rgba(99,102,241,0.25)' : 'none',
                  }}
                >
                  <Icon size={15} />{t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === 'discover' && (
              <motion.div key="discover" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }} transition={{ duration:0.2 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <h2 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0' }}>Verified Student Requests</h2>
                  <span style={{ fontSize:'0.75rem', color:'#475569', background:'rgba(255,255,255,0.05)', padding:'0.25rem 0.75rem', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    {pending.length} available
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
                    <div style={{ width:'2rem', height:'2rem', border:'2px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  </div>
                ) : pending.length === 0 ? (
                  <div className="glass-card" style={{ padding:'4rem', textAlign:'center' }}>
                    <div style={{ width:'4rem', height:'4rem', borderRadius:'1rem', background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', border:'1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 size={28} style={{ color:'#10b981' }} />
                    </div>
                    <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.5rem' }}>All caught up!</h3>
                    <p style={{ color:'#475569', fontSize:'0.875rem' }}>No requests waiting for funding right now.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                    {pending.map((req, i) => {
                      const cat = CAT[req.category] || { label: req.category, color:'#6366f1' };
                      const matchPct = req.verification_score ? Math.min(98, req.verification_score + 5) : 87;
                      return (
                        <motion.div
                          key={req.id}
                          className="request-card animate-fade-up"
                          style={{ animationDelay:`${i*0.05}s`, cursor:'default' }}
                        >
                          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              {/* Category chip */}
                              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
                                <span style={{ padding:'0.25rem 0.75rem', borderRadius:'0.5rem', fontSize:'0.75rem', fontWeight:700, background:`${cat.color}15`, border:`1px solid ${cat.color}30`, color:cat.color }}>
                                  {cat.label}
                                </span>
                                <span style={{ fontSize:'0.7rem', fontWeight:700, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', padding:'0.2rem 0.5rem', borderRadius:'999px' }}>
                                  URGENT
                                </span>
                              </div>

                              <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginBottom:'0.75rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                {req.description}
                              </p>

                              {/* Signals */}
                              <div style={{ display:'flex', alignItems:'center', gap:'1rem', fontSize:'0.8rem' }}>
                                <span style={{ display:'flex', alignItems:'center', gap:'0.375rem', color:'#10b981', fontWeight:600 }}>
                                  <ShieldCheck size={14} /> AI Verified
                                </span>
                                {req.verification_score && (
                                  <span style={{ display:'flex', alignItems:'center', gap:'0.375rem', color:'#a5b4fc', fontWeight:600 }}>
                                    <Zap size={14} /> {req.verification_score}/100
                                  </span>
                                )}
                                <span style={{ color:'#64748b', fontWeight:600 }}>{matchPct}% Match</span>
                              </div>
                            </div>

                            {/* Amount + action */}
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{ fontSize:'1.75rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.25rem' }}>
                                ₹{(req.amount||0).toLocaleString()}
                              </div>
                              <div style={{ fontSize:'0.7rem', color:'#475569', marginBottom:'0.875rem' }}>Funding needed</div>
                              <button
                                onClick={() => handleDisburse(req.id)}
                                disabled={actionLoading[req.id]}
                                className="btn-success"
                                style={{ fontSize:'0.8rem', padding:'0.5rem 1.125rem' }}
                              >
                                {actionLoading[req.id]
                                  ? <div style={{ width:'1rem', height:'1rem', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                                  : <><HandHeart size={15} /> Fund Now</>
                                }
                              </button>
                            </div>
                          </div>

                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'0.875rem', paddingTop:'0.75rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize:'0.75rem', color:'#475569' }}>
                              {req.academic_year ? `AY ${req.academic_year}` : 'Student verified'}
                            </span>
                            <button onClick={() => navigate(`/status/${req.id}`)} style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.75rem', color:'#6366f1', fontWeight:600, background:'none', border:'none' }}>
                              View Details <ExternalLink size={12} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <h2 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0' }}>Contribution History</h2>
                  <span style={{ fontSize:'0.75rem', color:'#475569', background:'rgba(255,255,255,0.05)', padding:'0.25rem 0.75rem', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    {history.length} students
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="glass-card" style={{ padding:'4rem', textAlign:'center' }}>
                    <div style={{ width:'4rem', height:'4rem', borderRadius:'1rem', background:'rgba(139,92,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', border:'1px solid rgba(139,92,246,0.2)' }}>
                      <History size={28} style={{ color:'#8b5cf6' }} />
                    </div>
                    <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.5rem' }}>No contributions yet</h3>
                    <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'1.25rem' }}>Switch to Discovery Feed to start making an impact</p>
                    <button className="btn-primary" onClick={() => setTab('discover')}>Explore Requests</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                    {history.map((req, i) => {
                      const cat = CAT[req.category] || { label: req.category, color:'#6366f1' };
                      return (
                        <motion.div
                          key={req.id}
                          className="glass-card animate-fade-up"
                          style={{ padding:'1rem 1.25rem', animationDelay:`${i*0.04}s`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}
                        >
                          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                            <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.75rem', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <CheckCircle2 size={18} style={{ color:'#10b981' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.875rem' }}>{cat.label}</div>
                              <div style={{ fontSize:'0.75rem', color:'#475569' }}>Student verified • Disbursed</div>
                            </div>
                          </div>
                          <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#10b981', fontFamily:'Outfit,sans-serif' }}>
                            ₹{(req.amount||0).toLocaleString()}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
