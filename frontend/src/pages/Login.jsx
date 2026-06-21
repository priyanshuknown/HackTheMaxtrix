import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Layers, ArrowRight, GraduationCap, Building2, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMOS = {
  student: { email: 'aarav@student.edu',      password: 'demo123', icon: GraduationCap, color: '#6366f1' },
  funder:  { email: 'funder1@vidyafund.ai',   password: 'demo123', icon: Building2,     color: '#8b5cf6' },
  admin:   { email: 'admin@vidyafund.ai',      password: 'demo123', icon: ShieldCheck,   color: '#ec4899' },
};

const STATS = [
  { value: '₹2.4Cr', label: 'Disbursed' },
  { value: '1,200+', label: 'Students' },
  { value: '95%',    label: 'AI Accuracy' },
  { value: '48hr',   label: 'Avg. Turnaround' },
];

export default function Login() {
  const [email, setEmail]     = useState('aarav@student.edu');
  const [password, setPassword] = useState('demo123');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [role, setRole]       = useState('student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const pickRole = (r) => { setRole(r); setEmail(DEMOS[r].email); setPassword(DEMOS[r].password); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.full_name}!`);
      const routes = { student: '/student/dashboard', funder: '/funder/dashboard', admin: '/admin/dashboard' };
      navigate(routes[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        {/* Decorative orbs */}
        <div style={{ position:'absolute', top:'-10rem', right:'-10rem', width:'30rem', height:'30rem', borderRadius:'50%', background:'rgba(99,102,241,0.08)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-8rem', left:'-8rem', width:'25rem', height:'25rem', borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(60px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'3rem' }}>
            <div className="sidebar-logo-icon animate-pulse-glow">
              <Layers size={18} style={{ color:'white' }} />
            </div>
            <span style={{ fontSize:'1.25rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif' }}>VidyaFund AI</span>
          </div>

          <div className="eyebrow"><Sparkles size={10} /> AI-Verified Funding</div>
          <h1 style={{ fontSize:'clamp(2rem,4vw,2.75rem)', fontWeight:900, color:'#f1f5f9', lineHeight:1.1, marginBottom:'1rem', fontFamily:'Outfit,sans-serif' }}>
            Fund Education<br />
            <span className="gradient-text">With Confidence.</span>
          </h1>
          <p style={{ color:'#64748b', fontSize:'0.9375rem', lineHeight:1.7, maxWidth:'26rem', marginBottom:'2.5rem' }}>
            AI-powered verification connects verified students with institutional funders. No crowdfunding, no dependency — just real help when it matters.
          </p>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.08 + 0.2 }}
                style={{
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'0.875rem',
                  padding:'1rem 1.25rem',
                }}
              >
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#a5b4fc', fontFamily:'Outfit,sans-serif' }}>{s.value}</div>
                <div style={{ fontSize:'0.75rem', color:'#475569', fontWeight:600, marginTop:'0.2rem' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }}
        >
          {/* Header */}
          <div style={{ marginBottom:'1.75rem' }}>
            <div className="eyebrow"><Lock size={10} /> Secure Access</div>
            <h2 style={{ fontSize:'1.625rem', fontWeight:800, color:'#f1f5f9', marginBottom:'0.35rem', fontFamily:'Outfit,sans-serif' }}>
              Welcome back
            </h2>
            <p style={{ color:'#475569', fontSize:'0.875rem' }}>Sign in to your VidyaFund account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', alignItems:'center', gap:'0.625rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'0.75rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', color:'#fca5a5', fontSize:'0.8rem' }}
            >
              <AlertCircle size={16} style={{ flexShrink:0 }} />
              {error}
            </motion.div>
          )}

          {/* Role selector */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>
              Demo Role
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem' }}>
              {Object.entries(DEMOS).map(([r, d]) => {
                const Icon = d.icon;
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => pickRole(r)}
                    style={{
                      padding:'0.625rem 0.5rem',
                      borderRadius:'0.625rem',
                      border: isActive ? `1px solid ${d.color}50` : '1px solid rgba(255,255,255,0.07)',
                      background: isActive ? `${d.color}18` : 'rgba(255,255,255,0.03)',
                      color: isActive ? d.color : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem',
                      transition:'all 0.15s ease',
                      textTransform:'capitalize',
                    }}
                  >
                    <Icon size={16} />
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-dark"
                  style={{ height:'2.75rem' }}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>
                  Password
                </label>
                <div style={{ position:'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-dark"
                    style={{ height:'2.75rem', paddingRight:'3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'#475569', background:'none', border:'none', padding:0 }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width:'100%', height:'2.875rem', marginTop:'0.5rem', fontSize:'0.9rem' }}
              >
                {loading
                  ? <div style={{ width:'1.25rem', height:'1.25rem', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  : <><span>Sign In</span><ArrowRight size={16} /></>
                }
              </button>
            </div>
          </form>

          <p style={{ textAlign:'center', fontSize:'0.8rem', color:'#475569', marginTop:'1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#a5b4fc', fontWeight:700, textDecoration:'none' }}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
