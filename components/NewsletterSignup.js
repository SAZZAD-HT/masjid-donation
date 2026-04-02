'use client';
// components/NewsletterSignup.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function NewsletterSignup({ dark = false }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      if (!res.ok) throw new Error();
      
      setDone(true);
      toast.success('Subscribed! JazakAllahu Khayran. 🤲');
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,92,56,0.05)';
  const border = dark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(26,92,56,0.12)';
  const color = dark ? '#fff' : 'var(--charcoal)';
  const mutedColor = dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)';

  if (done) return (
    <div style={{ textAlign: 'center', padding: '28px 24px', background: bg, borderRadius: 'var(--radius)', border }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>✉️</div>
      <p style={{ color: dark ? '#fff' : 'var(--emerald)', fontWeight: 700, marginBottom: 4 }}>You're subscribed!</p>
      <p style={{ color: mutedColor, fontSize: '0.85rem' }}>We'll keep you updated on campaigns and community news.</p>
    </div>
  );

  return (
    <div style={{ background: bg, borderRadius: 'var(--radius)', padding: '28px 24px', border }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: '1.5rem' }}>📬</span>
        <h4 style={{ fontFamily: 'Playfair Display, serif', color, fontSize: '1.1rem' }}>Stay Updated</h4>
      </div>
      <p style={{ color: mutedColor, fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.7 }}>
        Get notified about new campaigns, community news, and Jumu'ah reminders.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          style={{
            flex: 1,
            background: dark ? 'rgba(255,255,255,0.1)' : '#fff',
            color: dark ? '#fff' : 'var(--charcoal)',
            borderColor: dark ? 'rgba(255,255,255,0.2)' : undefined,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 18px', border: 'none', borderRadius: 8,
            background: 'var(--gold)', color: 'var(--emerald-dark)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            flexShrink: 0, transition: 'opacity 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '…' : 'Subscribe'}
        </button>
      </form>
      <p style={{ color: mutedColor, fontSize: '0.72rem', marginTop: 10 }}>
        🔒 No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
