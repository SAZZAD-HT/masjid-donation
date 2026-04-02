'use client';
// app/donate/page.js
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { srvSubmitDonation as submitDonation, srvGetCampaigns as getCampaigns } from '../../lib/actions';

const AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];
const CATEGORIES = ['masjid', 'education', 'food', 'relief', 'water', 'medical', 'youth', 'zakat', 'general'];

function DonateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignIdParam = searchParams.get('campaign') || '';
  const amountParam = searchParams.get('amount') || '';

  const [campaigns, setCampaigns] = useState([]);
  const [step, setStep] = useState(1); // 1=amount, 2=details, 3=confirm, 4=success
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    amount: amountParam ? 'custom' : '',
    customAmount: amountParam || '',
    donorName: '',
    email: '',
    phone: '',
    campaignId: campaignIdParam,
    donationType: 'one-time',
    anonymous: false,
    message: '',
    category: 'general',
    paymentMethod: 'card',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCampaigns().then(c => setCampaigns(c.filter(x => x.active)));
  }, []);

  const totalAmount = form.amount === 'custom'
    ? Number(form.customAmount) || 0
    : Number(form.amount) || 0;

  const validate = () => {
    const e = {};
    if (totalAmount <= 0) e.amount = 'Please enter a valid donation amount.';
    if (!form.anonymous) {
      if (!form.donorName.trim()) e.donorName = 'Name is required.';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const ref = await submitDonation({
        ...form,
        amount: totalAmount,
        donorName: form.anonymous ? 'Anonymous' : form.donorName,
      });
      toast.success('JazakAllahu Khayran! Your donation was received. 🤲');
      // Redirect to printable receipt
      router.push(`/receipt/${ref.id}`);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: undefined })); }}
        placeholder={placeholder}
        className="input-field"
      />
      {errors[name] && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 4 }}>⚠ {errors[name]}</p>}
    </div>
  );

  if (step === 4) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '24px', animation: 'pulse 1s' }}>🤲</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '16px', color: 'var(--emerald)' }}>
          JazakAllahu Khayran!
        </h2>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '16px', direction: 'rtl' }}>
          بَارَكَ اللَّهُ فِيكَ
        </div>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '32px' }}>
          Your donation of <strong style={{ color: 'var(--emerald)' }}>৳{totalAmount.toLocaleString()}</strong> has been received.
          May Allah ﷻ reward you abundantly and accept it as Sadaqah Jariyah.
        </p>
        <a href="/" className="btn-primary" style={{ display: 'inline-block' }}>← Return Home</a>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '120px 24px 80px' }}>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '48px', borderRadius: 99, overflow: 'hidden', border: '1.5px solid rgba(26,92,56,0.15)' }}>
        {['Amount', 'Details', 'Confirm'].map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={label} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', cursor: done ? 'pointer' : 'default',
              background: active ? 'var(--emerald)' : done ? 'var(--emerald-dark)' : 'var(--white)',
              color: active || done ? '#fff' : 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
            }} onClick={() => done && setStep(num)}>
              {done ? '✓ ' : `${num}. `}{label}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '40px' }}>

        {/* ── STEP 1: Amount ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '8px' }}>Choose an Amount</h2>
              <p style={{ color: 'var(--muted)' }}>Select a preset or enter your own.</p>
            </div>

            {/* Preset amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {AMOUNTS.map(amt => (
                <button key={amt} onClick={() => { setForm(f => ({ ...f, amount: amt, customAmount: '' })); setErrors(e => ({ ...e, amount: undefined })); }} style={{
                  padding: '16px', border: '2px solid', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
                  borderColor: form.amount === amt ? 'var(--gold)' : 'rgba(26,92,56,0.15)',
                  background: form.amount === amt ? 'var(--gold-pale)' : 'var(--white)',
                  color: form.amount === amt ? 'var(--gold)' : 'var(--charcoal)',
                  transition: 'all 0.2s',
                }}>৳{amt.toLocaleString()}</button>
              ))}
            </div>

            {/* Custom */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)', display: 'block', marginBottom: 6 }}>
                Or enter custom amount (৳)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 75"
                value={form.customAmount}
                onChange={e => { setForm(f => ({ ...f, amount: 'custom', customAmount: e.target.value })); setErrors(er => ({ ...er, amount: undefined })); }}
                className="input-field"
              />
              {errors.amount && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 4 }}>⚠ {errors.amount}</p>}
            </div>

            {/* Donation type */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)', display: 'block', marginBottom: 8 }}>Donation Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[['one-time', '🌟 One-Time'], ['monthly', '🔄 Monthly']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setForm(f => ({ ...f, donationType: val }))} style={{
                    flex: 1, padding: '12px', border: '2px solid', borderRadius: 12, cursor: 'pointer', fontWeight: 600,
                    borderColor: form.donationType === val ? 'var(--emerald)' : 'rgba(26,92,56,0.15)',
                    background: form.donationType === val ? 'rgba(26,92,56,0.08)' : 'var(--white)',
                    color: form.donationType === val ? 'var(--emerald)' : 'var(--muted)',
                    transition: 'all 0.2s',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            {/* Campaign */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)', display: 'block', marginBottom: 6 }}>Campaign (Optional)</label>
              <select value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))} className="input-field">
                <option value="">— General Donation —</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)', display: 'block', marginBottom: 6 }}>Donation Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <button className="btn-primary" onClick={() => { if (totalAmount > 0) setStep(2); else setErrors({ amount: 'Please select or enter an amount.' }); }} style={{ width: '100%', justifyContent: 'center' }}>
              Continue → Details
            </button>
          </div>
        )}

        {/* ── STEP 2: Details ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '8px' }}>Your Details</h2>
              <p style={{ color: 'var(--muted)' }}>We'll send you a receipt and acknowledgment.</p>
            </div>

            {/* Anonymous toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--parchment)', borderRadius: 12 }}>
              <input type="checkbox" id="anon" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: 'var(--emerald)', cursor: 'pointer' }} />
              <label htmlFor="anon" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                🕊️ Donate Anonymously
              </label>
            </div>

            {!form.anonymous && (
              <>
                {field('donorName', 'Full Name', 'text', 'আব্দুল রহমান')}
                {field('email', 'Email Address', 'email', 'example@email.com')}
                {field('phone', 'Phone Number (optional)', 'tel', '+880 1XXX-XXXXXX')}
              </>
            )}

            {/* Message */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)' }}>
                Message / Dua Request (optional)
              </label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Share a message or request a dua…"
                rows={3} className="input-field" style={{ resize: 'vertical' }} />
            </div>

            {/* Payment method */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald)', display: 'block', marginBottom: 8 }}>Payment Method</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[['card', '💳 Card'], ['bank', '🏦 Bank Transfer'], ['cash', '💵 Cash at Masjid']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setForm(f => ({ ...f, paymentMethod: val }))} style={{
                    flex: 1, minWidth: 120, padding: '12px', border: '2px solid', borderRadius: 12, cursor: 'pointer', fontWeight: 600,
                    borderColor: form.paymentMethod === val ? 'var(--emerald)' : 'rgba(26,92,56,0.15)',
                    background: form.paymentMethod === val ? 'rgba(26,92,56,0.08)' : 'var(--white)',
                    color: form.paymentMethod === val ? 'var(--emerald)' : 'var(--muted)',
                    transition: 'all 0.2s', fontSize: '0.9rem',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'var(--parchment)', color: 'var(--charcoal)', border: 'none' }}>
                ← Back
              </button>
              <button onClick={() => { if (validate()) setStep(3); }} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                Review Donation →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '8px' }}>Review & Confirm</h2>
              <p style={{ color: 'var(--muted)' }}>Please verify your donation details below.</p>
            </div>

            <div style={{ background: 'var(--parchment)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['💰 Amount', `৳${totalAmount.toLocaleString()}`],
                ['🔄 Type', form.donationType === 'monthly' ? 'Monthly Recurring' : 'One-Time'],
                ['👤 Donor', form.anonymous ? 'Anonymous' : form.donorName || '—'],
                ['✉️ Email', form.anonymous ? '—' : form.email || '—'],
                ['📋 Category', form.category],
                ['💳 Payment', form.paymentMethod],
                form.campaignId && ['🎯 Campaign', campaigns.find(c => c.id === form.campaignId)?.title || 'Campaign'],
                form.message && ['💬 Message', form.message],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--emerald)', borderRadius: 16, color: '#fff' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Donation</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                ৳{totalAmount.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: 50, background: 'var(--parchment)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                ← Edit
              </button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⌛ Processing…' : '🤲 Confirm Donation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="geo-pattern" style={{ paddingTop: 80, paddingBottom: 0 }}>
        <div style={{ height: 60 }} />
        <div style={{ textAlign: 'center', paddingBottom: 40 }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: 'var(--gold-light)', direction: 'rtl', marginBottom: 8 }}>
            وَأَنفِقُوا فِي سَبِيلِ اللَّهِ
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            "Spend in the way of Allah" — 2:195
          </p>
        </div>
        <svg viewBox="0 0 1440 40" style={{ display: 'block', fill: 'var(--cream)', marginBottom: -1 }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </div>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: 80 }}>Loading…</div>}>
        <DonateForm />
      </Suspense>
    </div>
  );
}
