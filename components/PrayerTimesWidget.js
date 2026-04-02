'use client';
// components/PrayerTimesWidget.js
import { useState, useEffect } from 'react';

const FALLBACK = [
  { name: 'Fajr',    arabic: 'الفجر',   time: '4:30 AM', next: false },
  { name: 'Dhuhr',   arabic: 'الظهر',   time: '12:05 PM', next: false },
  { name: 'Asr',     arabic: 'العصر',   time: '3:30 PM',  next: false },
  { name: 'Maghrib', arabic: 'المغرب',  time: '6:05 PM',  next: false },
  { name: 'Isha',    arabic: 'العشاء',  time: '7:20 PM',  next: false },
];

function markNextPrayer(times) {
  const now = new Date();
  const toMinutes = str => {
    const [time, ampm] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let nextSet = false;
  return times.map(t => {
    const isNext = !nextSet && toMinutes(t.time) > nowMins;
    if (isNext) nextSet = true;
    return { ...t, next: isNext };
  });
}

export default function PrayerTimesWidget({ compact = false, city = 'Chandpur', country = 'BD' }) {
  const [times, setTimes] = useState(markNextPrayer(FALLBACK));
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    // Fetch from our internal API
    const url = `/api/prayer-times?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.times) {
          const mapped = ['Fajr','Dhuhr','Asr','Maghrib','Isha']
            .filter(k => data.times[k])
            .map(name => ({
              name,
              arabic: { Fajr:'الفجر', Dhuhr:'الظهر', Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء' }[name],
              time: data.times[name].adhan,
              iqama: data.times[name].iqama,
            }));
          setTimes(markNextPrayer(mapped));
        }
      })
      .catch(() => setTimes(markNextPrayer(FALLBACK)))
      .finally(() => setLoading(false));

    // Re-mark next prayer every minute
    const interval = setInterval(() => setTimes(t => markNextPrayer(t)), 60000);
    return () => clearInterval(interval);
  }, [city, country]);

  if (compact) return (
    <div style={{ background: 'rgba(26,92,56,0.05)', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(26,92,56,0.12)' }}>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--emerald)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🕌 Prayer Times · {date}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {times.map(t => (
          <div key={t.name} style={{
            padding: '6px 12px', borderRadius: 8,
            background: t.next ? 'var(--emerald)' : 'var(--parchment)',
            color: t.next ? '#fff' : 'var(--charcoal)',
            fontSize: '0.78rem', fontWeight: t.next ? 700 : 500,
            border: t.next ? 'none' : '1px solid rgba(26,92,56,0.1)',
          }}>
            <span>{t.name}</span>
            <span style={{ marginLeft: 6, opacity: t.next ? 1 : 0.7 }}>{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
        padding: '18px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
            🕌 Prayer Times
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: 2 }}>{date}</div>
        </div>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.2rem', color: 'var(--gold-light)', direction: 'rtl' }}>
          الصَّلَاة
        </div>
      </div>

      {/* Times */}
      <div style={{ padding: '4px 0' }}>
        {times.map((t, i) => (
          <div key={t.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 22px',
            background: t.next ? 'rgba(26,92,56,0.06)' : 'transparent',
            borderLeft: t.next ? '3px solid var(--emerald)' : '3px solid transparent',
            borderBottom: i < times.length - 1 ? '1px solid rgba(26,92,56,0.06)' : 'none',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <span style={{ fontWeight: t.next ? 700 : 500, color: t.next ? 'var(--emerald)' : 'var(--charcoal)', fontSize: '0.92rem' }}>
                  {t.name}
                </span>
                {t.next && (
                  <span style={{ marginLeft: 8, background: 'var(--emerald)', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: '0.62rem', fontWeight: 800, verticalAlign: 'middle' }}>
                    NEXT
                  </span>
                )}
              </div>
              <span style={{ fontFamily: 'Amiri, serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                {t.arabic}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: t.next ? 'var(--emerald)' : 'var(--charcoal)', fontSize: '0.92rem' }}>
                {t.time}
              </div>
              {t.iqama && (
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>Iqama {t.iqama}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '8px 22px 14px', color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center' }}>
          ⟳ Updating times…
        </div>
      )}
    </div>
  );
}
