import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'exam_fee', label: 'Exam Fee' },
  { value: 'certification_fee', label: 'Certification' },
  { value: 'device_repair', label: 'Device Repair' },
  { value: 'interview_travel', label: 'Interview Travel' },
];

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', role: 'student',
    institution: '', enrollment_id: '', org_name: '', funder_type: 'csr_program',
    categories_supported: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleCat = (cat) => {
    const cats = form.categories_supported.includes(cat)
      ? form.categories_supported.filter((c) => c !== cat)
      : [...form.categories_supported, cat];
    setForm({ ...form, categories_supported: cats });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created!');
      const routes = { student: '/student/dashboard', funder: '/funder/dashboard', admin: '/funder/dashboard' };
      navigate(routes[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join VidyaFund AI</h1>
          <p className="text-slate-500 text-sm mt-1">Institutional student-funding platform</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 animate-fade-in-up stagger-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input value={form.full_name} onChange={set('full_name')} className="input-field" placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="you@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" value={form.password} onChange={set('password')} className="input-field" placeholder="Min 6 chars" required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role</label>
              <select value={form.role} onChange={set('role')} className="input-field bg-white">
                <option value="student">Student</option>
                <option value="funder">Institutional Funder</option>
              </select>
            </div>
          </div>

          {form.role === 'student' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Institution</label>
                <input value={form.institution} onChange={set('institution')} className="input-field" placeholder="University" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Enrollment ID</label>
                <input value={form.enrollment_id} onChange={set('enrollment_id')} className="input-field" placeholder="STU-2024-001" required />
              </div>
            </div>
          )}

          {form.role === 'funder' && (
            <div className="space-y-3 p-3 rounded-lg bg-blue-50 border border-blue-100 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1.5">Organization</label>
                  <input value={form.org_name} onChange={set('org_name')} className="input-field" placeholder="Org name" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1.5">Funder Type</label>
                  <select value={form.funder_type} onChange={set('funder_type')} className="input-field bg-white">
                    <option value="csr_program">CSR Program</option>
                    <option value="alumni_association">Alumni Association</option>
                    <option value="college_welfare">College Welfare</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1.5">Categories You Fund</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c.value} type="button" onClick={() => toggleCat(c.value)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors
                        ${form.categories_supported.includes(c.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already registered? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
