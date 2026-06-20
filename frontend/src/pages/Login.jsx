import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.full_name}!`);
      const routes = { student: '/student/dashboard', funder: '/funder/dashboard', admin: '/admin/dashboard' };
      navigate(routes[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to VidyaFund AI</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 animate-fade-in-up stagger-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com" required autoFocus />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Demo */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Quick Demo Access</p>
            <div className="flex gap-2">
              {[
                { label: 'Student', email: 'aarav@student.edu', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                { label: 'Funder', email: 'funder1@vidyafund.ai', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                { label: 'Admin', email: 'admin@vidyafund.ai', cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
              ].map((d) => (
                <button key={d.email} type="button"
                  onClick={() => { setEmail(d.email); setPassword('demo123'); }}
                  className={`flex-1 text-xs py-1.5 rounded-md border font-semibold transition-colors ${d.cls}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
