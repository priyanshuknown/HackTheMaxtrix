import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Send, ShieldCheck, Zap, CheckCircle2, IndianRupee, FileText,
  Clock, ArrowLeft, AlertTriangle, BookOpen, Award, Wrench,
  Plane, Calendar, Layers
} from 'lucide-react';

const CAT_META = {
  exam_fee:         { icon: BookOpen, label:'Exam Fee',         color:'#6366f1', glow:'rgba(99,102,241,0.2)' },
  certification_fee:{ icon: Award,    label:'Certification',    color:'#8b5cf6', glow:'rgba(139,92,246,0.2)' },
  device_repair:    { icon: Wrench,   label:'Device Repair',    color:'#f59e0b', glow:'rgba(245,158,11,0.2)' },
  interview_travel: { icon: Plane,    label:'Interview Travel', color:'#10b981', glow:'rgba(16,185,129,0.2)' },
};

const STATUS_STEPS = [
  { key:'submitted', label:'Submitted', icon: Send,         desc:'Request submitted and queued for review' },
  { key:'verified',  label:'Verified',  icon: ShieldCheck,  desc:'AI verification completed successfully' },
  { key:'matched',   label:'Matched',   icon: Zap,          desc:'Matched with institutional funder' },
  { key:'approved',  label:'Approved',  icon: CheckCircle2, desc:'Funder approved the funding request' },
  { key:'disbursed', label:'Disbursed', icon: IndianRupee,  desc:'Funds disbursed via Razorpay' },
  { key:'completed', label:'Completed', icon: FileText,     desc:'Impact report generated' },
];

export default function StatusTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequest(); }, [id]);

  async function fetchRequest() {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch { toast.error('Failed to load request'); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'2.5rem', height:'2.5rem', border:'2px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!request) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'5rem', height:'5rem', borderRadius:'1.25rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <AlertTriangle size={32} style={{ color:'#f87171' }} />
        </div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', marginBottom:'0.5rem', fontFamily:'Outfit,sans-serif' }}>Request Not Found</h2>
        <p style={{ color:'#475569', marginBottom:'1.5rem', fontSize:'0.875rem' }}>This request doesn't exist or you don't have access.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Go Back</button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === request.status);
  const isRejected = request.status === 'rejected';
  const cat = CAT_META[request.category] || { label: request.category, color:'#6366f1', glow:'rgba(99,102,241,0.2)', icon: BookOpen };
  const CatIcon = cat.icon;
  const progress = Math.max(0, Math.min(100, ((currentIdx + 1) / STATUS_STEPS.length) * 100));

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', backgroundImage:'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      {/* Header */}
      <header style={{ height:'3.75rem', background:'rgba(13,13,22,0.95)', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', padding:'0 1.5rem', gap:'1rem', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => navigate(-1)} style={{ width:'2.25rem', height:'2.25rem', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'0.5rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <div className="sidebar-logo-icon" style={{ width:'1.875rem', height:'1.875rem' }}>
            <Layers size={14} style={{ color:'white' }} />
          </div>
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>Request Status</div>
            <div style={{ fontSize:'0.65rem', color:'#475569' }}>Funding pipeline tracker</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'2rem 1.25rem 4rem' }}>
        {/* Request card */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          style={{ background:`${cat.color}08`, border:`1px solid ${cat.color}25`, borderRadius:'1.25rem', padding:'1.75rem', marginBottom:'1.5rem', position:'relative', overflow:'hidden' }}
        >
          {/* BG glow */}
          <div style={{ position:'absolute', top:'-4rem', right:'-4rem', width:'15rem', height:'15rem', borderRadius:'50%', background: cat.glow, filter:'blur(50px)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'0.7rem', color:'#475569', fontFamily:'monospace', marginBottom:'0.875rem' }}>
              ID: {(request.id||'').slice(0,16)}...
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'1rem', background:`${cat.color}18`, border:`1px solid ${cat.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 0 20px ${cat.glow}` }}>
                  <CatIcon size={24} style={{ color: cat.color }} />
                </div>
                <div>
                  <h2 style={{ fontSize:'1.375rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>{cat.label}</h2>
                  <p style={{ fontSize:'0.8rem', color:'#64748b' }}>Funding Request</p>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'2rem', fontWeight:900, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>
                  ₹{(request.amount||0).toLocaleString()}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.75rem', color:'#64748b', justifyContent:'flex-end' }}>
                  <Calendar size={12} /> {request.deadline_date}
                </div>
              </div>
            </div>

            <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:'0.75rem', padding:'0.875rem 1rem', marginBottom:'1rem', fontSize:'0.875rem', color:'#94a3b8', lineHeight:1.6 }}>
              {request.description}
            </div>

            {/* Meta chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
              {request.verification_score && (
                <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.3rem 0.75rem', borderRadius:'999px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7', fontSize:'0.75rem', fontWeight:700 }}>
                  <ShieldCheck size={13} /> Score: {request.verification_score}/100
                </span>
              )}
              {request.urgency_level && (
                <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.3rem 0.75rem', borderRadius:'999px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#fbbf24', fontSize:'0.75rem', fontWeight:700 }}>
                  <Zap size={13} /> {request.urgency_level} Priority
                </span>
              )}
              {request.academic_year && (
                <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.3rem 0.75rem', borderRadius:'999px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#a5b4fc', fontSize:'0.75rem', fontWeight:700 }}>
                  <Calendar size={13} /> AY {request.academic_year}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pipeline tracker */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.1 }}
          className="glass-card"
          style={{ padding:'1.75rem' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <h3 style={{ fontSize:'1.125rem', fontWeight:800, color:'#e2e8f0', fontFamily:'Outfit,sans-serif' }}>Funding Pipeline</h3>
            {!isRejected && (
              <span style={{ fontSize:'0.75rem', color:'#a5b4fc', fontWeight:700 }}>
                {Math.round(progress)}% complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {!isRejected && (
            <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden', marginBottom:'2rem' }}>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${progress}%` }}
                transition={{ duration:0.8, ease:'easeOut' }}
                style={{ height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)', borderRadius:'3px' }}
              />
            </div>
          )}

          {isRejected ? (
            <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'1.25rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'1rem' }}>
              <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.75rem', background:'rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <AlertTriangle size={20} style={{ color:'#f87171' }} />
              </div>
              <div>
                <h4 style={{ fontWeight:700, color:'#f87171', marginBottom:'0.4rem' }}>Request Rejected</h4>
                <p style={{ fontSize:'0.85rem', color:'#ef4444', lineHeight:1.6, opacity:0.8 }}>
                  This request did not meet verification criteria. Please contact your institution for assistance.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {STATUS_STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isCompleted = i <= currentIdx;
                const isCurrent = i === currentIdx;
                const isLast = i === STATUS_STEPS.length - 1;

                return (
                  <motion.div
                    key={s.key}
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{ display:'flex', gap:'1.25rem', paddingBottom: isLast ? 0 : '0', position:'relative' }}
                  >
                    {/* Connector line */}
                    {!isLast && (
                      <div style={{
                        position:'absolute', left:'1.4375rem', top:'3rem', width:'2px', height:'calc(100% - 1rem)',
                        background: isCompleted && !isCurrent ? 'linear-gradient(180deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                      }} />
                    )}

                    {/* Step icon */}
                    <div style={{
                      width:'2.875rem', height:'2.875rem', borderRadius:'0.875rem', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1,
                      background: isCompleted
                        ? isCurrent ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border: isCompleted
                        ? isCurrent ? 'none' : '1px solid rgba(99,102,241,0.3)'
                        : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: isCurrent ? '0 0 20px rgba(99,102,241,0.35)' : 'none',
                      transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      marginBottom: '0',
                    }}>
                      <StepIcon size={16} style={{ color: isCompleted ? (isCurrent ? 'white' : '#a5b4fc') : '#334155' }} />
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop:'0.5rem', paddingBottom:'1.75rem', flex:1, opacity: isCompleted ? 1 : 0.35 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.25rem' }}>
                        <h4 style={{ fontSize:'0.9rem', fontWeight:700, color: isCompleted ? '#e2e8f0' : '#475569' }}>{s.label}</h4>
                        {isCurrent && (
                          <span style={{ fontSize:'0.65rem', fontWeight:800, padding:'0.15rem 0.5rem', borderRadius:'999px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', letterSpacing:'0.04em' }}>
                            CURRENT
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#10b981' }}>✓ Done</span>
                        )}
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'#475569' }}>{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
