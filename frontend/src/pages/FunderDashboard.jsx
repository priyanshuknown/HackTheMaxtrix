import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, Search, Bell, Sun, LayoutDashboard, Compass,
  Wallet, Star, FileText, MessageSquare, BarChart2, Users,
  Settings, HelpCircle, Heart, ArrowUpRight, ChevronDown,
  Share2, IndianRupee, HandHeart, ShieldCheck, Clock, Zap,
  CheckCircle2, Eye, MoreVertical, BookOpen, Award, Wrench, Plane, Map, Plus
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

const CAT_META = {
  exam_fee: { icon: BookOpen, label: 'Exam Fee', color: 'text-blue-600', bg: 'bg-blue-50' },
  certification_fee: { icon: Award, label: 'Certification', color: 'text-purple-600', bg: 'bg-purple-50' },
  device_repair: { icon: Wrench, label: 'Device Repair', color: 'text-amber-600', bg: 'bg-amber-50' },
  interview_travel: { icon: Plane, label: 'Interview Travel', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function FunderDashboard() {
  const [actionLoading, setActionLoading] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  async function handleAction(id, type) {
    setActionLoading(p => ({ ...p, [`${type}_${id}`]: true }));
    try {
      if (type === 'approve') {
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
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Action failed');
    } finally {
      setActionLoading(p => ({ ...p, [`${type}_${id}`]: false }));
    }
  }

  const totalDisbursed = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).reduce((s, r) => s + (r.amount || 0), 0);
  const studentsHelped = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).length;
  const verifiedRequests = requests.filter(r => r.status === 'verified');

  const pieData = [
    { name: 'Exam Fees', value: 40 },
    { name: 'Certifications', value: 30 },
    { name: 'Devices', value: 20 },
    { name: 'Travel', value: 10 },
  ];
  
  const barData = [
    { name: 'Jan', impact: 40 },
    { name: 'Feb', impact: 30 },
    { name: 'Mar', impact: 20 },
    { name: 'Apr', impact: 27 },
    { name: 'May', impact: 18 },
    { name: 'Jun', impact: 23 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md">
            <Heart size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">VidyaFund AI</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600 text-white font-medium">
            <LayoutDashboard size={18} /> Impact Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition">
            <Compass size={18} /> Discover Needs
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition">
            <Wallet size={18} /> Contributions
          </a>
          <a href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition">
            <div className="flex items-center gap-3"><FileText size={18} /> Impact Reports</div>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition">
            <Users size={18} /> Fellow Funders
          </a>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Philanthropic Impact</h1>
              <p className="text-sm text-slate-500 mt-1">Review your contributions and discover new AI-verified opportunities.</p>
            </div>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md transition flex items-center gap-2">
              <Plus size={16} /> Add Funds
            </button>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { title: 'Students Helped', value: studentsHelped || 12, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { title: 'Total Contributions', value: `₹${(totalDisbursed || 125000).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { title: 'Impact Score', value: '94/100', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
              { title: 'Requests Funded', value: studentsHelped || 15, icon: HandHeart, color: 'text-blue-600', bg: 'bg-blue-100' },
            ].map((kpi, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left: AI Recommended Requests */}
            <div className="xl:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" /> AI Recommended for You
              </h3>
              
              <div className="space-y-4">
                {verifiedRequests.length > 0 ? verifiedRequests.slice(0, 3).map((req, i) => {
                  const cat = CAT_META[req.category] || {};
                  const CatIcon = cat.icon || BookOpen;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={req.id} 
                      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bg || 'bg-blue-50'}`}>
                            <CatIcon size={24} className={cat.color || 'text-blue-600'} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{cat.label || req.category} Student Request</h4>
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{req.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">₹{(req.amount || 0).toLocaleString()}</div>
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1 inline-block">High Urgency</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <ShieldCheck size={16} className="text-emerald-500" />
                          <span>AI Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Zap size={16} className="text-indigo-500" />
                          <span>92 Impact Score</span>
                        </div>
                        <button 
                          onClick={() => handleAction(req.id, 'approve')} 
                          disabled={actionLoading[`approve_${req.id}`]}
                          className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                        >
                          {actionLoading[`approve_${req.id}`] ? 'Funding...' : 'Fund Request'}
                        </button>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <p className="text-slate-500">No verified requests matching your criteria right now.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Impact Analytics */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Funding Success Rate</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="impact" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  Category Impact
                  <span className="text-xs font-normal text-indigo-600 cursor-pointer">Detailed Report</span>
                </h3>
                <div className="space-y-4">
                  {pieData.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Impact Map Available</h3>
                  <p className="text-xs text-indigo-200">See where your funds are making a difference across institutions.</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition">
                  <Map size={24} className="text-indigo-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
