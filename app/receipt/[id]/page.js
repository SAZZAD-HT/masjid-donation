'use client';
// app/receipt/[id]/page.js
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatCurrency } from '../../../lib/utils';

export default function ReceiptPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/donations?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setDonation)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕌</div>
        <p>Loading receipt…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>❓</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Receipt Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>This donation receipt could not be found.</p>
        <Link href="/" className="btn-primary">← Go Home</Link>
      </div>
    </div>
  );

  const receiptNum = `ANM-${donation.id.slice(0, 8).toUpperCase()}`;
  const donationDate = donation.createdAt?.seconds
    ? new Date(donation.createdAt.seconds * 1000)
    : new Date();

  return (
    <>
      {/* Print styles injected inline */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .receipt-card { animation: fadeIn 0.5s ease; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--parchment)', paddingTop: 100, paddingBottom: 80 }}>

        {/* Actions bar */}
        <div className="no-print container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <Link href="/" style={{ color: 'var(--emerald)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.print()} className="btn-emerald" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
              🖨️ Print Receipt
            </button>
            <button onClick={() => {
              const text = `I donated ${formatCurrency(donation.amount)} to Al-Noor Masjid! Join me in supporting our community: ${window.location.origin}/donate`;
              if (navigator.share) navigator.share({ text, url: `${window.location.origin}/donate` });
              else { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); }
            }} style={{ padding: '10px 22px', border: '1.5px solid var(--emerald)', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: 'transparent', color: 'var(--emerald)' }}>
              📢 Share
            </button>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="receipt-card" style={{
          maxWidth: 680, margin: '0 auto', padding: '0 24px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(201,151,58,0.15)',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--emerald-dark) 0%, var(--emerald) 60%, var(--emerald-dark) 100%)',
              padding: '48px 48px 36px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Geometric decoration */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, border: '2px solid rgba(201,151,58,0.2)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, border: '2px solid rgba(201,151,58,0.15)', borderRadius: '50%' }} />

              <div style={{
                width: 72, height: 72, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #c9973a, #e8b84b)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 4px 20px rgba(201,151,58,0.4)',
                position: 'relative', zIndex: 1,
              }}>☪</div>

              <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1.8rem', marginBottom: 4, position: 'relative', zIndex: 1 }}>
                Al-Noor Masjid
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                Donation Receipt
              </p>

              {/* Amount hero */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '20px 32px',
                display: 'inline-block',
                border: '1.5px solid rgba(201,151,58,0.3)',
                position: 'relative', zIndex: 1,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Donation Amount</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1 }}>
                  {formatCurrency(donation.amount)}
                </div>
              </div>
            </div>

            {/* Thank you message */}
            <div style={{ background: 'var(--gold-pale)', padding: '20px 48px', textAlign: 'center', borderBottom: '1px dashed rgba(201,151,58,0.3)' }}>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold)', direction: 'rtl', marginBottom: 4 }}>
                جَزَاكَ اللَّهُ خَيْرًا كَثِيرًا
              </div>
              <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '0.88rem' }}>
                "May Allah reward you with abundant goodness"
              </p>
            </div>

            {/* Receipt Details */}
            <div style={{ padding: '36px 48px' }}>
              <div style={{ display: 'grid', gap: 0 }}>
                {[
                  ['Receipt Number', receiptNum, true],
                  ['Date', donationDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), false],
                  ['Donor Name', donation.donorName || 'Anonymous', false],
                  donation.email && ['Email', donation.email, false],
                  ['Donation Type', donation.donationType === 'monthly' ? '🔄 Monthly Recurring' : '🌟 One-Time', false],
                  ['Category', donation.category?.charAt(0).toUpperCase() + donation.category?.slice(1), false],
                  ['Payment Method', { card: '💳 Card', bank: '🏦 Bank Transfer', cash: '💵 Cash at Masjid' }[donation.paymentMethod] || donation.paymentMethod, false],
                  ['Status', '✅ Completed', false],
                ].filter(Boolean).map(([label, value, bold]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0', borderBottom: '1px solid rgba(26,92,56,0.07)',
                    gap: 16,
                  }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.88rem', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontWeight: bold ? 800 : 600, fontSize: '0.92rem', textAlign: 'right', color: bold ? 'var(--emerald)' : 'var(--charcoal)', fontFamily: bold ? 'monospace' : 'inherit', letterSpacing: bold ? '0.08em' : 'normal' }}>{value}</span>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px 24px', marginTop: 16,
                  background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
                  borderRadius: 14, color: '#fff',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Donated</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              </div>

              {/* Message */}
              {donation.message && (
                <div style={{ marginTop: 24, background: 'var(--parchment)', borderRadius: 12, padding: '16px 20px', borderLeft: '4px solid var(--gold)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--emerald)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Message</div>
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, fontSize: '0.92rem' }}>"{donation.message}"</p>
                </div>
              )}

              {/* Tax info */}
              <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(26,92,56,0.04)', borderRadius: 12, border: '1px solid rgba(26,92,56,0.1)' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.7 }}>
                  📋 <strong>দান রশিদ:</strong> আল-নূর মসজিদ একটি নিবন্ধিত অলাভজনক প্রতিষ্ঠান।
                  আপনার {formatCurrency(donation.amount)} দানের এই রশিদটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।
                  এই দানের বিনিময়ে কোনো পণ্য বা সেবা প্রদান করা হয়নি।
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px dashed rgba(26,92,56,0.15)', padding: '24px 48px', textAlign: 'center', background: 'var(--cream)' }}>
              <div style={{ fontFamily: 'Amiri, serif', color: 'var(--emerald)', fontSize: '1.1rem', direction: 'rtl', marginBottom: 8 }}>
                وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', fontStyle: 'italic', marginBottom: 16 }}>
                "Whatever good you spend is for yourselves." — Quran 2:272
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                Al-Noor Masjid · Matlab, Chandpur · Bangladesh<br />
                📞 +880 1XXX-XXXXXX · ✉️ info@alnoormasjid.org
              </div>
            </div>
          </div>
        </div>

        {/* Post-receipt CTAs */}
        <div className="no-print" style={{ maxWidth: 680, margin: '32px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { icon: '🔄', label: 'Donate Again', href: '/donate', primary: true },
              { icon: '📋', label: 'View Campaigns', href: '/campaigns', primary: false },
              { icon: '🧮', label: 'Zakat Calculator', href: '/zakat', primary: false },
            ].map(({ icon, label, href, primary }) => (
              <Link key={href} href={href} className={primary ? 'btn-primary' : 'btn-emerald'}
                style={{ justifyContent: 'center', textAlign: 'center', fontSize: '0.88rem', padding: '12px 8px' }}>
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
