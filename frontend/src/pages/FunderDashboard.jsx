import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, Search, Bell, Sun, LayoutDashboard, Compass,
  Wallet, Star, FileText, MessageSquare, BarChart2, Users,
  Settings, HelpCircle, Heart, ArrowUpRight, ChevronDown,
  Share2, IndianRupee, HandHeart, ShieldCheck, Clock, Zap,
  CheckCircle2, Eye, MoreVertical, BookOpen, Award, Wrench, Plane
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

const CAT_META = {
  exam_fee: { icon: BookOpen, label: 'Exam Fee', color: 'text-blue-600', bg: 'bg-blue-50' },
  certification_fee: { icon: Award, label: 'Certification', color: 'text-purple-600', bg: 'bg-purple-50' },
  device_repair: { icon: Wrench, label: 'Device Repair', color: 'text-amber-600', bg: 'bg-amber-50' },
  interview_travel: { icon: Plane, label: 'Interview Travel', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const STATUS_COLORS = {
  submitted: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  verified: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  matched: { text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  disbursed: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  completed: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function FunderDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
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

  async function handleAction(id, type) {
    setActionLoading(p => ({ ...p, [`${type}_${id}`]: true }));
    try {
      if (type === 'verify') {
        await api.post(`/verify/${id}`);
        toast.success('Request verified!');
      } else if (type === 'match') {
        const res = await api.get(`/match/${id}`);
        toast.success(`Matched with ${res.data.matches?.length || 0} funders!`);
      } else if (type === 'approve') {
        const matchRes = await api.get(`/match/${id}`);
        const topMatch = matchRes.data.matches?.[0];
        if (!topMatch) throw new Error('No matches found');
        const res = await api.post(`/disburse/${topMatch.match_id}`);
        await api.post('/verify-payment', {
          razorpay_order_id: res.data.razorpay_order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        });
        toast.success('Funds disbursed!');
      } else if (type === 'impact') {
        const res = await api.get(`/impact/${id}`);
        if (res.data.report_url) window.open(`http://localhost:8000${res.data.report_url}`, '_blank');
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Action failed');
    } finally {
      setActionLoading(p => ({ ...p, [`${type}_${id}`]: false }));
    }
  }

  const totalReq = requests.length;
  const pendingReq = requests.filter(r => r.status === 'submitted').length;
  const verifiedReq = requests.filter(r => r.status === 'verified').length;
  const fundedReq = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).length;
  const totalDisbursed = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).reduce((s, r) => s + (r.amount || 0), 0);

  const pieData = [
    { name: 'Education', value: 45 },
    { name: 'Health', value: 25 },
    { name: 'Technology', value: 15 },
    { name: 'Others', value: 15 },
  ];

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
          <a href="#" className="sidebar-link"><Compass size={16} /> Discover Requests</a>
          <a href="#" className="sidebar-link"><Wallet size={16} /> My Contributions</a>
          <a href="#" className="sidebar-link"><Star size={16} /> Favorites</a>
          <a href="#" className="sidebar-link"><FileText size={16} /> Impact Reports</a>
          <a href="#" className="sidebar-link justify-between">
            <span className="flex items-center gap-3"><MessageSquare size={16} /> Messages</span>
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">3</span>
          </a>
          <a href="#" className="sidebar-link"><BarChart2 size={16} /> Analytics</a>
          <a href="#" className="sidebar-link"><Users size={16} /> Funder Community</a>
          <div className="my-3 border-t border-slate-100"></div>
          <a href="#" className="sidebar-link"><Settings size={16} /> Settings</a>
          <a href="#" className="sidebar-link"><HelpCircle size={16} /> Help & Support</a>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                {user?.full_name?.charAt(0) || 'F'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name || 'Funder'}</div>
                <div className="text-[10px] text-slate-500">{user?.role || 'Funder'}</div>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Funder Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contributed</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1">₹{totalDisbursed.toLocaleString() || '0'} <span className="text-[9px] text-emerald-600 font-bold">↑12%</span></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Requests', value: totalReq, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Pending', value: pendingReq, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Verified', value: verifiedReq, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Funded', value: fundedReq, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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

          <div className="flex flex-col xl:flex-row gap-5">
            
            {/* Left: Request Table */}
            <div className="xl:w-[68%]">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Active Requests</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{requests.length}</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        <th className="px-4 py-2.5">Request</th>
                        <th className="px-4 py-2.5">Amount</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {requests.map((req) => {
                        const cat = CAT_META[req.category] || {};
                        const CatIcon = cat.icon || BookOpen;
                        const sc = STATUS_COLORS[req.status] || STATUS_COLORS.submitted;
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.bg || 'bg-blue-50'}`}>
                                  <CatIcon size={14} className={cat.color || 'text-blue-600'} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900">{cat.label || req.category}</div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{req.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-bold text-slate-900">₹{(req.amount || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400">{req.deadline_date}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                {(req.status || 'submitted').charAt(0).toUpperCase() + (req.status || 'submitted').slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => navigate(`/status/${req.id}`)} className="p-1 text-slate-400 hover:text-blue-600 rounded" title="View">
                                  <Eye size={14} />
                                </button>
                                {req.status === 'submitted' && (
                                  <button onClick={() => handleAction(req.id, 'verify')} disabled={actionLoading[`verify_${req.id}`]}
                                    className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-[10px] font-bold disabled:opacity-50">
                                    {actionLoading[`verify_${req.id}`] ? '...' : 'Verify'}
                                  </button>
                                )}
                                {req.status === 'verified' && (
                                  <button onClick={() => handleAction(req.id, 'match')} disabled={actionLoading[`match_${req.id}`]}
                                    className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-[10px] font-bold disabled:opacity-50">
                                    {actionLoading[`match_${req.id}`] ? '...' : 'Match'}
                                  </button>
                                )}
                                {req.status === 'matched' && (
                                  <button onClick={() => handleAction(req.id, 'approve')} disabled={actionLoading[`approve_${req.id}`]}
                                    className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[10px] font-bold disabled:opacity-50">
                                    {actionLoading[`approve_${req.id}`] ? '...' : 'Fund'}
                                  </button>
                                )}
                                {['disbursed', 'completed'].includes(req.status) && (
                                  <button onClick={() => handleAction(req.id, 'impact')} disabled={actionLoading[`impact_${req.id}`]}
                                    className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-[10px] font-bold disabled:opacity-50">
                                    {actionLoading[`impact_${req.id}`] ? '...' : 'Impact'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {requests.length === 0 && (
                        <tr><td colSpan="4" className="px-4 py-8 text-center text-xs text-slate-400">No requests found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Purple Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mt-5 flex flex-col sm:flex-row items-center justify-between text-white">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Make a Bigger Impact</h3>
                  <p className="text-indigo-100 text-xs mt-1">Set up recurring giving to help more students consistently.</p>
                </div>
                <button className="bg-white text-indigo-700 px-5 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Set Up Recurring Giving
                </button>
              </div>
            </div>

            {/* Right: Charts */}
            <div className="xl:w-[32%] space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Impact Overview</h3>
                <div className="h-40 w-full relative mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={pieData} innerRadius={50} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-slate-900 leading-none">₹{totalDisbursed.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Total</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                        <span className="text-slate-600">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { text: 'Request verified', time: '2h ago', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { text: 'New request received', time: '3h ago', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { text: 'Request matched', time: '5h ago', icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { text: 'Funds disbursed', time: '1d ago', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.bg}`}>
                        <act.icon size={12} className={act.color} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-700">{act.text}</div>
                        <div className="text-[10px] text-slate-400">{act.time}</div>
                      </div>
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
