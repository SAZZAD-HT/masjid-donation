'use client';
// components/CampaignCard.js
import Link from 'next/link';

const ICONS = {
  masjid: '🕌', education: '📚', food: '🍽️', relief: '🤲',
  water: '💧', medical: '🏥', youth: '⭐', zakat: '💰', general: '☪️',
};

export default function CampaignCard({ campaign }) {
  const {
    id, title, description, goalAmount, raisedAmount = 0,
    donorCount = 0, category = 'general', endDate, active,
  } = campaign;

  const pct = Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) || 0;
  const icon = ICONS[category] || '☪️';
  const daysLeft = endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - Date.now()) / 86400000))
    : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Band */}
      <div style={{
        background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
        padding: '28px 24px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: 100, height: 100,
          background: 'rgba(201,151,58,0.15)',
          borderRadius: '50%',
        }} />
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">{category}</span>
          {!active && <span className="badge badge-red">Closed</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
            <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>⚡ {daysLeft}d left</span>
          )}
        </div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1.25rem', lineHeight: 1.3 }}>{title}</h3>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {description?.slice(0, 120)}{description?.length > 120 ? '…' : ''}
        </p>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '1.1rem' }}>
              ৳{raisedAmount.toLocaleString()}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              of ৳{goalAmount?.toLocaleString()} goal
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{pct}% funded</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>👤 {donorCount} donors</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/donate?campaign=${id}`}
          className={active ? 'btn-primary' : 'btn-emerald'}
          style={{ textAlign: 'center', marginTop: 'auto' }}
        >
          {active ? '🤲 Donate Now' : '👁 View Campaign'}
        </Link>
      </div>
    </div>
  );
}
