import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Layers, LogOut, Users, IndianRupee, HandHeart,
  CheckCircle2, ShieldCheck, Zap, ChevronRight, History
} from 'lucide-react';

const CAT_LABELS = {
  exam_fee: 'Exam Fee',
  certification_fee: 'Certification',
  device_repair: 'Device Repair',
  interview_travel: 'Interview Travel',
};

const CAT_COLORS = {
  exam_fee: 'bg-blue-50 text-blue-700',
  certification_fee: 'bg-violet-50 text-violet-700',
  device_repair: 'bg-amber-50 text-amber-700',
  interview_travel: 'bg-emerald-50 text-emerald-700',
};

export default function FunderDashboard() {
  const [tab, setTab] = useState('discover');
  const [actionLoading, setActionLoading] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['funder-requests'],
    queryFn: async () => {
      const res = await api.get('/requests');
      return Array.isArray(res.data) ? res.data : [];
    },
    onError: () => toast.error('Failed to load requests'),
  });

  const handleDisburse = async (id) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      const matchRes = await api.get(`/match/${id}`);
      const topMatch = matchRes.data.matches?.[0];
      if (!topMatch) throw new Error('No matches found');
      const res = await api.post(`/disburse/${topMatch.match_id}`);
      await api.post('/verify-payment', {
        razorpay_order_id: res.data.razorpay_order_id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      });
      toast.success('✅ Funds disbursed to student institute!');
      queryClient.invalidateQueries(['funder-requests']);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Disbursement failed');
    } finally {
      setActionLoading(p => ({ ...p, [id]: false }));
    }
  };

  const pending = requests.filter(r => ['verified', 'matched', 'approved'].includes(r.status));
  const history = requests.filter(r => ['disbursed', 'completed'].includes(r.status));
  const totalDisbursed = history.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">VidyaFund</span>
            <span className="text-gray-300 text-sm">·</span>
            <span className="text-gray-500 text-xs font-medium">Funder Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Greeting + Stats ── */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome, {user?.full_name?.split(' ')[0] || 'Partner'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Fund verified student requests and track your impact.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Requests Waiting', value: pending.length, icon: HandHeart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Students Helped', value: history.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Disbursed', value: `₹${totalDisbursed.toLocaleString()}`, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon size={13} className={s.color} />
                </div>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'discover', label: 'Discovery Feed', icon: HandHeart },
            { key: 'history', label: 'My Contributions', icon: History },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Discovery Feed ── */}
        {tab === 'discover' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Verified Student Requests</h2>
              <span className="text-xs text-gray-400">{pending.length} requests waiting</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No requests are waiting for funding right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((req, i) => {
                  const catLabel = CAT_LABELS[req.category] || req.category;
                  const catColor = CAT_COLORS[req.category] || 'bg-gray-50 text-gray-600';
                  const matchPct = req.verification_score ? Math.min(98, req.verification_score + 5) : 87;

                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${catColor}`}>
                            {catLabel}
                          </span>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{req.description}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 shrink-0">₹{(req.amount || 0).toLocaleString()}</p>
                      </div>

                      {/* Signals */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <ShieldCheck size={12} className="text-emerald-500" />
                          AI Verified
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap size={12} className="text-amber-500" />
                          Score: {req.verification_score || '—'}/100
                        </div>
                        <div className="flex items-center gap-1">
                          <HandHeart size={12} className="text-indigo-500" />
                          {matchPct}% match
                        </div>
                        <span className="ml-auto text-[10px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      </div>

                      {/* Action */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">Academic Year: {req.academic_year}</p>
                        <button
                          onClick={() => handleDisburse(req.id)}
                          disabled={actionLoading[req.id]}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading[req.id] ? 'Processing…' : 'Disburse Funds'}
                          {!actionLoading[req.id] && <ChevronRight size={13} />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Contribution History</h2>
              <span className="text-xs text-gray-400">{history.length} disbursements</span>
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-sm font-semibold text-gray-700">No contributions yet</p>
                <p className="text-xs text-gray-400 mt-1">Switch to Discovery Feed to start funding students.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {history.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {CAT_LABELS[req.category] || req.category}
                        </p>
                        <p className="text-[10px] text-gray-400">Student #{req.student_id?.substring(0, 8)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">₹{(req.amount || 0).toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
