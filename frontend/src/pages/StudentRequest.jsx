import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Sparkles, CheckCircle2, IndianRupee, Calendar, Upload, FileText,
  AlertCircle, ChevronRight, ArrowLeft, HelpCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: 'exam_fee', label: 'Exam Fee' },
  { value: 'certification_fee', label: 'Certification' },
  { value: 'device_repair', label: 'Device Repair' },
  { value: 'interview_travel', label: 'Interview Travel' },
];
const MIN_AMOUNT = 2000;

export default function StudentRequest() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', category: '', urgency: 'Low', description: '', amount: '', deadline_date: '', document: null });
  const [amountError, setAmountError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { title: 'Basic Information', desc: 'Tell us about your need' },
    { title: 'Request Details', desc: 'Amount and deadline' },
    { title: 'Documents', desc: 'Upload supporting docs' },
    { title: 'Review & Submit', desc: 'Review and submit' }
  ];

  function handleAmountChange(e) {
    const val = e.target.value;
    setForm({ ...form, amount: val });
    setAmountError(val && parseInt(val) < MIN_AMOUNT ? `Minimum ₹${MIN_AMOUNT.toLocaleString()}` : '');
  }

  function canProceed() {
    switch (step) {
      case 0: return form.title.length > 3 && form.category && form.description.length >= 10;
      case 1: return form.amount && parseInt(form.amount) >= MIN_AMOUNT && form.deadline_date;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('category', form.category);
      data.append('amount', form.amount);
      data.append('description', `${form.title}\nUrgency: ${form.urgency}\n\n${form.description}`);
      data.append('deadline_date', form.deadline_date);
      if (form.document) data.append('document', form.document);

      const res = await api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Request submitted!');
      navigate(`/status/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ fontFamily: "'Outfit', sans-serif" }}>VidyaFund AI</span>
        </div>
        <h1 className="text-sm font-bold text-slate-900">Create a New Request</h1>
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Stepper */}
        <div className="w-56 bg-white border-r border-slate-200 p-5 hidden lg:block shrink-0">
          <div className="space-y-6 relative">
            <div className="absolute left-[11px] top-[20px] bottom-2 w-px bg-slate-100 z-0"></div>
            {steps.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={i} className="flex gap-3 relative z-10 cursor-pointer" onClick={() => done && setStep(i)}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold
                    ${done ? 'bg-blue-600 border-blue-600 text-white' 
                    : active ? 'bg-white border-blue-600 text-blue-600' 
                    : 'bg-white border-slate-200 text-slate-400'}`}>
                    {done ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${active ? 'text-blue-600' : done ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</div>
                    <div className="text-[10px] text-slate-400">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex justify-center">
          <div className="w-full max-w-lg">
            
            {/* Mobile Step Indicator */}
            <div className="lg:hidden flex items-center gap-1 mb-5">
              {steps.map((s, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>

            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Basic Information</h2>
                <p className="text-xs text-slate-500 mb-5">All fields are required</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Request Title</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="input-field" placeholder="Short title for your request" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Category</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field bg-white">
                        <option value="" disabled>Select</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Urgency</label>
                      <div className="flex gap-1.5">
                        {['Low', 'Medium', 'High'].map(u => (
                          <button key={u} type="button" onClick={() => setForm({ ...form, urgency: u })}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-colors
                              ${form.urgency === u && u === 'Low' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' :
                              form.urgency === u && u === 'Medium' ? 'bg-amber-50 border-amber-400 text-amber-700' :
                              form.urgency === u && u === 'High' ? 'bg-rose-50 border-rose-400 text-rose-700' :
                              'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Describe Your Need</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field min-h-[120px] resize-y" placeholder="Explain your situation..." />
                    <div className="text-right text-[9px] text-slate-400 mt-0.5">{form.description.length}/1000</div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Request Details</h2>
                <p className="text-xs text-slate-500 mb-5">Amount and timeline</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" value={form.amount} onChange={handleAmountChange}
                        className={`input-field pl-9 text-lg font-bold ${amountError ? 'error' : ''}`}
                        placeholder="e.g. 5000" min={MIN_AMOUNT} />
                    </div>
                    {amountError && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> {amountError}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Deadline</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="date" value={form.deadline_date} onChange={(e) => setForm({ ...form, deadline_date: e.target.value })}
                        className="input-field pl-9" min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Documents</h2>
                <p className="text-xs text-slate-500 mb-5">Upload supporting documents (optional)</p>
                <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${form.document ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setForm({ ...form, document: e.target.files[0] })} />
                  {form.document ? (
                    <div>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-blue-700">{form.document.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{(form.document.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Upload size={18} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Click to upload</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">PDF, PNG, JPG (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Review & Submit</h2>
                <p className="text-xs text-slate-500 mb-5">Verify your details</p>
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {[
                    { label: 'Title', value: form.title },
                    { label: 'Category', value: CATEGORIES.find(c => c.value === form.category)?.label || '—' },
                    { label: 'Amount', value: `₹${parseInt(form.amount || 0).toLocaleString()}` },
                    { label: 'Urgency', value: form.urgency },
                    { label: 'Deadline', value: form.deadline_date || '—' },
                    { label: 'Document', value: form.document?.name || 'None' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between px-4 py-3">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900 text-right max-w-[60%] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">← Back</button>
              ) : <div />}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="btn-primary flex items-center gap-1.5 text-xs">
                  Save & Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-1.5 text-xs">
                  {loading ? 'Submitting...' : 'Submit Request'} <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Tips */}
        <div className="w-60 bg-white border-l border-slate-200 p-5 hidden xl:block shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Tips for a Strong Request</h3>
          <ul className="space-y-2.5 mb-6">
            {['Be honest and clear about your need.', 'Provide accurate information.', 'Upload valid documents.', 'Complete your student profile.'].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <span className="text-[10px] text-slate-600 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-xs font-bold text-slate-900 mb-2">Examples</h3>
          <div className="space-y-1.5">
            {['Tuition Fee Support', 'Laptop for Studies', 'Medical Emergency', 'Book Purchase'].map((ex) => (
              <div key={ex} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-[10px] font-semibold text-slate-600">{ex}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
