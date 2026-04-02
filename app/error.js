'use client';
// app/error.js
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="geo-pattern" style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{
          width: 96, height: 96, margin: '0 auto 28px',
          background: 'rgba(220,38,38,0.15)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
          border: '2px solid rgba(220,38,38,0.3)',
        }}>⚠️</div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '2rem', marginBottom: 12 }}>
          Something Went Wrong
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 12, lineHeight: 1.8 }}>
          An unexpected error occurred. Please try again or return to the home page.
        </p>

        <p style={{ fontFamily: 'Amiri, serif', color: 'var(--gold-light)', fontSize: '1.1rem', direction: 'rtl', marginBottom: 36 }}>
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: 36 }}>
          "Indeed, with hardship comes ease." — 94:6
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '16px', marginBottom: 28, textAlign: 'left' }}>
            <code style={{ color: '#f87171', fontSize: '0.8rem', wordBreak: 'break-word' }}>
              {error?.message || 'Unknown error'}
            </code>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn-primary">🔄 Try Again</button>
          <Link href="/" className="btn-secondary">← Go Home</Link>
        </div>
      </div>
    </div>
  );
}
