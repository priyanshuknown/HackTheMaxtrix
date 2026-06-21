import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, GraduationCap, Building2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'exam_fee',         label: 'Exam Fee' },
  { value: 'certification_fee',label: 'Certification' },
  { value: 'device_repair',    label: 'Device Repair' },
  { value: 'interview_travel', label: 'Interview Travel' },
];

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', role: 'student',
    institution: '', enrollment_id: '',
    org_name: '', funder_type: 'csr_program', categories_supported: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const toggleCat = (c) => {
    const cats = form.categories_supported.includes(c)
      ? form.categories_supported.filter(x => x !== c)
      : [...form.categories_supported, c];
    setForm({ ...form, categories_supported: cats });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created!');
      navigate({ student: '/student/dashboard', funder: '/funder/dashboard' }[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const labelStyle = { display:'block', fontSize:'0.72rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' };
  const sectionStyle = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1rem', padding:'1.25rem' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1.25rem', background:'#0a0a0f', backgroundImage:'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)' }}>
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        style={{ width:'100%', maxWidth:'560px' }}
      >
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div className="sidebar-logo-icon animate-pulse-glow" style={{ margin:'0 auto 1rem', width:'3rem', height:'3rem' }}>
            <Layers size={22} style={{ color:'white' }} />
          </div>
          <h1 style={{ fontSize:'2rem', fontWeight:900, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>
            Join VidyaFund AI
          </h1>
          <p style={{ color:'#475569', fontSize:'0.875rem' }}>Verified, accountable educational funding</p>
        </div>

        <div className="auth-card" style={{ maxWidth:'100%' }}>
          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'0.75rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', color:'#fca5a5', fontSize:'0.8rem' }}>
              <AlertCircle size={16} style={{ flexShrink:0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {/* Role toggle */}
              <div>
                <label style={labelStyle}>Account Type</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  {[
                    { value:'student', label:'Student',   icon: GraduationCap, color:'#6366f1' },
                    { value:'funder',  label:'Funder',    icon: Building2,     color:'#8b5cf6' },
                  ].map(r => {
                    const Icon = r.icon;
                    const active = form.role === r.value;
                    return (
                      <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                        style={{
                          display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem',
                          borderRadius:'0.75rem', fontWeight:700, fontSize:'0.875rem',
                          border: active ? `1px solid ${r.color}40` : '1px solid rgba(255,255,255,0.07)',
                          background: active ? `${r.color}15` : 'rgba(255,255,255,0.03)',
                          color: active ? r.color : '#64748b', transition:'all 0.15s ease',
                        }}
                      >
                        <Icon size={18} />{r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic info */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.full_name} onChange={set('full_name')} className="input-dark" placeholder="Your name" required style={{ height:'2.75rem' }} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} className="input-dark" placeholder="you@example.com" required style={{ height:'2.75rem' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.password} onChange={set('password')} className="input-dark" placeholder="Min 6 characters" required minLength={6} style={{ height:'2.75rem' }} />
              </div>

              {/* Student Fields */}
              {form.role === 'student' && (
                <div style={sectionStyle}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
                    <GraduationCap size={16} style={{ color:'#6366f1' }} />
                    <span style={{ fontWeight:700, color:'#a5b4fc', fontSize:'0.875rem' }}>Student Details</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                    <div>
                      <label style={labelStyle}>Institution</label>
                      <input value={form.institution} onChange={set('institution')} className="input-dark" placeholder="University name" required style={{ height:'2.75rem' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Enrollment ID</label>
                      <input value={form.enrollment_id} onChange={set('enrollment_id')} className="input-dark" placeholder="STU-2024-001" required style={{ height:'2.75rem' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Funder Fields */}
              {form.role === 'funder' && (
                <div style={sectionStyle}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
                    <Building2 size={16} style={{ color:'#8b5cf6' }} />
                    <span style={{ fontWeight:700, color:'#c4b5fd', fontSize:'0.875rem' }}>Funder Details</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'0.875rem' }}>
                    <div>
                      <label style={labelStyle}>Organization Name</label>
                      <input value={form.org_name} onChange={set('org_name')} className="input-dark" placeholder="Organization" required style={{ height:'2.75rem' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Funder Type</label>
                      <select value={form.funder_type} onChange={set('funder_type')} className="input-dark" style={{ height:'2.75rem' }}>
                        <option value="csr_program">CSR Program</option>
                        <option value="alumni_association">Alumni Association</option>
                        <option value="college_welfare">College Welfare</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Categories You Fund</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.35rem' }}>
                      {CATEGORIES.map(c => {
                        const active = form.categories_supported.includes(c.value);
                        return (
                          <button key={c.value} type="button" onClick={() => toggleCat(c.value)}
                            style={{
                              padding:'0.4rem 0.875rem', borderRadius:'0.5rem', fontSize:'0.8rem', fontWeight:600,
                              border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                              background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                              color: active ? '#c4b5fd' : '#64748b', transition:'all 0.15s ease',
                            }}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', height:'2.875rem', fontSize:'0.9rem' }}>
                {loading
                  ? <div style={{ width:'1.25rem', height:'1.25rem', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  : <><span>Create Account</span><ArrowRight size={16} /></>
                }
              </button>

              <p style={{ textAlign:'center', fontSize:'0.8rem', color:'#475569' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color:'#a5b4fc', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
