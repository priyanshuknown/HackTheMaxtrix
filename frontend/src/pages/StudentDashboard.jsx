import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Layers, LogOut, Plus, FileText, Clock, CheckCircle2,
  IndianRupee, ChevronRight, ArrowRight
} from 'lucide-react';

const CAT_LABELS = {
  exam_fee: 'Exam Fee',
  certification_fee: 'Certification',
  device_repair: 'Device Repair',
  interview_travel: 'Interview Travel',
};

const STATUS_STEP = { submitted: 0, verified: 1, matched: 2, approved: 3, disbursed: 4, completed: 4 };

const STATUS_BADGE = {
  submitted: 'bg-amber-50 text-amber-700',
  verified: 'bg-indigo-50 text-indigo-700',
  matched: 'bg-blue-50 text-blue-700',
  approved: 'bg-violet-50 text-violet-700',
  disbursed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['student-requests'],
    queryFn: async () => {
      const res = await api.get('/requests');
      return Array.isArray(res.data) ? res.data : [];
    },
    onError: () => toast.error('Failed to load requests'),
  });

  const totalAmt = requests
    .filter(r => ['disbursed', 'completed'].includes(r.status))
    .reduce((s, r) => s + (r.amount || 0), 0);
  const active = requests.filter(r => !['rejected', 'completed'].includes(r.status)).length;
  const funded = requests.filter(r => ['disbursed', 'completed'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">VidyaFund</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'S'}
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

        {/* ── Hero Greeting ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hello, {user?.full_name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your funding requests below.</p>
          </div>
          <button
            onClick={() => navigate('/student/request')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm shadow-blue-200"
          >
            <Plus size={15} />
            New Request
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active', value: active, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Funded', value: funded, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Received', value: `₹${totalAmt.toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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

        {/* ── Requests List ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Applications</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText size={22} className="text-blue-500" />
              </div>
              <p className="text-gray-800 font-semibold text-sm mb-1">No applications yet</p>
              <p className="text-gray-400 text-xs mb-5">Submit a request for exam fees, certifications, devices, or travel.</p>
              <button
                onClick={() => navigate('/student/request')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition"
              >
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req, i) => {
                const step = STATUS_STEP[req.status] ?? 0;
                const steps = ['Submitted', 'Verified', 'Matched', 'Approved', 'Funded'];
                const isFunded = ['disbursed', 'completed'].includes(req.status);

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => navigate(`/status/${req.id}`)}
                    className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition group"
                  >
                    {/* Row 1 */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {CAT_LABELS[req.category] || req.category}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[req.status] || 'bg-gray-100 text-gray-500'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{req.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-base font-bold text-gray-900">₹{(req.amount || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">Due {new Date(req.deadline_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-0 relative">
                      {steps.map((label, idx) => {
                        const done = idx <= step;
                        const current = idx === step;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex items-center">
                              {/* Left connector */}
                              <div className={`flex-1 h-0.5 ${idx === 0 ? 'invisible' : done ? 'bg-blue-500' : 'bg-gray-200'}`} />
                              {/* Dot */}
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                                done ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                              } ${current ? 'ring-2 ring-blue-200' : ''}`}>
                                {done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              {/* Right connector */}
                              <div className={`flex-1 h-0.5 ${idx === steps.length - 1 ? 'invisible' : done && idx < step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                            </div>
                            <span className={`text-[9px] mt-1 font-medium ${done ? 'text-blue-600' : 'text-gray-400'}`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* View link */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                      {req.verification_score ? (
                        <span className="text-[10px] text-gray-400">
                          AI Score: <span className="font-semibold text-gray-600">{req.verification_score}/100</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Pending AI verification</span>
                      )}
                      <span className="text-[10px] text-blue-500 group-hover:text-blue-700 flex items-center gap-1 transition">
                        View Details <ChevronRight size={11} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
