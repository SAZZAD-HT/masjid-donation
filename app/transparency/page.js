'use client';
// app/transparency/page.js
import { useEffect, useState } from 'react';
import { srvGetDonations as getDonations, srvGetStats as getStats, srvGetCampaigns as getCampaigns } from '../../lib/actions';

export default function TransparencyPage() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    Promise.all([getDonations(), getStats(), getCampaigns()]).then(([d, s, c]) => {
      setDonations(d);
      setStats(s);
      setCampaigns(c);
      setLoading(false);
    });
  }, []);

  const paginated = donations.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(donations.length / PER_PAGE);

  const getCampaignName = (id) => campaigns.find(c => c.id === id)?.title || 'General Donation';

  // Category breakdown
  const byCategory = donations.reduce((acc, d) => {
    const cat = d.category || 'general';
    acc[cat] = (acc[cat] || 0) + (d.amount || 0);
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <>
      {/* Header */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 64 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>📊 Full Transparency</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>
            Donation Transparency
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
            Al-Noor Masjid is committed to full financial transparency. Every donation is publicly recorded here.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '48px 0', background: 'var(--cream)', borderBottom: '1px solid rgba(26,92,56,0.08)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {[
              { label: 'Total Raised', value: `৳${(stats.totalRaised || 0).toLocaleString()}`, icon: '💰' },
              { label: 'Donations', value: (stats.totalDonations || 0).toLocaleString(), icon: '🤲' },
              { label: 'Avg. Donation', value: stats.totalDonations ? `৳${Math.round(stats.totalRaised / stats.totalDonations).toLocaleString()}` : '৳0', icon: '📈' },
              { label: 'Campaigns', value: stats.totalCampaigns || 0, icon: '🕌' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--emerald)', fontWeight: 700 }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breakdown + Table */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>

            {/* Donation Table */}
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 24, fontSize: '1.8rem' }}>
                All Donations ({donations.length})
              </h2>

              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--emerald-dark)' }}>
                      {['Donor', 'Amount', 'Campaign', 'Category', 'Date'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading donations…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>No donations yet.</td></tr>
                    ) : paginated.map((d, i) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid rgba(26,92,56,0.07)', background: i % 2 === 0 ? '#fff' : 'rgba(250,247,240,0.4)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,92,56,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'rgba(250,247,240,0.4)'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--emerald), var(--gold))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                            }}>{d.donorName?.[0]?.toUpperCase() || '?'}</div>
                            <span style={{ fontWeight: 600 }}>{d.donorName || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--emerald)', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>
                          ৳{(d.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.85rem', maxWidth: 160 }}>
                          {d.campaignId ? getCampaignName(d.campaignId) : 'General Donation'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{d.category || 'general'}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {d.createdAt?.seconds
                            ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '8px 16px', border: '1.5px solid rgba(26,92,56,0.2)', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: '#fff', color: 'var(--charcoal)', opacity: page === 1 ? 0.4 : 1 }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const n = i + 1;
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          background: page === n ? 'var(--emerald)' : '#fff',
                          color: page === n ? '#fff' : 'var(--charcoal)',
                          boxShadow: page === n ? '0 2px 8px rgba(26,92,56,0.3)' : 'none',
                        }}>{n}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '8px 16px', border: '1.5px solid rgba(26,92,56,0.2)', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: '#fff', color: 'var(--charcoal)', opacity: page === totalPages ? 0.4 : 1 }}>
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Right: Category Breakdown */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div className="card" style={{ padding: '28px 24px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: 20 }}>Donations by Category</h3>
                {loading ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>Loading…</p>
                ) : topCategories.length === 0 ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No data yet.</p>
                ) : topCategories.map(([cat, total]) => {
                  const catPct = Math.round((total / stats.totalRaised) * 100) || 0;
                  return (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{cat}</span>
                        <span style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '0.9rem' }}>৳{total.toLocaleString()}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 7 }}>
                        <div className="progress-fill" style={{ width: `${catPct}%` }} />
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 3 }}>{catPct}% of total</div>
                    </div>
                  );
                })}
              </div>

              {/* Trust badge */}
              <div style={{ background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛡️</div>
                <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Amanah Guaranteed</h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  All funds are handled with full Islamic accountability (Amanah). Financial reports available upon request.
                </p>
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
          div[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </>
  );
}
