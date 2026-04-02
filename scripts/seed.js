// scripts/seed.js
// Run with: node scripts/seed.js
// Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env.local manually (since this runs outside Next.js)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function genId() {
  return crypto.randomUUID();
}

const campaigns = [
  {
    title: 'Masjid Renovation Fund',
    description: `Our beloved masjid is in need of significant renovation. The roof has aged over 20 years and requires urgent repair. The wudu area needs modernisation, and the main prayer hall carpets must be replaced.\n\nYour generous contribution will directly fund:\n• Complete roof waterproofing and repair\n• New wudu (ablution) facilities with proper drainage\n• Premium prayer hall carpeting\n• Improved lighting and air conditioning\n• Accessible facilities for elderly and disabled members\n\nThis is a sadaqah jariyah — every salah performed in this masjid after your contribution earns you ongoing reward, inshaAllah.`,
    goalAmount: 85000,
    raisedAmount: 42350,
    donorCount: 187,
    category: 'masjid',
    endDate: '2025-08-31',
    active: true,
  },
  {
    title: 'Weekend Islamic School',
    description: `Our Islamic school serves over 150 children from our community every weekend, teaching Quran, Islamic studies, and Arabic. We are expanding to accommodate 100 more students and need your support.\n\nFunds will be used for:\n• Additional classroom space\n• Teaching materials and Qurans\n• Qualified teacher salaries\n• Digital learning equipment\n\nThe Prophet ﷺ said: "The best of you are those who learn the Quran and teach it." — Bukhari`,
    goalAmount: 30000,
    raisedAmount: 18750,
    donorCount: 94,
    category: 'education',
    endDate: '2025-07-01',
    active: true,
  },
  {
    title: 'Ramadan Food Drive',
    description: `Every Ramadan, Al-Noor Masjid provides iftar meals for 500 fasting community members and distributes food packages to 200 needy families in our area.\n\nYour donation feeds a family for an entire month. The Prophet ﷺ said: "Whoever feeds a person breaking his fast will earn the same reward as him, without anything being lessened from the fasting person's reward." — Tirmidhi`,
    goalAmount: 15000,
    raisedAmount: 15000,
    donorCount: 312,
    category: 'food',
    endDate: '2025-03-31',
    active: false,
  },
  {
    title: 'Clean Water for Yemen',
    description: `Clean water is a basic human right, yet millions in Yemen lack access to safe drinking water. This campaign funds the construction of water wells in rural Yemeni villages through our trusted partner NGO.\n\nThe Prophet ﷺ said: "The best charity is to give water." — Ahmad\n\nOne well provides clean water for a village of 300+ people for over 20 years. This is true sadaqah jariyah.`,
    goalAmount: 25000,
    raisedAmount: 11200,
    donorCount: 143,
    category: 'water',
    endDate: '2025-12-31',
    active: true,
  },
  {
    title: 'Community Medical Fund',
    description: `Our community medical fund provides financial assistance to Muslim families facing unexpected medical emergencies. Many of our members are uninsured or underinsured and struggle with hospital bills.\n\nThis fund has already helped 37 families in the past year. Your contribution ensures no family has to choose between their health and financial survival.`,
    goalAmount: 50000,
    raisedAmount: 8900,
    donorCount: 56,
    category: 'medical',
    endDate: '2025-10-01',
    active: true,
  },
  {
    title: 'Youth Sports & Activities Centre',
    description: `Our youth are the future of the Ummah. This campaign funds a dedicated youth centre with sports facilities, a library, and safe after-school activities to keep Muslim youth engaged and away from negative influences.\n\nAges 10–25 will benefit from organised football, basketball, swimming classes, mentorship programs, and career guidance workshops.`,
    goalAmount: 120000,
    raisedAmount: 34000,
    donorCount: 228,
    category: 'youth',
    endDate: '2026-06-30',
    active: true,
  },
];

const donations = [
  { donorName: 'Abdullah Rahman', email: 'abdullah@example.com', amount: 500, category: 'masjid', donationType: 'one-time', paymentMethod: 'card', message: 'May Allah accept this. JazakAllahu Khayran.', anonymous: false, status: 'approved' },
  { donorName: 'Fatima Al-Zahra', email: 'fatima@example.com', amount: 250, category: 'education', donationType: 'monthly', paymentMethod: 'bank', message: '', anonymous: false, status: 'approved' },
  { donorName: 'Anonymous', email: '', amount: 1000, category: 'water', donationType: 'one-time', paymentMethod: 'card', message: 'For the sake of Allah.', anonymous: true, status: 'approved' },
  { donorName: 'Omar Farouq', email: 'omar@example.com', amount: 100, category: 'food', donationType: 'one-time', paymentMethod: 'cash', message: 'Baraka Allahu feekum', anonymous: false, status: 'approved' },
  { donorName: 'Aisha Siddiqui', email: 'aisha@example.com', amount: 75, category: 'medical', donationType: 'one-time', paymentMethod: 'card', message: '', anonymous: false, status: 'approved' },
  { donorName: 'Muhammad Ali', email: 'mali@example.com', amount: 2500, category: 'masjid', donationType: 'one-time', paymentMethod: 'bank', message: 'In memory of my father, may Allah have mercy on him.', anonymous: false, status: 'approved' },
  { donorName: 'Khadijah Hassan', email: 'khadijah@example.com', amount: 50, category: 'youth', donationType: 'monthly', paymentMethod: 'card', message: '', anonymous: false, status: 'approved' },
  { donorName: 'Ibrahim Musa', email: 'ibrahim@example.com', amount: 300, category: 'general', donationType: 'one-time', paymentMethod: 'card', message: 'Ramadan Mubarak!', anonymous: false, status: 'approved' },
];

async function seed() {
  console.log('🕌 Starting Al-Noor Masjid Supabase seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await supabase.from('donations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('📋 Seeding campaigns...');
  const campaignIds = [];

  for (const c of campaigns) {
    const id = genId();
    const { error } = await supabase.from('campaigns').insert({
      id,
      ...c,
    });
    if (error) {
      console.error(`  ❌ Failed: "${c.title}"`, error.message);
    } else {
      campaignIds.push(id);
      console.log(`  ✅ "${c.title}"`);
    }
  }

  console.log('\n💰 Seeding donations...');
  for (const d of donations) {
    const randomCampaignId = campaignIds[Math.floor(Math.random() * campaignIds.length)];
    const { error } = await supabase.from('donations').insert({
      id: genId(),
      ...d,
      campaignId: randomCampaignId,
    });
    if (error) {
      console.error(`  ❌ Failed: ${d.donorName}`, error.message);
    } else {
      console.log(`  ✅ ${d.anonymous ? 'Anonymous' : d.donorName} — ৳${d.amount}`);
    }
  }

  console.log('\n🎉 Seed complete! Supabase database populated.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
