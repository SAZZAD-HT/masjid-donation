'use client';
// app/campaigns/[id]/page.js
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { srvGetCampaign as getCampaign, srvGetDonationsByCampaign as getDonationsByCampaign } from '../../../lib/actions';

const ICONS = {
  masjid: '🕌', education: '📚', food: '🍽️', relief: '🤲',
  water: '💧', medical: '🏥', youth: '⭐', zakat: '💰', general: '☪️',
};

const MOTIVATIONAL = [
  '"The believer\'s shade on the Day of Resurrection will be his charity." — Prophet ﷺ',
  '"Give charity without delay, for it stands in the way of calamity." — Prophet ﷺ',
  '"Charity extinguishes sin as water extinguishes fire." — Prophet ﷺ',
  '"The best charity is that given when one is wealthy." — Prophet ﷺ',
];

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getCampaign(id), getDonationsByCampaign(id)])
      .then(([c, d]) => {
        if (!c) { router.push('/campaigns'); return; }
        setCampaign(c);
        setDonations(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🕌</div>
        <p>Loading campaign…</p>
      </div>
    </div>
  );

  if (!campaign) return null;

  const {
    title, description, goalAmount = 0, raisedAmount = 0,
    donorCount = 0, category = 'general', endDate, active,
    imageUrl,
  } = campaign;

  const pct = Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) || 0;
  const icon = ICONS[category] || '☪️';
  const remaining = Math.max(0, goalAmount - raisedAmount);
  const daysLeft = endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - Date.now()) / 86400000))
    : null;

  return (
    <>
      {/* Hero */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 60 }}>
        <div className="container">
          <Link href="/campaigns" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← All Campaigns
          </Link>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <span className="badge badge-gold">{category}</span>
            <span className={`badge ${active ? 'badge-emerald' : 'badge-red'}`}>{active ? '🟢 Active' : '🔴 Closed'}</span>
            {daysLeft !== null && <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>⏱ {daysLeft} days left</span>}
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', maxWidth: 700 }}>
            {icon} {title}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

            {/* Left: Description + Donors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Image */}
              {imageUrl && (
                <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: 300, background: 'var(--parchment)' }}>
                  <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Description */}
              <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 16 }}>About This Campaign</h2>
                <p style={{ color: 'var(--muted)', lineHeight: 1.9, fontSize: '1.02rem', whiteSpace: 'pre-wrap' }}>
                  {description || 'No description provided.'}
                </p>
              </div>

              {/* Quote */}
              <div style={{
                background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
                borderRadius: 'var(--radius)', padding: '28px 32px',
                borderLeft: '5px solid var(--gold)',
              }}>
                <div style={{ fontFamily: 'Amiri, serif', color: 'rgba(255,255,255,0.5)', fontSize: '3rem', lineHeight: 0.5, marginBottom: 12 }}>"</div>
                <p style={{ color: '#fff', fontStyle: 'italic', lineHeight: 1.8, fontSize: '1.05rem' }}>{quote}</p>
              </div>

              {/* Recent Donors */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: 20 }}>
                  Recent Donors ({donorCount})
                </h3>
                {donations.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤲</div>
                    <p>Be the first to donate to this campaign!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {donations.slice(0, 10).map((d, i) => (
                      <div key={d.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0',
                        borderBottom: i < donations.length - 1 ? '1px solid rgba(26,92,56,0.08)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--emerald), var(--gold))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                          }}>
                            {d.donorName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.donorName || 'Anonymous'}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                              {d.createdAt?.seconds
                                ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Recently'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--emerald)', fontSize: '1.1rem' }}>
                            ৳{(d.amount || 0).toLocaleString()}
                          </div>
                          {d.message && (
                            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', maxWidth: 160, textAlign: 'right', fontStyle: 'italic', marginTop: 2 }}>
                              "{d.message.slice(0, 50)}{d.message.length > 50 ? '…' : ''}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {donations.length > 10 && (
                      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: 16 }}>
                        + {donations.length - 10} more generous donors
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Sticky Donation Widget */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div className="card" style={{ padding: '32px' }}>

                {/* Raised */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', fontWeight: 700, color: 'var(--emerald)', lineHeight: 1 }}>
                    ৳{raisedAmount.toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
                    raised of <strong style={{ color: 'var(--charcoal)' }}>৳{goalAmount.toLocaleString()}</strong> goal
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar" style={{ marginBottom: 8, height: 12 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 24 }}>
                  <span style={{ color: 'var(--muted)' }}>{pct}% funded</span>
                  <span style={{ color: 'var(--muted)' }}>{donorCount} donors</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    ['💵', 'Remaining', `৳${remaining.toLocaleString()}`],
                    ['👥', 'Donors', donorCount],
                    daysLeft !== null ? ['⏱', 'Days Left', daysLeft === 0 ? 'Ended' : daysLeft] : null,
                    ['📊', 'Progress', `${pct}%`],
                  ].filter(Boolean).map(([icon, label, value]) => (
                    <div key={label} style={{ background: 'var(--parchment)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '1rem' }}>{value}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {active ? (
                  <Link href={`/donate?campaign=${id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', fontSize: '1.1rem', padding: '16px' }}>
                    🤲 Donate to This Campaign
                  </Link>
                ) : (
                  <div style={{ background: 'var(--parchment)', borderRadius: 12, padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    This campaign has ended. JazakAllahu Khayran to all donors!
                  </div>
                )}

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Link href="/donate" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Or make a general donation →
                  </Link>
                </div>
              </div>

              {/* Share box */}
              <div className="card" style={{ padding: '24px', marginTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📢</div>
                <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Spread the Word</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 16 }}>Share this campaign and earn reward for every donation made through your share.</p>
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }} className="btn-emerald" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '12px' }}>
                  🔗 Share Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}
