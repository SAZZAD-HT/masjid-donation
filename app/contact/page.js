'use client';
// app/contact/page.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const SUBJECTS = [
  'General Enquiry',
  'Donation Question',
  'Zakat / Sadaqah',
  'Volunteer Opportunity',
  'Funeral / Janazah Services',
  'Nikah / Marriage Services',
  'Islamic Education',
  'Report an Issue',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Please write at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();

      setSent(true);
      toast.success('Message sent! We\'ll reply within 24 hours. JazakAllahu Khayran 🤲');
    } catch (err) {
      toast.error('Failed to send. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  const inputStyle = (key) => ({
    ...({} /* base handled by .input-field */),
    borderColor: errors[key] ? '#dc2626' : undefined,
    boxShadow: errors[key] ? '0 0 0 3px rgba(220,38,38,0.1)' : undefined,
  });

  return (
    <>
      {/* Hero */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 72 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>📬 Get in Touch</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>
            Contact Al-Noor Masjid
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
            We're here to help. Reach out for any questions about donations, services, volunteering, or community support.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'start' }}>

            {/* Form */}
            <div>
              {sent ? (
                <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--emerald)', marginBottom: 12 }}>Message Received!</h2>
                  <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 16, direction: 'rtl' }}>
                    جَزَاكَ اللَّهُ خَيْرًا
                  </div>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 28 }}>
                    We'll review your message and get back to you within 24 hours, inshaAllah.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' }); }}
                    className="btn-emerald">Send Another Message</button>
                </div>
              ) : (
                <div className="card" style={{ padding: '36px 40px' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 28, fontSize: '1.8rem' }}>Send Us a Message</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Full Name *</label>
                      <input type="text" placeholder="Aisha Rahman" value={form.name} onChange={e => set('name', e.target.value)} className="input-field" style={inputStyle('name')} />
                      {errors.name && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>⚠ {errors.name}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Email Address *</label>
                      <input type="email" placeholder="aisha@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" style={inputStyle('email')} />
                      {errors.email && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>⚠ {errors.email}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Phone (optional)</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Subject</label>
                      <select value={form.subject} onChange={e => set('subject', e.target.value)} className="input-field">
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 6 }}>Message *</label>
                    <textarea rows={6} placeholder="Tell us how we can help you…" value={form.message} onChange={e => set('message', e.target.value)}
                      className="input-field" style={{ resize: 'vertical', ...inputStyle('message') }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      {errors.message ? <p style={{ color: '#dc2626', fontSize: '0.78rem' }}>⚠ {errors.message}</p> : <span />}
                      <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{form.message.length} chars</span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', opacity: loading ? 0.75 : 1 }}>
                    {loading ? '⌛ Sending…' : '📨 Send Message'}
                  </button>

                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: 12 }}>
                    We aim to respond within 24 hours, inshaAllah.
                  </p>
                </div>
              )}
            </div>

            {/* Info sidebar */}
            <div style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Contact Details */}
              <div className="card" style={{ padding: '28px 24px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20 }}>Contact Details</h3>
                {[
                  { icon: '📍', label: 'Address', value: '123 Islamic Center Drive\nYour City, State 12345' },
                  { icon: '📞', label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: '✉️', label: 'Email', value: 'info@alnoormasjid.org' },
                  { icon: '🕐', label: 'Office Hours', value: 'Mon–Fri: 10am – 6pm\nWeekends: 9am – 5pm' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(26,92,56,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald)', marginBottom: 2 }}>{label}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Services */}
              <div style={{ background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))', borderRadius: 'var(--radius)', padding: '24px', color: '#fff' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>🚨</div>
                <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Emergency Services</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 14 }}>
                  For Janazah (funeral) services, critical illness, or urgent community needs, please call our 24-hour emergency line.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                  📞 +1 (555) 911-NOOR
                </div>
              </div>

              {/* Map placeholder */}
              <div style={{ background: 'var(--parchment)', borderRadius: 'var(--radius)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(201,151,58,0.2)', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '2.5rem' }}>🗺️</span>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0 20px' }}>
                  Embed a Google Maps iframe here with your Masjid's location
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
