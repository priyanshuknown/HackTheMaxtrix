import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Layers, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_CREDS = {
  student: { email: 'aarav@student.edu', password: 'demo123' },
  funder:  { email: 'funder1@vidyafund.ai', password: 'demo123' },
  admin:   { email: 'admin@vidyafund.ai', password: 'demo123' },
};

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [role, setRole]         = useState('student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const pickRole = (r) => {
    setRole(r);
    setEmail(DEMO_CREDS[r].email);
    setPassword(DEMO_CREDS[r].password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome, ${data.full_name}!`);
      const routes = { student: '/student/dashboard', funder: '/funder/dashboard', admin: '/admin/dashboard' };
      navigate(routes[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-600 rounded-xl mb-4 shadow-md shadow-indigo-200">
            <Layers size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VidyaFund AI</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">

          {/* Role Selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Select your role</p>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'funder', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRole(r)}
                  className={`py-2 rounded-lg text-xs font-semibold capitalize transition border ${
                    role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Demo credentials auto-filled. Click Sign In to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@school.edu"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-gray-500">
          New here?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
