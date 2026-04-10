'use client';
// components/Navbar.js
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Pages with dark hero backgrounds where white text works
  const isDarkHero = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Determine colors based on scroll + page background
  const showDarkBg = scrolled || !isDarkHero;
  const navBg = scrolled
    ? 'rgba(27,107,74,0.95)'
    : isDarkHero
      ? 'transparent'
      : 'rgba(255,255,255,0.95)';
  const linkColor = scrolled || isDarkHero
    ? 'rgba(255,255,255,0.85)'
    : 'var(--charcoal)';
  const linkHover = scrolled || isDarkHero
    ? '#edc05a'
    : 'var(--emerald)';
  const logoColor = scrolled || isDarkHero ? '#fff' : 'var(--charcoal)';
  const logoSub = scrolled || isDarkHero ? 'rgba(255,255,255,0.6)' : 'var(--muted)';
  const hamburgerColor = scrolled || isDarkHero ? '#fff' : 'var(--charcoal)';

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '16px 0',
      background: navBg,
      backdropFilter: scrolled || !isDarkHero ? 'blur(12px)' : 'none',
      transition: 'all 0.4s ease',
      borderBottom: scrolled ? '1px solid rgba(212,162,62,0.2)' : !isDarkHero ? '1px solid rgba(34,129,90,0.1)' : 'none',
      boxShadow: !isDarkHero && !scrolled ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #d4a23e, #edc05a)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>☪</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: logoColor, fontSize: '1.1rem', lineHeight: 1, transition: 'color 0.3s' }}>Al-Noor</div>
            <div style={{ color: logoSub, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'color 0.3s' }}>Masjid</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {[['/', 'Home'], ['/campaigns', 'Campaigns'], ['/donate', 'Donate'], ['/admin', 'Admin']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: linkColor,
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = linkHover}
              onMouseLeave={e => e.target.style.color = linkColor}
            >{label}</Link>
          ))}
          <Link href="/donate" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
            ❤️ Donate Now
          </Link>
          <DarkModeToggle />
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: hamburgerColor, fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
          className="hamburger"
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(27,107,74,0.97)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {[['/', 'Home'], ['/campaigns', 'Campaigns'], ['/donate', 'Donate'], ['/admin', 'Admin']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>{label}</Link>
          ))}
          <Link href="/donate" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', marginTop: '8px' }}>
            ❤️ Donate Now
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

