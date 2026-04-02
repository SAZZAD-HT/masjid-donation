'use client';
// app/zakat/page.js — Zakat Calculator with Real-time Gold/Silver Prices
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ZAKAT_RATE = 0.025; // 2.5%

const ASSET_FIELDS = [
  { key: 'cash', label: 'নগদ ও ব্যাংক ব্যালেন্স', labelEn: 'Cash & Bank Balances', icon: '💵', hint: 'হাতে থাকা এবং ব্যাংকে জমা সমস্ত নগদ অর্থ' },
  { key: 'gold', label: 'স্বর্ণ (বাজার মূল্য)', labelEn: 'Gold (market value)', icon: '🥇', hint: 'সকল স্বর্ণালংকার ও স্বর্ণ মুদ্রার বর্তমান বাজারদর' },
  { key: 'silver', label: 'রূপা (বাজার মূল্য)', labelEn: 'Silver (market value)', icon: '🥈', hint: 'সকল রূপার জিনিসের বর্তমান বাজারদর' },
  { key: 'investments', label: 'শেয়ার ও বিনিয়োগ', labelEn: 'Stocks & Investments', icon: '📈', hint: 'শেয়ার, মিউচুয়াল ফান্ড, ক্রিপ্টো ইত্যাদির বাজার মূল্য' },
  { key: 'businessGoods', label: 'ব্যবসায়িক পণ্য', labelEn: 'Business Stock / Inventory', icon: '🏪', hint: 'বিক্রয়ের জন্য রাখা পণ্যের মূল্য' },
  { key: 'loanedOut', label: 'পাওনা অর্থ', labelEn: 'Money Owed to You', icon: '🤝', hint: 'আপনি যে ঋণ দিয়েছেন এবং ফেরত পাওয়ার আশা আছে' },
  { key: 'savings', label: 'সঞ্চয়পত্র ও FDR', labelEn: 'Savings Certificates & FDR', icon: '🏦', hint: 'সঞ্চয়পত্র, ফিক্সড ডিপোজিট ইত্যাদি' },
  { key: 'rental', label: 'ভাড়া থেকে সঞ্চিত আয়', labelEn: 'Rental Income (saved)', icon: '🏠', hint: 'ভাড়া থেকে জমানো অর্থ' },
  { key: 'agri', label: 'ফসল/কৃষি উৎপাদন', labelEn: 'Agricultural Produce', icon: '🌾', hint: 'ফসলের বাজারমূল্য (সেচযুক্ত ৫%, বৃষ্টিনির্ভর ১০%)' },
  { key: 'other', label: 'অন্যান্য সম্পদ', labelEn: 'Other Zakatable Assets', icon: '📦', hint: 'এক চন্দ্র বছরের বেশি ধরে রাখা অন্যান্য সম্পদ' },
];

const DEDUCTION_FIELDS = [
  { key: 'debts', label: 'তাৎক্ষণিক ঋণ', labelEn: 'Immediate Debts Due', icon: '💳', hint: 'ক্রেডিট কার্ড ব্যালেন্স, চলতি বছরের ঋণ কিস্তি' },
  { key: 'expenses', label: 'মৌলিক জীবনযাত্রা ব্যয়', labelEn: 'Basic Living Expenses', icon: '🏡', hint: 'এক মাসের প্রয়োজনীয় জীবনযাত্রার খরচ' },
  { key: 'businessDebts', label: 'ব্যবসায়িক দায়', labelEn: 'Business Liabilities', icon: '📉', hint: 'ব্যবসায়িক ঋণ ও তাৎক্ষণিক পরিশোধযোগ্য বিল' },
];

// 8 recipients of Zakat (Quran 9:60)
const ZAKAT_RECIPIENTS = [
  { arabic: 'الفقراء', bn: 'আল-ফুকারা', en: 'The Poor', desc: 'যাদের মৌলিক প্রয়োজন পূরণের সামর্থ্য নেই' },
  { arabic: 'المساكين', bn: 'আল-মাসাকীন', en: 'The Needy', desc: 'যাদের আয় প্রয়োজনের তুলনায় অপর্যাপ্ত' },
  { arabic: 'العاملين عليها', bn: 'আমিলীন', en: 'Zakat Administrators', desc: 'যারা যাকাত সংগ্রহ ও বিতরণ করেন' },
  { arabic: 'المؤلفة قلوبهم', bn: 'মুয়াল্লাফাতুল কুলুব', en: 'New Muslims', desc: 'নতুন মুসলিম যাদের হৃদয় জয় করতে হবে' },
  { arabic: 'في الرقاب', bn: 'ফী আর-রিকাব', en: 'Freeing Captives', desc: 'দাসত্ব থেকে মুক্ত করা' },
  { arabic: 'الغارمين', bn: 'আল-গারিমীন', en: 'Debtors', desc: 'ঋণগ্রস্ত ব্যক্তিদের সাহায্য' },
  { arabic: 'في سبيل الله', bn: 'ফী সাবিলিল্লাহ', en: 'In Allah\'s Cause', desc: 'আল্লাহর পথে — দাওয়াহ, শিক্ষা, জিহাদ' },
  { arabic: 'ابن السبيل', bn: 'ইবনুস সাবিল', en: 'The Traveller', desc: 'পথিক যে সফরে অসহায় হয়ে পড়েছে' },
];

export default function ZakatPage() {
  const [assets, setAssets] = useState({});
  const [deductions, setDeductions] = useState({});
  const [nisabBasis, setNisabBasis] = useState('gold');
  const [calculated, setCalculated] = useState(false);
  const [prices, setPrices] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Fetch live prices
  useEffect(() => {
    fetch('/api/zakat-prices')
      .then(r => r.json())
      .then(data => setPrices(data))
      .catch(() => setPrices(null))
      .finally(() => setLoadingPrices(false));
  }, []);

  const goldPrice = prices?.gold?.pricePerGram || 9800;
  const silverPrice = prices?.silver?.pricePerGram || 130;
  const goldNisab = prices?.gold?.nisabValue || (85 * goldPrice);
  const silverNisab = prices?.silver?.nisabValue || (595 * silverPrice);

  const totalAssets = Object.values(assets).reduce((s, v) => s + (Number(v) || 0), 0);
  const totalDeductions = Object.values(deductions).reduce((s, v) => s + (Number(v) || 0), 0);
  const netWealth = Math.max(0, totalAssets - totalDeductions);

  const nisabValue = nisabBasis === 'gold' ? goldNisab : silverNisab;
  const aboveNisab = netWealth >= nisabValue;
  const zakatDue = aboveNisab ? netWealth * ZAKAT_RATE : 0;

  const setAsset = (key, val) => setAssets(a => ({ ...a, [key]: val }));
  const setDeduction = (key, val) => setDeductions(d => ({ ...d, [key]: val }));

  const fmt = (n) => '৳' + Math.round(n).toLocaleString();
  const numFmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      {/* Hero */}
      <section className="geo-pattern" style={{ paddingTop: 110, paddingBottom: 72 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: 'var(--gold-light)', direction: 'rtl', marginBottom: 16 }}>
            وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: 24 }}>
            "Establish prayer and give Zakat." — Quran 2:43
          </p>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>🧮 যাকাত ক্যালকুলেটর</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>
            Calculate Your Zakat
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
            যাকাত ইসলামের পাঁচটি স্তম্ভের একটি — আপনার সঞ্চয়ের ২.৫% প্রতি বছর অভাবীদের মাঝে বিতরণ করুন।
            এই ক্যালকুলেটর দিয়ে আপনার যাকাত নির্ণয় করুন।
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>

            {/* ── Form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Live Prices Banner */}
              <div className="card" style={{ padding: '20px 28px', background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', marginBottom: 4 }}>
                      {loadingPrices ? '⟳ দর আপডেট হচ্ছে…' : `📡 ${prices?.source === 'fallback' ? 'আনুমানিক দর' : 'লাইভ দর'}`}
                    </div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                      🥇 স্বর্ণ: {fmt(goldPrice)}/গ্রাম &nbsp;·&nbsp; 🥈 রূপা: {fmt(silverPrice)}/গ্রাম
                    </div>
                  </div>
                  {prices?.exchangeRate && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                      💱 $1 = ৳{prices.exchangeRate.USD_BDT}
                    </div>
                  )}
                </div>
              </div>

              {/* Nisab Basis */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>নিসাব পদ্ধতি (Nisab Threshold)</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.7 }}>
                  নিসাব হলো সম্পদের ন্যূনতম পরিমাণ যার উপর যাকাত ফরজ হয়।
                  অধিকাংশ আলেম <strong>রূপার মান</strong> ব্যবহারের পরামর্শ দেন কারণ এতে বেশি অভাবী ব্যক্তি উপকৃত হয়।
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    ['gold', '🥇 স্বর্ণের মান', `${85}g (৭.৫ তোলা) ≈ ${fmt(goldNisab)}`],
                    ['silver', '🥈 রূপার মান', `${595}g (৫২.৫ তোলা) ≈ ${fmt(silverNisab)}`],
                  ].map(([val, label, sub]) => (
                    <button key={val} onClick={() => setNisabBasis(val)} style={{
                      flex: 1, padding: '14px 12px', border: '2px solid', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                      borderColor: nisabBasis === val ? 'var(--gold)' : 'rgba(26,92,56,0.15)',
                      background: nisabBasis === val ? 'var(--gold-pale)' : '#fff',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ fontWeight: 700, color: nisabBasis === val ? 'var(--gold)' : 'var(--charcoal)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>💰 যাকাতযোগ্য সম্পদ</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>টাকায় (৳) মান লিখুন। না থাকলে খালি রাখুন।</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {ASSET_FIELDS.map(({ key, label, labelEn, icon, hint }) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {icon} {label}
                          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: 6 }}>({labelEn})</span>
                        </label>
                        {assets[key] > 0 && <span style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(Number(assets[key]))}</span>}
                      </div>
                      <input
                        type="number" min="0" placeholder="0"
                        value={assets[key] || ''}
                        onChange={e => setAsset(key, e.target.value)}
                        className="input-field"
                      />
                      <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 4 }}>{hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>📉 বাদযোগ্য দায়</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>তাৎক্ষণিক ঋণ ও প্রয়োজনীয় খরচ বাদ দিন।</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {DEDUCTION_FIELDS.map(({ key, label, labelEn, icon, hint }) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {icon} {label}
                          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: 6 }}>({labelEn})</span>
                        </label>
                        {deductions[key] > 0 && <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>−{fmt(Number(deductions[key]))}</span>}
                      </div>
                      <input
                        type="number" min="0" placeholder="0"
                        value={deductions[key] || ''}
                        onChange={e => setDeduction(key, e.target.value)}
                        className="input-field"
                      />
                      <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 4 }}>{hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setCalculated(true)} className="btn-primary" style={{ justifyContent: 'center', fontSize: '1.1rem', padding: '18px' }}>
                🧮 যাকাত হিসাব করুন
              </button>
            </div>

            {/* ── Sticky Results ── */}
            <div style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Summary Card */}
              <div className="card" style={{ padding: '28px 24px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20, fontSize: '1.2rem' }}>হিসাবের সারাংশ</h3>

                {[
                  ['💰 মোট সম্পদ', totalAssets, 'var(--emerald)', false],
                  ['📉 মোট বাদযোগ্য', totalDeductions, '#dc2626', true],
                  ['💎 নিট যাকাতযোগ্য সম্পদ', netWealth, 'var(--charcoal)', false],
                  ['📊 নিসাব সীমা', nisabValue, 'var(--muted)', false],
                ].map(([label, val, color, minus]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(26,92,56,0.08)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{label}</span>
                    <span style={{ fontWeight: 700, color, fontSize: '0.95rem' }}>{minus ? '−' : ''}{fmt(val)}</span>
                  </div>
                ))}

                {/* Nisab status */}
                <div style={{
                  padding: '14px 16px', borderRadius: 12, marginBottom: 20, textAlign: 'center',
                  background: aboveNisab ? 'rgba(26,92,56,0.08)' : 'rgba(201,151,58,0.1)',
                  border: `1.5px solid ${aboveNisab ? 'rgba(26,92,56,0.2)' : 'rgba(201,151,58,0.3)'}`,
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{aboveNisab ? '✅' : 'ℹ️'}</div>
                  <div style={{ fontWeight: 700, color: aboveNisab ? 'var(--emerald)' : 'var(--gold)', fontSize: '0.9rem' }}>
                    {aboveNisab ? 'যাকাত ফরজ (Zakat is Obligatory)' : 'নিসাবের নিচে — যাকাত ফরজ নয়'}
                  </div>
                  {!aboveNisab && (
                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
                      আপনার সম্পদ নিসাব সীমার নিচে। তবে আপনি স্বেচ্ছায় সদাকাহ দিতে পারেন।
                    </div>
                  )}
                </div>

                {/* Zakat Due */}
                {calculated && (
                  <div style={{
                    background: aboveNisab
                      ? 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))'
                      : 'var(--parchment)',
                    borderRadius: 16, padding: '24px', textAlign: 'center',
                  }}>
                    {aboveNisab ? (
                      <>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: 6 }}>যাকাত প্রদেয় (২.৫%)</div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', color: 'var(--gold-light)', fontWeight: 700, lineHeight: 1 }}>
                          {fmt(zakatDue)}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginTop: 8 }}>
                          = {fmt(zakatDue / 12)}/মাস (১২ মাসে ভাগ করলে)
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🤲</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>এই বছর যাকাত ফরজ নয়। স্বেচ্ছায় সদাকাহ দিন।</div>
                      </>
                    )}
                  </div>
                )}

                {calculated && aboveNisab && (
                  <Link href={`/donate?category=zakat&amount=${Math.ceil(zakatDue)}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    🤲 যাকাত প্রদান করুন
                  </Link>
                )}
              </div>

              {/* Nisaab Education Card */}
              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12, fontSize: '1rem' }}>📖 নিসাব কী? (What is Nisaab?)</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 10 }}>
                    <strong>স্বর্ণের নিসাব:</strong> ৮৫ গ্রাম (৭.৫ তোলা) স্বর্ণ = {fmt(goldNisab)}
                  </p>
                  <p style={{ marginBottom: 10 }}>
                    <strong>রূপার নিসাব:</strong> ৫৯৫ গ্রাম (৫২.৫ তোলা) রূপা = {fmt(silverNisab)}
                  </p>
                  <p style={{ marginBottom: 10 }}>
                    <strong>হাওল (Hawl):</strong> সম্পদ নিসাবের উপরে পূর্ণ এক চন্দ্র বছর (৩৫৪ দিন) থাকতে হবে।
                  </p>
                  <p style={{ marginBottom: 10 }}>
                    <strong>যাকাতযোগ্য:</strong> নগদ, স্বর্ণ, রূপা, শেয়ার, ব্যবসায়িক পণ্য, পাওনা
                  </p>
                  <p>
                    <strong>যাকাতমুক্ত:</strong> নিজের বাসস্থান, গাড়ি, পরিধেয় বস্ত্র, দৈনন্দিন ব্যবহারের আসবাবপত্র
                  </p>
                </div>
              </div>

              {/* Agricultural Zakat Note */}
              <div style={{ background: 'rgba(201,151,58,0.08)', borderRadius: 'var(--radius)', padding: '18px 20px', border: '1.5px solid rgba(201,151,58,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold)', marginBottom: 8 }}>🌾 কৃষি যাকাত (উশর)</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                  ফসলের যাকাত: সেচযুক্ত জমিতে <strong>৫%</strong>, বৃষ্টিনির্ভর জমিতে <strong>১০%</strong>।
                  ফসল ৫ ওয়াসাক (প্রায় ৬৫৩ কেজি) হলে যাকাত ফরজ। বাংলাদেশের কৃষকদের জন্য এটি বিশেষভাবে প্রযোজ্য।
                </p>
              </div>

              {/* Info Card */}
              <div style={{ background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))', borderRadius: 'var(--radius)', padding: '24px', color: '#fff' }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', direction: 'rtl', color: 'var(--gold-light)', marginBottom: 12 }}>
                  خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.8, marginBottom: 16 }}>
                  <em>"Take from their wealth a charity." — Quran 9:103</em>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                  ⚠️ এই ক্যালকুলেটর শুধু একটি গাইড। আপনার বিশেষ পরিস্থিতির জন্য একজন যোগ্য ইসলামী স্কলারের পরামর্শ নিন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Recipients of Zakat */}
      <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="badge badge-gold" style={{ marginBottom: 12 }}>📖 সূরা আত-তাওবাহ ৯:৬০</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', marginBottom: 12 }}>
              যাকাতের ৮ খাত (8 Recipients of Zakat)
            </h2>
            <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
              কুরআনে আল্লাহ তায়ালা ৮ শ্রেণীর মানুষকে যাকাত গ্রহণের যোগ্য ঘোষণা করেছেন:
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {ZAKAT_RECIPIENTS.map((r, i) => (
              <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--emerald), var(--gold))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: 'Amiri, serif', color: 'var(--gold)', fontSize: '1rem', direction: 'rtl', marginBottom: 2 }}>{r.arabic}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--emerald)', marginBottom: 2 }}>{r.bn} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({r.en})</span></div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '64px 0 80px', background: 'var(--parchment)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', textAlign: 'center', marginBottom: 48, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
            যাকাত সম্পর্কে জিজ্ঞাসা (Zakat FAQs)
          </h2>
          {[
            { q: 'কার উপর যাকাত ফরজ?', a: 'প্রত্যেক প্রাপ্তবয়স্ক, সুস্থ মুসলিম যার সম্পদ নিসাব সীমার উপরে পূর্ণ এক চন্দ্র বছর (হাওল) ধরে আছে, তার উপর যাকাত ফরজ। এটি ইসলামের পাঁচটি স্তম্ভের একটি।' },
            { q: 'নিসাব কী?', a: 'নিসাব হলো সম্পদের ন্যূনতম পরিমাণ। এটি ৮৫ গ্রাম (৭.৫ তোলা) স্বর্ণ অথবা ৫৯৫ গ্রাম (৫২.৫ তোলা) রূপার সমান। সম্পদ এই পরিমাণের উপরে গেলে যাকাত ফরজ হয়।' },
            { q: 'যাকাত কখন দিতে হয়?', a: 'সম্পদ নিসাবের উপরে পূর্ণ এক চন্দ্র বছর (৩৫৪ দিন) অতিক্রম করলে যাকাত ফরজ হয়। অনেক মুসলিম রমজানে দেন অতিরিক্ত সওয়াবের জন্য।' },
            { q: 'কাদের যাকাত দেওয়া যায়?', a: 'কুরআনের সূরা তাওবাহ (৯:৬০) অনুযায়ী ৮ শ্রেণীর মানুষকে: ফকির, মিসকীন, আমিলীন (সংগ্রাহক), মুয়াল্লাফাতুল কুলুব (নতুন মুসলিম), দাসমুক্তি, ঋণগ্রস্ত, ফী সাবিলিল্লাহ, এবং মুসাফির।' },
            { q: 'যাকাত ও সদাকাহ কি একই?', a: 'না। যাকাত ফরজ (বাধ্যতামূলক) বার্ষিক প্রদান, আর সদাকাহ স্বেচ্ছামূলক দান যা যেকোনো সময়ে যেকোনো পরিমাণে যেকোনো ভালো কাজে দেওয়া যায়।' },
            { q: 'কৃষি ফসলের যাকাত কিভাবে হিসাব হয়?', a: 'ফসল ৫ ওয়াসাক (প্রায় ৬৫৩ কেজি) হলে যাকাত ফরজ। সেচযুক্ত জমিতে ফসলের ৫% এবং বৃষ্টিনির্ভর জমিতে ১০% যাকাত দিতে হবে। এটি বাংলাদেশের কৃষকদের জন্য বিশেষভাবে প্রাসঙ্গিক।' },
          ].map(({ q, a }, i) => (
            <details key={i} style={{ marginBottom: 12 }}>
              <summary style={{
                padding: '18px 24px', background: '#fff', borderRadius: 12, cursor: 'pointer',
                fontWeight: 700, fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between',
                border: '1.5px solid rgba(26,92,56,0.1)', userSelect: 'none',
              }}>
                {q} <span style={{ color: 'var(--emerald)' }}>+</span>
              </summary>
              <div style={{ padding: '16px 24px 20px', background: '#fff', borderRadius: '0 0 12px 12px', color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.8, marginTop: -2, border: '1.5px solid rgba(26,92,56,0.1)', borderTop: 'none' }}>
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
        details[open] summary span { transform: rotate(45deg); display: inline-block; }
      `}</style>
    </>
  );
}
