'use client';
// components/DonationWidget.js
// A compact quick-donate widget that can be embedded anywhere
import { useState } from 'react';
import Link from 'next/link';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function DonationWidget({ campaignId = '', compact = false }) {
  const [selected, setSelected] = useState(1000);
  const [custom, setCustom] = useState('');

  const amount = custom ? Number(custom) : selected;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius)',
      padding: compact ? '20px' : '32px',
      border: '1.5px solid rgba(201,151,58,0.25)',
      boxShadow: 'var(--shadow-md)',
    }}>
      {!compact && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.2rem', color: 'var(--gold)', direction: 'rtl', marginBottom: 4 }}>
            وَمَا تُنفِقُوا مِنْ خَيْرٍ يُوَفَّ إِلَيْكُمْ
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            "Whatever you spend of good will be given back to you." — 2:272
          </p>
        </div>
      )}

      <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 16, fontSize: compact ? '1rem' : '1.2rem', textAlign: 'center' }}>
        Quick Donate
      </h3>

      {/* Preset amounts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {QUICK_AMOUNTS.map(amt => (
          <button key={amt} onClick={() => { setSelected(amt); setCustom(''); }} style={{
            padding: '10px 4px', border: '2px solid', borderRadius: 10, cursor: 'pointer',
            fontWeight: 700, fontSize: '0.9rem',
            borderColor: selected === amt && !custom ? 'var(--gold)' : 'rgba(26,92,56,0.15)',
            background: selected === amt && !custom ? 'var(--gold-pale)' : 'transparent',
            color: selected === amt && !custom ? 'var(--gold)' : 'var(--charcoal)',
            transition: 'all 0.15s',
          }}>৳{amt.toLocaleString()}</button>
        ))}
      </div>

      {/* Custom */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontWeight: 700 }}>৳</span>
        <input
          type="number" min="1" placeholder="Custom amount"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected(0); }}
          className="input-field"
          style={{ paddingLeft: 28 }}
        />
      </div>

      {/* CTA */}
      <Link
        href={`/donate?campaign=${campaignId}&amount=${amount}`}
        className="btn-primary"
        style={{ display: 'block', textAlign: 'center', width: '100%' }}
      >
        🤲 Donate ৳{amount > 0 ? amount.toLocaleString() : '—'} Now
      </Link>

      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', marginTop: 12 }}>
        🔒 Secure · জাযাকাল্লাহু খাইরান
      </p>
    </div>
  );
}
