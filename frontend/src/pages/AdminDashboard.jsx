import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Activity, ShieldAlert, CheckCircle, 
  Clock, DollarSign, BarChart2, AlertTriangle, 
  Search, Filter, ChevronRight, Eye, ShieldCheck, XCircle,
  LogOut, Sparkles, LayoutDashboard
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api/client';
import toast from 'react-hot-toast';

const mockTrendData = [
  { name: 'Mon', requests: 4, fraud: 1 },
  { name: 'Tue', requests: 7, fraud: 0 },
  { name: 'Wed', requests: 5, fraud: 2 },
  { name: 'Thu', requests: 12, fraud: 1 },
  { name: 'Fri', requests: 8, fraud: 3 },
  { name: 'Sat', requests: 3, fraud: 0 },
  { name: 'Sun', requests: 9, fraud: 2 },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
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

  const handleVerify = async (id) => {
    try {
      await api.post(`/verify/${id}`);
      toast.success('AI Verification Complete');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const kpis = [
    { title: 'Total Requests', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pending Review', value: '42', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'High Risk', value: '14', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Total Disbursed', value: '₹4.2M', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* ── Top Header ── */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">VidyaFund Operations</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/funder/dashboard" className="text-sm font-semibold text-slate-300 hover:text-white transition flex items-center gap-2">
              <LayoutDashboard size={15} /> Funder View
            </Link>
            <div className="w-px h-6 bg-slate-800"></div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor pipeline, AI insights, and fraud alerts.</p>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            Generate Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4 hover:shadow-md transition"
            >
              <div className={`p-3 rounded-full ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-500" />
              Funding Request Pipeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Fraud Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" />
                AI Fraud Monitor
              </h3>
              <p className="text-sm text-slate-500 mb-4">Risk distribution across active requests.</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-rose-600 font-medium">High Risk (&gt;80)</span>
                    <span className="font-bold text-slate-700">14</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-amber-600 font-medium">Medium Risk (40-79)</span>
                    <span className="font-bold text-slate-700">42</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-600 font-medium">Low Risk (&lt;40)</span>
                    <span className="font-bold text-slate-700">218</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition">
              Review High Risk Items
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Request Management</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">AI Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {req.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-slate-700">₹{req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(req.deadline_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {req.verification_score ? (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            req.verification_score > 80 ? 'bg-emerald-100 text-emerald-700' :
                            req.verification_score > 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {req.verification_score}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Pending AI</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        req.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {req.status === 'submitted' && (
                          <button onClick={() => handleVerify(req.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Run AI Verification">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
