// scripts/seed.js
// Run with: node scripts/seed.js

const db = require('../lib/db');
const crypto = require('crypto');

function genId() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
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
    active: 1,
  },
  {
    title: 'Weekend Islamic School',
    description: `Our Islamic school serves over 150 children from our community every weekend, teaching Quran, Islamic studies, and Arabic. We are expanding to accommodate 100 more students and need your support.\n\nFunds will be used for:\n• Additional classroom space\n• Teaching materials and Qurans\n• Qualified teacher salaries\n• Digital learning equipment\n\nThe Prophet ﷺ said: "The best of you are those who learn the Quran and teach it." — Bukhari`,
    goalAmount: 30000,
    raisedAmount: 18750,
    donorCount: 94,
    category: 'education',
    endDate: '2025-07-01',
    active: 1,
  },
  {
    title: 'Ramadan Food Drive',
    description: `Every Ramadan, Al-Noor Masjid provides iftar meals for 500 fasting community members and distributes food packages to 200 needy families in our area.\n\nYour donation feeds a family for an entire month. The Prophet ﷺ said: "Whoever feeds a person breaking his fast will earn the same reward as him, without anything being lessened from the fasting person's reward." — Tirmidhi`,
    goalAmount: 15000,
    raisedAmount: 15000,
    donorCount: 312,
    category: 'food',
    endDate: '2025-03-31',
    active: 0,
  },
  {
    title: 'Clean Water for Yemen',
    description: `Clean water is a basic human right, yet millions in Yemen lack access to safe drinking water. This campaign funds the construction of water wells in rural Yemeni villages through our trusted partner NGO.\n\nThe Prophet ﷺ said: "The best charity is to give water." — Ahmad\n\nOne well provides clean water for a village of 300+ people for over 20 years. This is true sadaqah jariyah.`,
    goalAmount: 25000,
    raisedAmount: 11200,
    donorCount: 143,
    category: 'water',
    endDate: '2025-12-31',
    active: 1,
  },
  {
    title: 'Community Medical Fund',
    description: `Our community medical fund provides financial assistance to Muslim families facing unexpected medical emergencies. Many of our members are uninsured or underinsured and struggle with hospital bills.\n\nThis fund has already helped 37 families in the past year. Your contribution ensures no family has to choose between their health and financial survival.`,
    goalAmount: 50000,
    raisedAmount: 8900,
    donorCount: 56,
    category: 'medical',
    endDate: '2025-10-01',
    active: 1,
  },
  {
    title: 'Youth Sports & Activities Centre',
    description: `Our youth are the future of the Ummah. This campaign funds a dedicated youth centre with sports facilities, a library, and safe after-school activities to keep Muslim youth engaged and away from negative influences.\n\nAges 10–25 will benefit from organised football, basketball, swimming classes, mentorship programs, and career guidance workshops.`,
    goalAmount: 120000,
    raisedAmount: 34000,
    donorCount: 228,
    category: 'youth',
    endDate: '2026-06-30',
    active: 1,
  },
];

const donations = [
  { donorName: 'Abdullah Rahman', email: 'abdullah@example.com', amount: 500, category: 'masjid', donationType: 'one-time', paymentMethod: 'card', message: 'May Allah accept this. JazakAllahu Khayran.', anonymous: 0, status: 'completed' },
  { donorName: 'Fatima Al-Zahra', email: 'fatima@example.com', amount: 250, category: 'education', donationType: 'monthly', paymentMethod: 'bank', message: '', anonymous: 0, status: 'completed' },
  { donorName: 'Anonymous', email: '', amount: 1000, category: 'water', donationType: 'one-time', paymentMethod: 'card', message: 'For the sake of Allah.', anonymous: 1, status: 'completed' },
  { donorName: 'Omar Farouq', email: 'omar@example.com', amount: 100, category: 'food', donationType: 'one-time', paymentMethod: 'cash', message: 'Baraka Allahu feekum', anonymous: 0, status: 'completed' },
  { donorName: 'Aisha Siddiqui', email: 'aisha@example.com', amount: 75, category: 'medical', donationType: 'one-time', paymentMethod: 'card', message: '', anonymous: 0, status: 'completed' },
  { donorName: 'Muhammad Ali', email: 'mali@example.com', amount: 2500, category: 'masjid', donationType: 'one-time', paymentMethod: 'bank', message: 'In memory of my father, may Allah have mercy on him.', anonymous: 0, status: 'completed' },
  { donorName: 'Khadijah Hassan', email: 'khadijah@example.com', amount: 50, category: 'youth', donationType: 'monthly', paymentMethod: 'card', message: '', anonymous: 0, status: 'completed' },
  { donorName: 'Ibrahim Musa', email: 'ibrahim@example.com', amount: 300, category: 'general', donationType: 'one-time', paymentMethod: 'card', message: 'Ramadan Mubarak!', anonymous: 0, status: 'completed' },
];

async function seed() {
  console.log('🕌 Starting Al-Noor Masjid SQLite seed...\n');

  // Clear existing data (optional but good for seeding)
  db.exec('DELETE FROM campaigns; DELETE FROM donations;');

  const insertCamp = db.prepare(`
    INSERT INTO campaigns (id, title, description, goalAmount, raisedAmount, donorCount, category, endDate, active, createdAt)
    VALUES (@id, @title, @description, @goalAmount, @raisedAmount, @donorCount, @category, @endDate, @active, @createdAt)
  `);

  const insertDon = db.prepare(`
    INSERT INTO donations (id, donorName, email, amount, campaignId, category, donationType, paymentMethod, message, anonymous, status, createdAt)
    VALUES (@id, @donorName, @email, @amount, @campaignId, @category, @donationType, @paymentMethod, @message, @anonymous, @status, @createdAt)
  `);

  console.log('📋 Seeding campaigns...');
  const campaignIds = [];

  const transaction = db.transaction(() => {
    for (const c of campaigns) {
      const id = genId();
      insertCamp.run({ ...c, id, createdAt: now() });
      campaignIds.push(id);
      console.log(`  ✅ "${c.title}"`);
    }

    console.log('\n💰 Seeding donations...');
    for (const d of donations) {
      const randomCampaignId = campaignIds[Math.floor(Math.random() * campaignIds.length)];
      insertDon.run({
        ...d,
        id: genId(),
        campaignId: randomCampaignId,
        createdAt: now(),
      });
      console.log(`  ✅ ${d.donorName === 'Anonymous' || d.anonymous ? 'Anonymous' : d.donorName} — $${d.amount}`);
    }
  });

  transaction();

  console.log('\n🎉 Seed complete! SQLite database populated.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
