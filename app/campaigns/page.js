'use client';
// app/campaigns/page.js
import { useEffect, useState } from 'react';
import { srvGetCampaigns as getCampaigns } from '../../lib/actions';
import CampaignCard from '../../components/CampaignCard';

const CATEGORIES = ['all', 'masjid', 'education', 'food', 'relief', 'water', 'medical', 'youth', 'zakat', 'general'];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [showActive, setShowActive] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCampaigns().then(c => {
      setCampaigns(c);
      setFiltered(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = campaigns;
    if (category !== 'all') result = result.filter(c => c.category === category);
    if (showActive === 'active') result = result.filter(c => c.active);
    if (showActive === 'closed') result = result.filter(c => !c.active);
    if (search) result = result.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, showActive, search, campaigns]);

  return (
    <>
      {/* Header */}
      <section className="geo-pattern" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: '16px' }}>🌙 All Causes</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: '16px' }}>
            Our Campaigns
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto', fontSize: '1.05rem' }}>
            Browse all active and past campaigns. Every donation earns barakah.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid rgba(26,92,56,0.1)', padding: '24px 0', position: 'sticky', top: 72, zIndex: 50 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search campaigns…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ maxWidth: 260, flex: 1 }}
            />

            {/* Status */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[['all', 'All'], ['active', 'Active'], ['closed', 'Closed']].map(([v, l]) => (
                <button key={v} onClick={() => setShowActive(v)} style={{
                  padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: showActive === v ? 'var(--emerald)' : 'var(--parchment)',
                  color: showActive === v ? '#fff' : 'var(--charcoal)',
                  transition: 'all 0.2s',
                }}>{l}</button>
              ))}
            </div>

            {/* Category */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: '6px 14px', borderRadius: 999, border: '1.5px solid',
                  borderColor: category === cat ? 'var(--gold)' : 'rgba(26,92,56,0.2)',
                  background: category === cat ? 'var(--gold-pale)' : 'transparent',
                  color: category === cat ? 'var(--gold)' : 'var(--muted)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  textTransform: 'capitalize', transition: 'all 0.2s',
                }}>{cat}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section" style={{ minHeight: '60vh' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🕌</div>
              <p>Loading campaigns…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <p>No campaigns found for your filters.</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
                Showing {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
                {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
