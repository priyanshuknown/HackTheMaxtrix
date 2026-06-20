import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Send, ShieldCheck, Zap, CheckCircle2, IndianRupee,
  FileText, Clock, ArrowLeft, AlertTriangle, BookOpen,
  Award, Wrench, Plane, Calendar
} from 'lucide-react';

const CAT_META = {
  exam_fee: { icon: BookOpen, label: 'Exam Fee', color: 'text-blue-600', bg: 'bg-blue-50' },
  certification_fee: { icon: Award, label: 'Certification', color: 'text-purple-600', bg: 'bg-purple-50' },
  device_repair: { icon: Wrench, label: 'Device Repair', color: 'text-amber-600', bg: 'bg-amber-50' },
  interview_travel: { icon: Plane, label: 'Interview Travel', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: Send, desc: 'Request submitted and pending review' },
  { key: 'verified', label: 'Verified', icon: ShieldCheck, desc: 'AI verification completed' },
  { key: 'matched', label: 'Matched', icon: Zap, desc: 'Matched with institutional funder' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, desc: 'Funder approved the funding' },
  { key: 'disbursed', label: 'Disbursed', icon: IndianRupee, desc: 'Funds disbursed via Razorpay' },
  { key: 'completed', label: 'Completed', icon: FileText, desc: 'Impact report generated' },
];

export default function StatusTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequest(); }, [id]);

  async function fetchRequest() {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <AlertTriangle size={24} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">This request doesn't exist or you don't have access.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-xs">Go Back</button>
      </div>
    </div>
  );

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === request.status);
  const isRejected = request.status === 'rejected';
  const cat = CAT_META[request.category] || { label: request.category, color: 'text-blue-600', bg: 'bg-blue-50' };
  const CatIcon = cat.icon || BookOpen;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-5 font-medium transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-3 border-t-blue-600 p-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-mono mb-2">ID: #{(request.id || '').slice(0, 12)}</div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
                  <CatIcon size={18} className={cat.color} />
                </div>
                <h1 className="text-lg font-bold text-slate-900">{cat.label}</h1>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{request.description}</p>
              </div>
            </div>
            <div className="sm:text-right bg-blue-50 p-4 rounded-xl border border-blue-100 sm:w-48 shrink-0">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Amount</div>
              <div className="text-2xl font-bold text-blue-700 flex items-center sm:justify-end gap-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <IndianRupee size={18} className="text-blue-500" />{(request.amount || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 flex items-center sm:justify-end gap-1">
                <Clock size={10} /> Deadline: <span className="font-bold text-slate-700">{request.deadline_date}</span>
              </div>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {request.verification_score && (
              <span className="badge badge-verified py-1 px-2 flex items-center gap-1">
                <ShieldCheck size={10} /> Score: <b>{request.verification_score}/100</b>
              </span>
            )}
            {request.urgency_level && (
              <span className={`badge badge-${(request.urgency_level || '').toLowerCase()} py-1 px-2 flex items-center gap-1`}>
                <Zap size={10} /> {request.urgency_level} Urgency
              </span>
            )}
            {request.review_flag && (
              <span className="badge badge-high py-1 px-2 flex items-center gap-1">
                <AlertTriangle size={10} /> Manual Review
              </span>
            )}
            <span className="badge py-1 px-2 bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1">
              <Calendar size={10} /> AY {request.academic_year}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-5">Funding Pipeline</h2>

          {isRejected ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-700 mb-0.5">Request Rejected</div>
                <div className="text-xs text-red-600/80 leading-relaxed">This request did not meet verification criteria. Contact your institution for assistance.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isCompleted = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={step.key} className="flex gap-4 pb-6 last:pb-0 relative">
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute left-[15px] top-[32px] bottom-0 w-px ${isCompleted && !isCurrent ? 'bg-blue-200' : 'bg-slate-100'}`}></div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 relative z-10
                      ${isCompleted
                        ? isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-300'}`}>
                      <StepIcon size={14} />
                    </div>
                    <div className={`pt-1 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</h3>
                        {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase">Current</span>}
                      </div>
                      <p className="text-[10px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
