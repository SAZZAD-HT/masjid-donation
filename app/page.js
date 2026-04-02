'use client';
// app/page.js — Al-Noor Masjid Home Page
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { srvGetCampaigns as getCampaigns, srvGetStats as getStats } from '../lib/actions';
import CampaignCard from '../components/CampaignCard';
import SkeletonCard from '../components/SkeletonCard';
import LiveTicker from '../components/LiveTicker';
import QuranVerse from '../components/QuranVerse';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import DonationWidget from '../components/DonationWidget';

// ── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ── Stat card with animated count ────────────────────────────────────────────
function StatCard({ icon, label, rawValue, prefix = '', suffix = '', color }) {
  const animated = useCountUp(typeof rawValue === 'number' ? rawValue : 0);
  const display = typeof rawValue === 'number'
    ? `${prefix}${animated.toLocaleString()}${suffix}`
    : rawValue;

  return (
    <div className="card" style={{ padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -12, right: -12, width: 64, height: 64, background: `${color}12`, borderRadius: '50%' }} />
      <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.1rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
        {display}
      </div>
      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{label}</div>
    </div>
  );
}

// ── Trust badge ───────────────────────────────────────────────────────────────
function TrustBadge({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function HomePage() {
  const [campaigns, setCampaigns]   = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getCampaigns(), getStats()])
      .then(([c, s]) => {
        setCampaigns(c.filter(x => x.active).slice(0, 3));
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════ HERO ══════ */}
      <section className="geo-pattern" style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        paddingTop: 100, paddingBottom: 80,
        position: 'relative',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'center' }}>

            {/* Left: Copy */}
            <div>
              <div className="badge badge-gold" style={{ marginBottom: 20 }}>✨ Al-Noor Masjid Donation Platform</div>

              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
                color: '#fff', lineHeight: 1.1, marginBottom: 24, fontWeight: 700,
              }}>
                Give Sadaqah.<br />
                <span style={{ color: 'var(--gold-light)' }}>Change Lives.</span>
              </h1>

              {/* Quran verse */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold-light)', direction: 'rtl', marginBottom: 6, lineHeight: 1.6 }}>
                  مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  "Who will loan Allah a goodly loan so He may multiply it for him?" — 2:245
                </p>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', marginBottom: 36, lineHeight: 1.8, maxWidth: 520 }}>
                Support our Masjid, fund education, feed the hungry, and uplift our community. Every donation earns eternal reward with Allah ﷻ.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href="/donate" className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
                  🤲 Donate Now
                </Link>
                <Link href="/campaigns" className="btn-secondary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
                  View Campaigns
                </Link>
                <Link href="/zakat" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: 'var(--gold-light)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600,
                  padding: '16px 0', borderBottom: '1px solid rgba(201,151,58,0.3)',
                }}>
                  🧮 Calculate Zakat →
                </Link>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <TrustBadge icon="🔒" text="Secure & Trusted" />
                <TrustBadge icon="📋" text="Registered Nonprofit" />
                <TrustBadge icon="📊" text="100% Transparent" />
              </div>
            </div>

            {/* Right: Quick donate widget */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -16, background: 'rgba(201,151,58,0.08)', borderRadius: 32, filter: 'blur(20px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <DonationWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" style={{ display: 'block', fill: 'var(--cream)' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ STATS ══ */}
      <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <StatCard icon="💰" label="Total Raised"       rawValue={stats.totalRaised || 0} prefix="৳"       color="var(--gold)" />
            <StatCard icon="🤲" label="Donations Made"      rawValue={stats.totalDonations || 0}              color="var(--emerald)" />
            <StatCard icon="📋" label="Active Campaigns"    rawValue={stats.activeCampaigns || 0}             color="#6366f1" />
            <StatCard icon="👥" label="Community Members"   rawValue={2400} suffix="+"                        color="#ec4899" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════ LIVE FEED + VERSE ══ */}
      <section style={{ padding: '64px 0', background: 'var(--parchment)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>

            {/* Live Ticker */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="badge badge-emerald" style={{ marginBottom: 8 }}>⚡ Real-Time</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem' }}>Live Donations</h2>
              </div>
              <LiveTicker maxItems={6} />
            </div>

            {/* Rotating Quran verse */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="badge badge-gold" style={{ marginBottom: 8 }}>📖 Inspiration</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem' }}>Verse of the Moment</h2>
              </div>
              <QuranVerse autoRotate intervalMs={9000} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ ACTIVE CAMPAIGNS ══ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-emerald" style={{ marginBottom: 12 }}>🌙 Support a Cause</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>Active Campaigns</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Each campaign is a chance to earn Sadaqah Jariyah — ongoing reward even after you're gone.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : campaigns.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕌</div>
              <p>No active campaigns right now. Check back soon.</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/campaigns" className="btn-emerald">See All Campaigns →</Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════ WHY GIVE + PRAYER ══ */}
      <section className="section" style={{ background: 'var(--parchment)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'start' }}>

            {/* Why give */}
            <div>
              <div className="badge badge-gold" style={{ marginBottom: 16 }}>📖 Why Give?</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: 24 }}>
                Every Gift Matters to Allah ﷻ
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9, marginBottom: 28, fontSize: '1.02rem' }}>
                The Prophet ﷺ said: <em style={{ color: 'var(--emerald)' }}>"Charity does not decrease wealth, and the servant who forgives, Allah adds to his respect."</em>
                <br /><br />
                Your donation builds masajid, educates children, feeds families, and delivers water to the thirsty. Every cent is multiplied by Allah ﷻ.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                {[
                  { icon: '🕌', title: 'Masjid Upkeep',    desc: 'Maintenance, utilities & operations' },
                  { icon: '📚', title: 'Education',         desc: 'Islamic school & Quran classes' },
                  { icon: '🍽️', title: 'Food Programs',     desc: 'Iftar, food bank & family aid' },
                  { icon: '💧', title: 'Clean Water',       desc: 'Wells & water access projects' },
                  { icon: '🏥', title: 'Medical Aid',       desc: 'Emergency health assistance' },
                  { icon: '⭐', title: 'Youth Programs',    desc: 'Sports, camps & mentoring' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="card" style={{ padding: '18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.88rem', marginBottom: 3 }}>{title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/donate" className="btn-primary">🤲 Donate Now</Link>
                <Link href="/volunteer" className="btn-emerald">🙋 Volunteer</Link>
              </div>
            </div>

            {/* Prayer times widget */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ marginBottom: 16 }}>
                <div className="badge badge-emerald" style={{ marginBottom: 8 }}>🕌 Today's Schedule</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem' }}>Prayer Times</h3>
              </div>
              <PrayerTimesWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ IMPACT NUMBERS ══ */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-gold" style={{ marginBottom: 12 }}>📈 Our Impact</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>25 Years of Serving the Ummah</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28 }}>
            {[
              { icon: '🕌', number: '25+', label: 'Years of Service' },
              { icon: '👨‍👩‍👧', number: '2,400+', label: 'Registered Families' },
              { icon: '📚', number: '150+', label: 'Students Weekly' },
              { icon: '🤲', number: '৳2 কোটি+', label: 'Zakat Distributed' },
              { icon: '🍽️', number: '50,000+', label: 'Meals Served' },
              { icon: '💧', number: '12', label: 'Wells Built' },
            ].map(({ icon, number, label }) => (
              <div key={label} className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--emerald)', fontWeight: 700, marginBottom: 6 }}>{number}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ CTA ══ */}
      <section className="geo-pattern" style={{ padding: '96px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: 12, direction: 'rtl', lineHeight: 1.6 }}>
            وَأَنفِقُوا فِي سَبِيلِ اللَّهِ وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: 36 }}>
            "Spend in the way of Allah and do not throw yourselves into destruction." — 2:195
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 16 }}>
            Ready to Make a Difference?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.8 }}>
            Join thousands of donors who have made Al-Noor Masjid a beacon of light for our community.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/donate" className="btn-primary" style={{ fontSize: '1.1rem', padding: '18px 44px' }}>
              🌙 Donate Today
            </Link>
            <Link href="/transparency" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '18px 44px' }}>
              📊 View Transparency
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          section:first-of-type .container > div { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          section .container > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          section .container > div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </>
  );
}
