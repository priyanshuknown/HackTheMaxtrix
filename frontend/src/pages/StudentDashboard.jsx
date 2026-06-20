import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, LayoutDashboard, FileText, FolderOpen,
  MessageSquare, Bell, User, HelpCircle, LogOut,
  CheckCircle2, Clock, IndianRupee, BadgeCheck, Plus,
  TrendingUp, ShieldCheck, Zap
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading: loading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      try {
        const res = await api.get('/requests');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        toast.error('Failed to load requests');
        return [];
      }
    }
  });

  const totalReq = requests.length;
  const underReview = requests.filter(r => ['submitted', 'verified'].includes(r.status)).length;
  const fundedReq = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).length;
  const totalReceived = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).reduce((s, r) => s + (r.amount || 0), 0);

  function getStepIndex(status) {
    const map = { submitted: 0, verified: 1, matched: 2, disbursed: 3, completed: 4 };
    return map[status] ?? 0;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">VidyaFund AI</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition">
            <FileText size={18} /> My Requests
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition">
            <FolderOpen size={18} /> Documents
          </a>
          <a href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition">
            <div className="flex items-center gap-3"><MessageSquare size={18} /> Messages</div>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">2</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition">
            <Bell size={18} /> Notifications
          </a>
          <div className="my-4 border-t border-slate-100"></div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition">
            <User size={18} /> Profile Setting
          </a>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Here is your funding progress and AI eligibility insights.</p>
            </div>
            <button onClick={() => navigate('/student/request')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition flex items-center gap-2">
              <Plus size={16} /> New Request
            </button>
          </div>
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Active Requests', value: totalReq, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Under Review', value: underReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'Approved', value: fundedReq, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Total Received', value: `₹${totalReceived.toLocaleString()}`, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-100' },
            ].map((kpi, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                  <kpi.icon size={24} className={kpi.color} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">{kpi.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left: My Requests */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Your Funding Requests</h3>
                <span className="text-sm text-indigo-600 font-semibold cursor-pointer hover:underline">View All</span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FileText size={24} className="text-indigo-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">No Requests Yet</h4>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Submit your first funding request to get AI-powered institutional matching.</p>
                  <button onClick={() => navigate('/student/request')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-md">
                    Submit a Request
                  </button>
                </div>
              ) : (
                requests.map((req, i) => {
                  const stepIdx = getStepIndex(req.status);
                  const steps = ['Submitted', 'Review', 'Verified', 'Matched', 'Funded'];
                  const isFunded = stepIdx >= 3;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={req.id} 
                      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/status/${req.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{req.category?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Funding Request'}</h4>
                          <p className="text-sm text-slate-500 mt-1 max-w-xl line-clamp-2">{req.description}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">₹{(req.amount || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500 font-medium">Due: {new Date(req.deadline_date).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isFunded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isFunded ? 'Funded' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="relative pt-4">
                        <div className="absolute top-7 left-6 right-6 h-1 bg-slate-100 rounded-full"></div>
                        <div className="flex justify-between relative">
                          {steps.map((step, idx) => {
                            const active = idx <= stepIdx;
                            return (
                              <div key={idx} className="flex flex-col items-center w-20">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mb-2 z-10 transition-colors duration-300 ${active ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white border-slate-200'}`}>
                                  {active && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <span className={`text-xs font-semibold ${active ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Right: AI Scores & Profile */}
            <div className="space-y-6">
              {/* Funding Probability */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <TrendingUp size={80} />
                </div>
                <h3 className="text-sm font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                  <Zap size={16} /> AI Funding Probability
                </h3>
                <div className="text-4xl font-extrabold mb-1">78%</div>
                <p className="text-sm text-slate-300 mb-4">High chance of institutional funding.</p>
                <div className="bg-white/10 rounded-lg p-3 text-xs text-indigo-100">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Verified academic documents</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> High-impact request category</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Clear timeline provided</li>
                  </ul>
                </div>
              </div>

              {/* Profile Strength & Eligibility */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-slate-900">Profile Strength</h3>
                    <span className="text-lg font-bold text-indigo-600">85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <ShieldCheck size={16} className="text-slate-500" /> Eligibility Score
                    </h3>
                    <span className="text-lg font-bold text-emerald-600">92/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">You meet 92% of the criteria for top institutional funders.</p>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-3 border-t border-slate-100 pt-4">Document Checklist</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Income Proof', status: true },
                    { name: 'ID Proof (Aadhar)', status: true },
                    { name: 'Academic Record', status: true },
                    { name: 'Recommendation Letter', status: false }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className={doc.status ? 'text-slate-700' : 'text-slate-400'}>{doc.name}</span>
                      {doc.status ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
