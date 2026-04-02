'use client';
// components/Footer.js
import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

const NAV_GROUPS = [
  {
    heading: 'Give',
    links: [
      ['/donate', '💰 Make a Donation'],
      ['/campaigns', '📋 Campaigns'],
      ['/zakat', '🧮 Zakat Calculator'],
      ['/transparency', '📊 Transparency'],
    ],
  },
  {
    heading: 'Community',
    links: [
      ['/about', '🕌 About the Masjid'],
      ['/volunteer', '🤲 Volunteer'],
      ['/contact', '📬 Contact Us'],
      ['/admin', '🔐 Admin Panel'],
    ],
  },
];

const PRAYER_TIMES = [
  ['Fajr', '5:15 AM'],
  ['Dhuhr', '12:30 PM'],
  ['Asr', '3:45 PM'],
  ['Maghrib', '6:20 PM'],
  ['Isha', '7:45 PM'],
];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--emerald-dark)',
      color: 'rgba(255,255,255,0.7)',
      padding: '72px 0 32px',
      borderTop: '1px solid rgba(201,151,58,0.2)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '56px',
        }}>

          {/* Brand + Newsletter */}
          <div>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: 48, height: 48,
                background: 'linear-gradient(135deg, #c9973a, #e8b84b)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 2px 12px rgba(201,151,58,0.35)',
                flexShrink: 0,
              }}>☪</div>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#fff', fontSize: '1.2rem', lineHeight: 1 }}>
                  Al-Noor Masjid
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                  Donation Platform
                </div>
              </div>
            </Link>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '16px' }}>
              Serving the community with faith, compassion, and excellence since 1998.
            </p>

            <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', color: 'var(--gold-light)', direction: 'rtl', marginBottom: '24px', lineHeight: 1.6 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            {/* Newsletter */}
            <NewsletterSignup dark />
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 style={{
                color: '#fff',
                fontFamily: 'Playfair Display, serif',
                marginBottom: '20px',
                fontSize: '1rem',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(201,151,58,0.2)',
              }}>{heading}</h4>
              {links.map(([href, label]) => (
                <div key={href} style={{ marginBottom: '11px' }}>
                  <Link
                    href={href}
                    style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s', display: 'block' }}
                    onMouseEnter={e => e.target.style.color = 'var(--gold-light)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.62)'}
                  >{label}</Link>
                </div>
              ))}
            </div>
          ))}

          {/* Prayer Times + Contact */}
          <div>
            <h4 style={{
              color: '#fff',
              fontFamily: 'Playfair Display, serif',
              marginBottom: '20px',
              fontSize: '1rem',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(201,151,58,0.2)',
            }}>Prayer Times</h4>

            {PRAYER_TIMES.map(([name, time]) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '9px', fontSize: '0.88rem',
                padding: '4px 0',
              }}>
                <span>{name}</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{time}</span>
              </div>
            ))}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                ['📍', '123 Islamic Center Dr'],
                ['📞', '+1 (555) 123-4567'],
                ['✉️', 'info@alnoormasjid.org'],
                ['🕐', 'Open Daily · Fajr–Isha'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.45)',
        }}>
          <span>© {new Date().getFullYear()} Al-Noor Masjid. All rights reserved.</span>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/transparency" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold-light)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
            >Privacy</Link>
            <Link href="/transparency" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold-light)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
            >Transparency</Link>
            <span>Built with ❤️ for the Ummah</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
