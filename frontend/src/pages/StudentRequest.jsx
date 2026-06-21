import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Sparkles, CheckCircle2, IndianRupee, Calendar, Upload, FileText,
  AlertCircle, ChevronRight, ArrowLeft, Info, Layers, X
} from 'lucide-react';

const CATEGORIES = [
  { value:'exam_fee',          label:'Exam Fee',         icon:'📝', desc:'Registration, exam, or course fees' },
  { value:'certification_fee', label:'Certification',    icon:'🏆', desc:'Professional or technical certification' },
  { value:'device_repair',     label:'Device Repair',    icon:'💻', desc:'Laptop, tablet, or device repairs' },
  { value:'interview_travel',  label:'Interview Travel', icon:'✈️', desc:'Transport for job interviews' },
];

const STEPS = [
  { title:'Basic Info',   desc:'Tell us about your need' },
  { title:'Details',      desc:'Amount and deadline' },
  { title:'Verification', desc:'Student ID proof' },
  { title:'Documents',    desc:'Supporting files (optional)' },
  { title:'Review',       desc:'Confirm and submit' },
];

export default function StudentRequest() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title:'', category:'', urgency:'Low', description:'',
    amount:'', deadline_date:'', student_id_proof:null, document:null,
  });
  const [amountError, setAmountError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const MIN = 2000;

  const handleAmountChange = (e) => {
    const v = e.target.value;
    setForm({ ...form, amount:v });
    setAmountError(v && parseInt(v) < MIN ? `Minimum ₹${MIN.toLocaleString()}` : '');
  };

  const canProceed = () => {
    if (step === 0) return form.title.length > 3 && form.category && form.description.length >= 10;
    if (step === 1) return form.amount && parseInt(form.amount) >= MIN && form.deadline_date;
    if (step === 2) return form.student_id_proof !== null;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('category', form.category);
      data.append('amount', form.amount);
      data.append('description', `${form.title}\nUrgency: ${form.urgency}\n\n${form.description}`);
      data.append('deadline_date', form.deadline_date);
      if (form.student_id_proof) data.append('student_id_proof', form.student_id_proof);
      if (form.document) data.append('document', form.document);
      const res = await api.post('/requests', data, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success('Request submitted!');
      navigate(`/status/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit');
    } finally { setLoading(false); }
  };

  const inputStyle = { height:'2.875rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.75rem', padding:'0 0.9rem', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', width:'100%', transition:'all 0.15s ease' };
  const labelStyle = { display:'block', fontSize:'0.72rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <header style={{ height:'3.75rem', background:'rgba(13,13,22,0.95)', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => navigate('/student/dashboard')} style={{ display:'flex', alignItems:'center', gap:'0.625rem', background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontWeight:600, fontSize:'0.875rem' }}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <div className="sidebar-logo-icon" style={{ width:'1.875rem', height:'1.875rem' }}>
            <Layers size={14} style={{ color:'white' }} />
          </div>
          <span style={{ fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', fontSize:'0.9375rem' }}>New Request</span>
        </div>
        <div style={{ width:'6rem' }} />
      </header>

      <div style={{ flex:1, display:'flex', overflow:'hidden', maxHeight:'calc(100vh - 3.75rem)' }}>
        {/* Left stepper */}
        <div style={{ width:'14rem', background:'rgba(13,13,22,0.8)', borderRight:'1px solid rgba(255,255,255,0.06)', padding:'2rem 1.25rem', flexShrink:0, display:'flex', flexDirection:'column', gap:'0.25rem', overflowY:'auto' }}>
          <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#334155', marginBottom:'0.75rem', padding:'0 0.25rem' }}>
            Progress
          </div>

          {/* Progress bar */}
          <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden', marginBottom:'1.25rem' }}>
            <div style={{ height:'100%', borderRadius:'2px', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', width:`${(step/4)*100}%`, transition:'width 0.4s ease' }} />
          </div>

          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={i}
                onClick={() => done && setStep(i)}
                style={{
                  display:'flex', alignItems:'flex-start', gap:'0.75rem',
                  padding:'0.625rem 0.5rem', borderRadius:'0.625rem', textAlign:'left',
                  background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  cursor: done ? 'pointer' : 'default',
                }}
              >
                <div className={`step-indicator ${done ? 'step-done' : active ? 'step-active' : 'step-pending'}`}>
                  {done ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <div style={{ marginTop:'0.125rem' }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:700, color: active ? '#a5b4fc' : done ? '#e2e8f0' : '#334155' }}>{s.title}</div>
                  <div style={{ fontSize:'0.7rem', color:'#334155', marginTop:'0.15rem' }}>{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form area */}
        <div style={{ flex:1, overflowY:'auto', padding:'2rem', display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:'580px' }}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>Basic Information</h2>
                  <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'2rem' }}>All fields marked are required</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Request Title</label>
                      <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} style={inputStyle} placeholder="Brief title for your request" />
                    </div>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem' }}>
                        {CATEGORIES.map(c => {
                          const active = form.category === c.value;
                          return (
                            <button key={c.value} type="button" onClick={() => setForm({...form,category:c.value})}
                              style={{
                                padding:'0.875rem 1rem', borderRadius:'0.75rem', textAlign:'left',
                                border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                                background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                                transition:'all 0.15s ease', cursor:'pointer',
                              }}
                            >
                              <div style={{ fontSize:'1.25rem', marginBottom:'0.35rem' }}>{c.icon}</div>
                              <div style={{ fontWeight:700, color: active ? '#a5b4fc' : '#94a3b8', fontSize:'0.8rem' }}>{c.label}</div>
                              <div style={{ color:'#334155', fontSize:'0.7rem', marginTop:'0.15rem' }}>{c.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Urgency Level</label>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        {[
                          { v:'Low',    color:'#10b981' },
                          { v:'Medium', color:'#f59e0b' },
                          { v:'High',   color:'#ef4444' },
                        ].map(u => {
                          const active = form.urgency === u.v;
                          return (
                            <button key={u.v} type="button" onClick={() => setForm({...form,urgency:u.v})}
                              style={{
                                flex:1, height:'2.5rem', borderRadius:'0.625rem', fontWeight:700, fontSize:'0.875rem',
                                border: active ? `1px solid ${u.color}50` : '1px solid rgba(255,255,255,0.07)',
                                background: active ? `${u.color}18` : 'rgba(255,255,255,0.03)',
                                color: active ? u.color : '#475569', transition:'all 0.15s ease',
                              }}
                            >
                              {u.v}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Describe Your Need</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm({...form,description:e.target.value})}
                        placeholder="Explain your situation clearly and honestly..."
                        style={{ ...inputStyle, height:'auto', minHeight:'130px', padding:'0.75rem 0.9rem', resize:'vertical' }}
                      />
                      <div style={{ textAlign:'right', fontSize:'0.7rem', color:'#334155', marginTop:'0.35rem' }}>
                        {form.description.length}/1000
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>Request Details</h2>
                  <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'2rem' }}>Amount and timeline for your request</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Amount (₹)</label>
                      <div style={{ position:'relative' }}>
                        <IndianRupee size={16} style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                        <input
                          type="number"
                          value={form.amount}
                          onChange={handleAmountChange}
                          style={{ ...inputStyle, paddingLeft:'2.5rem', fontSize:'1.5rem', fontWeight:800, fontFamily:'Outfit,sans-serif', height:'4rem', borderColor: amountError ? 'rgba(239,68,68,0.5)' : undefined }}
                          placeholder="5000"
                          min={MIN}
                        />
                      </div>
                      {amountError && (
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#f87171', fontSize:'0.8rem', marginTop:'0.5rem' }}>
                          <AlertCircle size={14} /> {amountError}
                        </div>
                      )}
                      <div style={{ marginTop:'0.75rem', padding:'0.75rem 1rem', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'0.75rem', fontSize:'0.8rem', color:'#64748b', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <Info size={14} style={{ color:'#6366f1', flexShrink:0 }} />
                        Minimum request amount is ₹2,000. Requests under this threshold prevent dependency patterns.
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Deadline Date</label>
                      <div style={{ position:'relative' }}>
                        <Calendar size={16} style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                        <input
                          type="date"
                          value={form.deadline_date}
                          onChange={e => setForm({...form,deadline_date:e.target.value})}
                          style={{ ...inputStyle, paddingLeft:'2.5rem' }}
                          min={new Date(Date.now()+86400000).toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>Student Verification</h2>
                  <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Upload proof of enrollment to verify your student status</p>

                  <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'1rem', padding:'1.25rem', marginBottom:'1.5rem' }}>
                    <div style={{ fontWeight:700, color:'#a5b4fc', fontSize:'0.875rem', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <Info size={15} /> Accepted documents
                    </div>
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                      {['Student ID Card','Enrollment Letter','Fee Receipt','Transcript / Marksheet','Bonafide Certificate'].map(d => (
                        <li key={d} style={{ fontSize:'0.8rem', color:'#64748b', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#6366f1', flexShrink:0 }} />{d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <label style={{
                    display:'block', borderRadius:'1rem', padding:'3rem 2rem', textAlign:'center', cursor:'pointer', transition:'all 0.2s ease',
                    border: form.student_id_proof ? '2px solid rgba(16,185,129,0.4)' : '2px dashed rgba(255,255,255,0.1)',
                    background: form.student_id_proof ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                  }}>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setForm({...form,student_id_proof:e.target.files[0]})} style={{ display:'none' }} />
                    {form.student_id_proof ? (
                      <div>
                        <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'1rem', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                          <CheckCircle2 size={28} style={{ color:'#10b981' }} />
                        </div>
                        <div style={{ fontWeight:700, color:'#e2e8f0', marginBottom:'0.35rem' }}>Uploaded Successfully</div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'0.75rem', wordBreak:'break-all' }}>{form.student_id_proof.name}</div>
                        <button type="button" onClick={e => { e.preventDefault(); setForm({...form,student_id_proof:null}); }}
                          style={{ fontSize:'0.8rem', color:'#94a3b8', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.5rem', padding:'0.35rem 0.875rem', cursor:'pointer' }}>
                          <X size={13} style={{ display:'inline', marginRight:'4px' }} />Change
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'1rem', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                          <Upload size={24} style={{ color:'#475569' }} />
                        </div>
                        <div style={{ fontWeight:700, color:'#94a3b8', marginBottom:'0.35rem' }}>Click to upload document</div>
                        <div style={{ fontSize:'0.75rem', color:'#334155' }}>PDF, PNG, JPG — max 10MB</div>
                      </div>
                    )}
                  </label>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>Supporting Documents</h2>
                  <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Optional — Upload any supporting documents for your request</p>

                  <label style={{
                    display:'block', borderRadius:'1rem', padding:'3rem 2rem', textAlign:'center', cursor:'pointer', transition:'all 0.2s ease',
                    border: form.document ? '2px solid rgba(99,102,241,0.4)' : '2px dashed rgba(255,255,255,0.08)',
                    background: form.document ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                  }}>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setForm({...form,document:e.target.files[0]})} style={{ display:'none' }} />
                    {form.document ? (
                      <div>
                        <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'1rem', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                          <FileText size={24} style={{ color:'#a5b4fc' }} />
                        </div>
                        <div style={{ fontWeight:700, color:'#e2e8f0', marginBottom:'0.35rem', wordBreak:'break-all' }}>{form.document.name}</div>
                        <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{(form.document.size/1024).toFixed(1)} KB</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'1rem', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                          <Upload size={24} style={{ color:'#334155' }} />
                        </div>
                        <div style={{ fontWeight:700, color:'#475569', marginBottom:'0.35rem' }}>Click to upload (optional)</div>
                        <div style={{ fontSize:'0.75rem', color:'#334155' }}>PDF, PNG, JPG — max 10MB</div>
                      </div>
                    )}
                  </label>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#f1f5f9', fontFamily:'Outfit,sans-serif', marginBottom:'0.35rem' }}>Review & Submit</h2>
                  <p style={{ color:'#475569', fontSize:'0.875rem', marginBottom:'1.75rem' }}>Confirm your details before submitting</p>

                  <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem', marginBottom:'1.75rem' }}>
                    {[
                      { label:'Title',    value: form.title },
                      { label:'Category', value: CATEGORIES.find(c=>c.value===form.category)?.label || '—' },
                      { label:'Amount',   value: `₹${parseInt(form.amount||0).toLocaleString()}` },
                      { label:'Urgency',  value: form.urgency },
                      { label:'Deadline', value: form.deadline_date ? new Date(form.deadline_date).toLocaleDateString() : '—' },
                      { label:'Student ID', value: form.student_id_proof?.name || 'Not uploaded' },
                      { label:'Supporting Doc', value: form.document?.name || 'Not uploaded' },
                    ].map(item => (
                      <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.875rem 1rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.75rem' }}>
                        <span style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}>{item.label}</span>
                        <span style={{ fontSize:'0.875rem', color:'#e2e8f0', fontWeight:700, maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:'1rem', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'0.875rem', fontSize:'0.8rem', color:'#6ee7b7', display:'flex', alignItems:'center', gap:'0.625rem' }}>
                    <CheckCircle2 size={16} style={{ flexShrink:0 }} />
                    Ready to submit. Our AI will verify your documents and match you with an institutional funder.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              {step > 0 ? (
                <button onClick={() => setStep(step-1)} className="btn-secondary" style={{ fontSize:'0.875rem' }}>
                  <ArrowLeft size={15} /> Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button onClick={() => setStep(step+1)} disabled={!canProceed()} className="btn-primary" style={{ fontSize:'0.875rem' }}>
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ fontSize:'0.875rem', minWidth:'140px' }}>
                  {loading
                    ? <div style={{ width:'1.25rem', height:'1.25rem', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                    : <><Sparkles size={15} /> Submit Request</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
