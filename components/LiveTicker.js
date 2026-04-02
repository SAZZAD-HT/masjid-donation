'use client';
// components/LiveTicker.js
// Real-time scrolling feed of recent donations (polls API interval)
import { useEffect, useState, useRef } from 'react';
import { formatCurrency } from '../lib/utils';

const CATEGORY_ICONS = {
  masjid: '🕌', education: '📚', food: '🍽️', relief: '🤲',
  water: '💧', medical: '🏥', youth: '⭐', zakat: '💰', general: '☪️',
};

export default function LiveTicker({ maxItems = 6 }) {
  const [donations, setDonations] = useState([]);
  const [newId, setNewId] = useState(null);
  const prevIds = useRef(new Set());

  useEffect(() => {
    let mounted = true;

    const fetchTicker = async () => {
      try {
        const res = await fetch(`/api/donations?limit=${maxItems}`);
        const data = await res.json();
        if (!mounted) return;

        // Detect brand-new donations
        data.forEach(d => {
          if (!prevIds.current.has(d.id) && prevIds.current.size > 0) {
            setNewId(d.id);
            setTimeout(() => { if (mounted) setNewId(null); }, 3000);
          }
        });

        prevIds.current = new Set(data.map(d => d.id));
        setDonations(data);
      } catch (e) {
        console.error('Ticker fetch error:', e);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 15000); // Poll every 15s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [maxItems]);

  if (donations.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(26,92,56,0.04)',
      border: '1px solid rgba(26,92,56,0.12)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', animation: 'livePulse 2s infinite' }} />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Live Donations
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {donations.map((d, i) => {
          const isNew = d.id === newId;
          const icon = CATEGORY_ICONS[d.category] || '☪️';
          const timeAgo = d.createdAt?.seconds
            ? getTimeAgo(new Date(d.createdAt.seconds * 1000))
            : 'recently';

          return (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10, gap: 12,
              background: isNew ? 'rgba(201,151,58,0.12)' : i === 0 ? 'rgba(26,92,56,0.05)' : 'transparent',
              border: isNew ? '1.5px solid rgba(201,151,58,0.35)' : '1px solid transparent',
              transition: 'all 0.4s ease',
              animation: isNew ? 'slideIn 0.4s ease' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, var(--emerald), var(--gold))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                }}>
                  {d.donorName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--charcoal)' }}>
                    {d.donorName || 'Anonymous'}
                    {isNew && <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800 }}>NEW</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {icon} {d.category} · {timeAgo}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--emerald)', fontSize: '1rem', flexShrink: 0 }}>
                {formatCurrency(d.amount || 0)}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
