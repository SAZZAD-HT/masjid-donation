'use client';
// components/QuranVerse.js
// Displays a rotating Quranic verse or hadith about charity
import { useState, useEffect } from 'react';

const VERSES = [
  {
    arabic: 'مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً',
    translation: 'Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?',
    source: 'Surah Al-Baqarah 2:245',
    type: 'quran',
  },
  {
    arabic: 'وَمَا تُنفِقُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ',
    translation: 'Whatever good you spend — indeed, Allah knows it.',
    source: 'Surah Al-Baqarah 2:273',
    type: 'quran',
  },
  {
    arabic: 'لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ',
    translation: 'You will never attain righteousness until you spend from that which you love.',
    source: 'Surah Aal-Imran 3:92',
    type: 'quran',
  },
  {
    arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ',
    translation: 'Establish prayer and give Zakat. Whatever good you put forward for yourselves, you will find it with Allah.',
    source: 'Surah Al-Baqarah 2:110',
    type: 'quran',
  },
  {
    arabic: 'الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ',
    translation: 'Charity extinguishes sin as water extinguishes fire.',
    source: 'Prophet Muhammad ﷺ — Tirmidhi',
    type: 'hadith',
  },
  {
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    translation: 'Charity does not decrease wealth.',
    source: 'Prophet Muhammad ﷺ — Muslim',
    type: 'hadith',
  },
  {
    arabic: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    translation: 'The best of people are those who are most beneficial to people.',
    source: 'Prophet Muhammad ﷺ — Al-Mu\'jam al-Awsat',
    type: 'hadith',
  },
  {
    arabic: 'إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ',
    translation: 'When a person dies, all their deeds end except three: a continuing charity, beneficial knowledge, or a child who prays for them.',
    source: 'Prophet Muhammad ﷺ — Muslim 1631',
    type: 'hadith',
  },
];

export default function QuranVerse({ autoRotate = true, intervalMs = 8000, dark = false }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * VERSES.length));
  const [visible, setVisible] = useState(true);

  const verse = VERSES[index];

  const goTo = (next) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, 300);
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      goTo((index + 1) % VERSES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoRotate, index, intervalMs]);

  const textColor = dark ? '#fff' : 'var(--charcoal)';
  const mutedColor = dark ? 'rgba(255,255,255,0.55)' : 'var(--muted)';
  const borderColor = dark ? 'rgba(201,151,58,0.3)' : 'rgba(201,151,58,0.2)';
  const bg = dark ? 'rgba(255,255,255,0.05)' : 'var(--gold-pale)';

  return (
    <div style={{
      background: bg,
      borderRadius: 'var(--radius)',
      padding: '28px 32px',
      border: `1px solid ${borderColor}`,
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(6px)',
    }}>
      {/* Type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: verse.type === 'quran' ? (dark ? 'var(--gold-light)' : 'var(--gold)') : (dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)'),
          background: dark ? 'rgba(201,151,58,0.15)' : 'rgba(201,151,58,0.12)',
          padding: '3px 10px', borderRadius: 999,
        }}>
          {verse.type === 'quran' ? '📖 Quran' : '☀️ Hadith'}
        </span>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 5 }}>
          {VERSES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === index ? 18 : 7, height: 7, borderRadius: 999,
              background: i === index
                ? (dark ? 'var(--gold-light)' : 'var(--gold)')
                : (dark ? 'rgba(255,255,255,0.2)' : 'rgba(201,151,58,0.25)'),
              border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease',
            }} aria-label={`Verse ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Arabic text */}
      <div style={{
        fontFamily: 'Amiri, serif',
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
        direction: 'rtl',
        lineHeight: 1.8,
        color: dark ? 'var(--gold-light)' : 'var(--gold)',
        marginBottom: 16,
        textAlign: 'right',
      }}>
        {verse.arabic}
      </div>

      {/* Translation */}
      <p style={{
        color: textColor,
        lineHeight: 1.8,
        fontSize: '0.95rem',
        fontStyle: 'italic',
        marginBottom: 12,
      }}>
        "{verse.translation}"
      </p>

      {/* Source */}
      <p style={{ color: mutedColor, fontSize: '0.78rem', fontWeight: 600 }}>
        — {verse.source}
      </p>

      {/* Manual navigation */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => goTo((index - 1 + VERSES.length) % VERSES.length)} style={{
          padding: '6px 12px', borderRadius: 99, border: `1px solid ${borderColor}`,
          background: 'transparent', cursor: 'pointer', color: mutedColor, fontSize: '0.82rem',
          transition: 'all 0.2s',
        }}>← Prev</button>
        <button onClick={() => goTo((index + 1) % VERSES.length)} style={{
          padding: '6px 12px', borderRadius: 99, border: `1px solid ${borderColor}`,
          background: 'transparent', cursor: 'pointer', color: mutedColor, fontSize: '0.82rem',
          transition: 'all 0.2s',
        }}>Next →</button>
      </div>
    </div>
  );
}
