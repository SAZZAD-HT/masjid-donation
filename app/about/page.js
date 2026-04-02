'use client';
// app/about/page.js
import Link from 'next/link';

const PRAYER_TIMES = [
  { name: 'Fajr', arabic: 'الفجر', time: '5:15 AM', adhan: '5:00 AM', iqama: '5:20 AM' },
  { name: 'Dhuhr', arabic: 'الظهر', time: '12:30 PM', adhan: '12:15 PM', iqama: '1:00 PM' },
  { name: 'Asr', arabic: 'العصر', time: '3:45 PM', adhan: '3:30 PM', iqama: '4:00 PM' },
  { name: 'Maghrib', arabic: 'المغرب', time: '6:20 PM', adhan: '6:20 PM', iqama: '6:25 PM' },
  { name: 'Isha', arabic: 'العشاء', time: '7:45 PM', adhan: '7:30 PM', iqama: '8:00 PM' },
  { name: "Jumu'ah", arabic: 'الجمعة', time: '1:00 PM', adhan: '12:30 PM', iqama: '1:15 PM', special: true },
];

const TEAM = [
  { name: 'Sheikh Abdullah Al-Farouq', role: 'Imam & Religious Director', emoji: '👳' },
  { name: 'Dr. Yasmin Hassan', role: 'Executive Director', emoji: '👩' },
  { name: 'Br. Khalid Ibrahim', role: 'Finance & Treasurer', emoji: '👨' },
  { name: 'Sr. Maryam Siddiqui', role: 'Education Coordinator', emoji: '👩‍🏫' },
  { name: 'Br. Omar Al-Rashid', role: 'Community Outreach', emoji: '🤝' },
  { name: 'Sr. Hafsa Malik', role: 'Volunteer Coordinator', emoji: '💪' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '2.5rem', color: 'var(--gold-light)', marginBottom: 16, direction: 'rtl' }}>
            مَسْجِد النُّور
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>
            About Al-Noor Masjid
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
            Serving our community with faith, compassion, and excellence since 1998.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section" style={{ paddingTop: 64 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <div className="badge badge-gold" style={{ marginBottom: 16 }}>🕌 Our Mission</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: 20 }}>
                A Home for Every Muslim
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9, marginBottom: 16, fontSize: '1.02rem' }}>
                Al-Noor Masjid was founded in 1998 by a small group of dedicated community members who wanted a place where every Muslim — regardless of background, nationality, or school of thought — could feel welcome and at home.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9, marginBottom: 28, fontSize: '1.02rem' }}>
                Today, we serve over 2,400 registered families and provide daily prayers, Islamic education, community services, and social support programmes.
              </p>
              <Link href="/donate" className="btn-primary">Support Our Mission</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '🕌', val: '25+', label: 'Years of Service' },
                { icon: '👥', val: '2,400+', label: 'Registered Families' },
                { icon: '📚', val: '150+', label: 'Students Weekly' },
                { icon: '🤲', val: '$2M+', label: 'Distributed in Zakat' },
              ].map(({ icon, val, label }) => (
                <div key={label} className="card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--emerald)', fontWeight: 700 }}>{val}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prayer Times */}
          <div style={{ marginBottom: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="badge badge-emerald" style={{ marginBottom: 12 }}>🌙 Daily Schedule</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>Prayer Times</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {PRAYER_TIMES.map((p) => (
                <div key={p.name} className="card" style={{
                  padding: '24px',
                  borderLeft: p.special ? '4px solid var(--gold)' : '4px solid var(--emerald)',
                  background: p.special ? 'linear-gradient(135deg, #fffbf0, #fff)' : '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: p.special ? 'var(--gold)' : 'var(--emerald)' }}>{p.name}</div>
                      <div style={{ fontFamily: 'Amiri, serif', color: 'var(--muted)', fontSize: '1.1rem' }}>{p.arabic}</div>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--charcoal)' }}>{p.time}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--muted)' }}>
                    <span>📢 Adhan: {p.adhan}</span>
                    <span>🕌 Iqama: {p.iqama}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: 16 }}>
              * Prayer times are approximate and may vary by season. Please confirm with the Masjid directly.
            </p>
          </div>

          {/* Team */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="badge badge-gold" style={{ marginBottom: 12 }}>👥 Leadership</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>Our Team</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
              {TEAM.map(({ name, role, emoji }) => (
                <div key={name} className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2rem',
                  }}>{emoji}</div>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>{name}</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="geo-pattern" style={{ padding: '80px 0', marginTop: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 24 }}>
            Join Our Community
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8 }}>
            Whether through prayer, volunteering, or donation — there is a place for you at Al-Noor Masjid.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/donate" className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>🤲 Donate Now</Link>
            <Link href="/campaigns" className="btn-secondary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>View Campaigns</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
