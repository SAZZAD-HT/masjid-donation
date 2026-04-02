// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="geo-pattern" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>

        <div style={{ fontFamily: 'Amiri, serif', fontSize: '4rem', color: 'var(--gold-light)', marginBottom: 16, lineHeight: 1 }}>
          ٤٠٤
        </div>

        <div style={{
          width: 100, height: 100, margin: '0 auto 32px',
          background: 'rgba(201,151,58,0.15)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3.5rem',
          border: '2px solid rgba(201,151,58,0.3)',
        }}>
          🕌
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '2.5rem', marginBottom: 16 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 12, lineHeight: 1.8, fontSize: '1.05rem' }}>
          This page does not exist. Perhaps it was moved, or you typed the wrong address.
        </p>
        <p style={{ fontFamily: 'Amiri, serif', color: 'var(--gold-light)', fontSize: '1.2rem', direction: 'rtl', marginBottom: 40 }}>
          إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">← Go Home</Link>
          <Link href="/campaigns" className="btn-secondary">View Campaigns</Link>
        </div>
      </div>
    </div>
  );
}
