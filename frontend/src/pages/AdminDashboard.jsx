import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Clock, ShieldAlert, IndianRupee,
  Search, Eye, LogOut, RefreshCw, CheckCircle2,
  Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  submitted: 'bg-amber-50 text-amber-700 border border-amber-200',
  verified: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  matched: 'bg-blue-50 text-blue-700 border border-blue-200',
  approved: 'bg-violet-50 text-violet-700 border border-violet-200',
  disbursed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await api.get('/requests');
      return Array.isArray(res.data) ? res.data : [];
    },
    onError: () => toast.error('Failed to load requests'),
  });

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await api.post(`/verify/${id}`);
      toast.success('AI verification complete!');
      queryClient.invalidateQueries(['admin-requests']);
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'submitted').length;
  const flagged = requests.filter(r => (r.fraud_score || 0) > 70).length;
  const disbursed = requests
    .filter(r => ['disbursed', 'completed'].includes(r.status))
    .reduce((s, r) => s + (r.amount || 0), 0);

  const filtered = requests.filter(r =>
    (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">VidyaFund</span>
            <span className="text-gray-300 text-sm">·</span>
            <span className="text-gray-500 text-xs font-medium">Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">
              {user?.full_name || 'Admin'}
            </span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page Title ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Requests Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and verify student funding requests</p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries(['admin-requests'])}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'High Risk', value: flagged, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Disbursed', value: `₹${disbursed.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon size={14} className={kpi.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Requests Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Table toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-800">All Funding Requests</h2>
            <div className="relative w-full sm:w-60">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by category or description…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">No requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wide text-[10px]">
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">AI Score</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((req) => {
                    const isOpen = expanded === req.id;
                    const fraud = req.fraud_score || 0;
                    return (
                      <React.Fragment key={req.id}>
                        <tr
                          className="hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => setExpanded(isOpen ? null : req.id)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-gray-800 capitalize">
                              {(req.category || '').replace(/_/g, ' ')}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{req.academic_year}</div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            ₹{(req.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            {req.verification_score ? (
                              <span className={`text-[10px] font-semibold ${
                                req.verification_score >= 80 ? 'text-emerald-600' :
                                req.verification_score >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {req.verification_score}/100
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">–</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-600'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {req.status === 'submitted' && (
                                <button
                                  onClick={() => handleVerify(req.id)}
                                  disabled={verifyingId === req.id}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                  {verifyingId === req.id ? 'Running…' : 'Verify'}
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/status/${req.id}`)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                              >
                                <Eye size={13} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-700">
                                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isOpen && (
                          <tr className="bg-gray-50/60">
                            <td colSpan={5} className="px-5 py-4 border-t border-gray-100">
                              <div className="space-y-2 max-w-2xl">
                                <p className="text-xs font-semibold text-gray-700">Description</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{req.description}</p>
                                {fraud > 0 && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <ShieldAlert size={12} className="text-red-400" />
                                    <span className="text-[10px] text-red-500 font-medium">
                                      Fraud Risk Score: {fraud}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
