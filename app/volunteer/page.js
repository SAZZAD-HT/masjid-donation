'use client';
// app/volunteer/page.js
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const ROLES = [
  { id: 'masjid_maintenance', icon: '🔨', title: 'Masjid Maintenance', desc: 'Cleaning, repairs, and upkeep of the prayer hall and facilities.' },
  { id: 'food_program', icon: '🍽️', title: 'Food Program', desc: 'Preparing and serving iftar, weekend meals, and food bank distributions.' },
  { id: 'islamic_school', icon: '📚', title: 'Islamic School', desc: 'Teaching Quran, Islamic studies, and Arabic to children and youth.' },
  { id: 'events', icon: '🎉', title: 'Events & Hospitality', desc: 'Organising community events, Eid celebrations, and welcoming visitors.' },
  { id: 'tech', icon: '💻', title: 'Tech & Media', desc: 'Website, social media, live streaming, and digital communications.' },
  { id: 'fundraising', icon: '💰', title: 'Fundraising', desc: 'Supporting donation drives, grant applications, and outreach.' },
  { id: 'youth', icon: '⭐', title: 'Youth Programs', desc: 'Mentoring teens, organising youth sports, camps, and activities.' },
  { id: 'sisters', icon: '🤝', title: 'Sisters\' Circle', desc: 'Supporting the sisters\' programs, halaqas, and social support network.' },
  { id: 'janazah', icon: '🌿', title: 'Janazah Services', desc: 'Assisting with funeral preparations, washing, and burial logistics.' },
];

const AVAILABILITY = ['Weekday mornings', 'Weekday evenings', 'Weekends', 'Ramadan only', 'Flexible / As needed'];
const SKILLS = ['Arabic speaker', 'Driver / Transport', 'Medical professional', 'Legal professional', 'Teacher / Educator', 'IT / Tech', 'Carpenter / Handyperson', 'Chef / Cook', 'Graphic designer', 'Social media'];

export default function VolunteerPage() {
  const [step, setStep] = useState(1); // 1=roles, 2=details, 3=success
  const [selected, setSelected] = useState([]);
  const [avail, setAvail] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toggle = (arr, setArr, val) =>
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (selected.length === 0) e.roles = 'Please choose at least one role.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          roles: selected,
          availability: avail,
          skills
        })
      });
      if (!res.ok) throw new Error();

      setStep(3);
      toast.success('JazakAllahu Khayran! We\'ll be in touch soon. 🤲');
    } catch { toast.error('Submission failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Hero */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 72 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>🤲 Give Your Time</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>
            Volunteer with Us
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
            The Prophet ﷺ said: <em style={{ color: 'var(--gold-light)' }}>"The best of people are those who are most beneficial to people."</em><br />
            Join over 180 active volunteers serving the community.
          </p>
        </div>
      </section>

      {/* Step indicator */}
      {step < 3 && (
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(26,92,56,0.1)', padding: '16px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, maxWidth: 480, margin: '0 auto' }}>
              {['Choose Roles', 'Your Details'].map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: done ? 'var(--gold)' : active ? 'var(--emerald)' : 'var(--parchment)',
                        color: done || active ? '#fff' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.8rem',
                      }}>{done ? '✓' : num}</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500, color: active ? 'var(--emerald)' : 'var(--muted)' }}>{label}</span>
                    </div>
                    {i === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--emerald)' : 'var(--parchment)', margin: '0 12px' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container" style={{ maxWidth: 860 }}>

          {/* ── Step 1: Roles ── */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 8 }}>Where Can You Help?</h2>
                <p style={{ color: 'var(--muted)' }}>Select all roles that interest you. You can always change later.</p>
                {errors.roles && <p style={{ color: '#dc2626', marginTop: 8, fontSize: '0.88rem' }}>⚠ {errors.roles}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
                {ROLES.map(({ id, icon, title, desc }) => {
                  const active = selected.includes(id);
                  return (
                    <div key={id} onClick={() => toggle(selected, setSelected, id)} style={{
                      padding: '20px', borderRadius: 'var(--radius)', cursor: 'pointer',
                      border: `2px solid ${active ? 'var(--gold)' : 'rgba(26,92,56,0.15)'}`,
                      background: active ? 'var(--gold-pale)' : '#fff',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}>
                      {active && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 800 }}>✓</div>}
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>{icon}</div>
                      <h4 style={{ fontWeight: 700, marginBottom: 6, color: active ? 'var(--gold)' : 'var(--charcoal)', fontSize: '0.98rem' }}>{title}</h4>
                      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.9rem' }}>
                  {selected.length === 0 ? 'No roles selected yet' : `${selected.length} role${selected.length > 1 ? 's' : ''} selected`}
                </p>
                <button onClick={() => { if (selected.length > 0) setStep(2); else setErrors({ roles: 'Please choose at least one role.' }); }}
                  className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
                  Continue → Your Details
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 8 }}>Tell Us About Yourself</h2>
                <p style={{ color: 'var(--muted)' }}>We'll reach out to coordinate your volunteering.</p>
              </div>

              <div className="card" style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[['name', 'Full Name *', 'text', 'Aisha Rahman'], ['email', 'Email *', 'email', 'aisha@example.com']].map(([key, label, type, ph]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>{label}</label>
                      <input type={type} placeholder={ph} value={form[key]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }} className="input-field"
                        style={{ borderColor: errors[key] ? '#dc2626' : undefined }} />
                      {errors[key] && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>⚠ {errors[key]}</p>}
                    </div>
                  ))}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Phone (optional)</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
                </div>

                {/* Availability */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 10 }}>Availability</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AVAILABILITY.map(a => (
                      <button key={a} type="button" onClick={() => toggle(avail, setAvail, a)} style={{
                        padding: '7px 14px', borderRadius: 999, border: '1.5px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: avail.includes(a) ? 'var(--emerald)' : 'rgba(26,92,56,0.2)',
                        background: avail.includes(a) ? 'rgba(26,92,56,0.08)' : 'transparent',
                        color: avail.includes(a) ? 'var(--emerald)' : 'var(--muted)',
                      }}>{a}</button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 10 }}>Special Skills (optional)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SKILLS.map(s => (
                      <button key={s} type="button" onClick={() => toggle(skills, setSkills, s)} style={{
                        padding: '7px 14px', borderRadius: 999, border: '1.5px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: skills.includes(s) ? 'var(--gold)' : 'rgba(201,151,58,0.25)',
                        background: skills.includes(s) ? 'var(--gold-pale)' : 'transparent',
                        color: skills.includes(s) ? 'var(--gold)' : 'var(--muted)',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Anything else to share? (optional)</label>
                  <textarea rows={3} placeholder="Experience, motivation, questions…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field" style={{ resize: 'vertical' }} />
                </div>

                {/* Selected roles summary */}
                <div style={{ background: 'var(--parchment)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald)', marginBottom: 8 }}>Your selected roles:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.map(r => {
                      const role = ROLES.find(x => x.id === r);
                      return <span key={r} className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{role?.icon} {role?.title}</span>;
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, border: 'none', borderRadius: 50, background: 'var(--parchment)', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                  <button onClick={submit} disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    {loading ? '⌛ Submitting…' : '🤲 Sign Up to Volunteer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: 20 }}>🤲</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--emerald)', marginBottom: 12 }}>
                JazakAllahu Khayran!
              </h2>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold)', direction: 'rtl', marginBottom: 16 }}>
                بَارَكَ اللَّهُ فِيكَ
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 32 }}>
                Your volunteer application has been received. A member of our team will contact you within 2–3 business days to discuss your roles and schedule, inshaAllah.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/" className="btn-primary">← Go Home</Link>
                <Link href="/donate" className="btn-emerald">💰 Make a Donation</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`@media(max-width:600px){
        div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
      }`}</style>
    </>
  );
}
