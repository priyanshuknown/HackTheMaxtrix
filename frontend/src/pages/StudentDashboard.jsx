import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, LayoutDashboard, FileText, FolderOpen,
  MessageSquare, Bell, User, HelpCircle, LogOut,
  CheckCircle2, Clock, IndianRupee, BadgeCheck, Plus
} from 'lucide-react';

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const res = await api.get('/requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="p-5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>VidyaFund AI</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          <a href="#" className="sidebar-link active"><LayoutDashboard size={16} /> Dashboard</a>
          <a href="#" className="sidebar-link"><FileText size={16} /> My Requests</a>
          <a href="#" className="sidebar-link"><FolderOpen size={16} /> My Documents</a>
          <a href="#" className="sidebar-link justify-between">
            <span className="flex items-center gap-3"><MessageSquare size={16} /> Messages</span>
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">2</span>
          </a>
          <a href="#" className="sidebar-link"><Bell size={16} /> Notifications</a>
          <a href="#" className="sidebar-link"><User size={16} /> Profile</a>
          <div className="my-3 border-t border-slate-100"></div>
          <a href="#" className="sidebar-link"><HelpCircle size={16} /> Help & Support</a>
          <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-link w-full"><LogOut size={16} /> Logout</button>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Student'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'student@email.com'}</div>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-700 text-[9px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 mt-2">
              <BadgeCheck size={11} /> Verified Student
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Here's the latest update on your requests.</p>
            </div>
            <button onClick={() => navigate('/student/request')} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={14} /> New Request
            </button>
          </div>
          
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Requests', value: totalReq, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Under Review', value: underReview, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Funded', value: fundedReq, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Total Received', value: `₹${totalReceived.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpi.bg}`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                  <div className="text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{kpi.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: My Requests */}
            <div className="lg:w-[65%] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">My Requests</h3>
                <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">View All</span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileText size={20} className="text-blue-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">No Requests Yet</h4>
                  <p className="text-xs text-slate-500 mb-4">Submit your first funding request to get started.</p>
                  <button onClick={() => navigate('/student/request')} className="btn-primary text-xs">Submit a Request</button>
                </div>
              ) : (
                requests.map((req, i) => {
                  const stepIdx = getStepIndex(req.status);
                  const steps = ['Submitted', 'Verified', 'Matched', 'Funded', 'Completed'];
                  const isFunded = stepIdx >= 3;
                  return (
                    <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-slate-300 transition-colors"
                      onClick={() => navigate(`/status/${req.id}`)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{req.category?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Request'}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[300px]">{req.description}</p>
                        </div>
                        <span className={`shrink-0 ml-3 px-2 py-0.5 rounded text-[10px] font-bold ${isFunded ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                          {isFunded ? 'Funded' : 'Under Review'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">Amount</div>
                          <div className="font-bold text-slate-900 mt-0.5">₹{(req.amount || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">Deadline</div>
                          <div className="font-bold text-slate-900 mt-0.5">{req.deadline_date || '—'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">Status</div>
                          <div className="font-bold text-slate-900 mt-0.5 capitalize">{req.status}</div>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="relative">
                        <div className="absolute top-[10px] left-3 right-3 h-px bg-slate-100"></div>
                        <div className="flex justify-between relative">
                          {steps.map((step, idx) => {
                            const active = idx <= stepIdx;
                            return (
                              <div key={idx} className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-1 ${active ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                                  {active && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                                <span className={`text-[9px] font-bold ${active ? 'text-slate-700' : 'text-slate-300'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Profile */}
            <div className="lg:w-[35%] space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Profile Strength</h3>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-2xl font-extrabold text-blue-600 leading-none">85%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mb-4">Great! Your profile is strong.</p>
                <div className="space-y-3">
                  {['Basic Information', 'Education Details', 'ID Verification', 'Documents', 'Bank Details'].map((item) => (
                    <div key={item} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{item}</span>
                      <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-900 mb-1">Need Help?</h3>
                <p className="text-[10px] text-slate-500 mb-3">Our support team is here to help.</p>
                <button className="w-full py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-[10px] font-bold transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
