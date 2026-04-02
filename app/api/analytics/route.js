// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import { getDonations, getCampaigns } from '@/lib/queries';

export async function GET(request) {
  const authHeader = request.headers.get('x-admin-password');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

  if (authHeader !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const donations = await getDonations();
    const campaigns = await getCampaigns();

    // ── Totals ──────────────────────────────────────────────────────────────
    const totalRaised = donations.reduce((s, d) => s + (d.amount || 0), 0);
    const totalDonations = donations.length;
    const avgDonation = totalDonations > 0 ? totalRaised / totalDonations : 0;

    // ── By Category ─────────────────────────────────────────────────────────
    const byCategory = {};
    donations.forEach(d => {
      const cat = d.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = { amount: 0, count: 0 };
      byCategory[cat].amount += d.amount || 0;
      byCategory[cat].count += 1;
    });

    // ── By Payment Method ────────────────────────────────────────────────────
    const byPayment = {};
    donations.forEach(d => {
      const method = d.paymentMethod || 'unknown';
      byPayment[method] = (byPayment[method] || 0) + (d.amount || 0);
    });

    // ── By Donation Type ────────────────────────────────────────────────────
    const oneTime = donations.filter(d => d.donationType === 'one-time');
    const monthly = donations.filter(d => d.donationType === 'monthly');

    // ── Daily trend (last 30 days) ───────────────────────────────────────────
    const dailyTrend = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyTrend[d.toISOString().slice(0, 10)] = 0;
    }
    donations.forEach(d => {
      if (!d.createdAt?.seconds) return;
      const dateStr = new Date(d.createdAt.seconds * 1000).toISOString().slice(0, 10);
      if (dateStr in dailyTrend) dailyTrend[dateStr] += d.amount || 0;
    });

    // ── Monthly trend (last 12 months) ──────────────────────────────────────
    const monthlyTrend = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyTrend[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0;
    }
    donations.forEach(d => {
      if (!d.createdAt?.seconds) return;
      const dt = new Date(d.createdAt.seconds * 1000);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyTrend) monthlyTrend[key] += d.amount || 0;
    });

    // ── Top donors ──────────────────────────────────────────────────────────
    const donorMap = {};
    donations.forEach(d => {
      if (d.anonymous || !d.donorName || d.donorName === 'Anonymous') return;
      if (!donorMap[d.donorName]) donorMap[d.donorName] = 0;
      donorMap[d.donorName] += d.amount || 0;
    });
    const topDonors = Object.entries(donorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name, total }));

    // ── Campaign performance ─────────────────────────────────────────────────
    const campaignPerformance = campaigns
      .filter(c => c.goalAmount > 0)
      .map(c => ({
        id: c.id,
        title: c.title,
        goal: c.goalAmount,
        raised: c.raisedAmount || 0,
        donors: c.donorCount || 0,
        pct: Math.round(((c.raisedAmount || 0) / c.goalAmount) * 100),
        active: c.active,
        category: c.category,
      }))
      .sort((a, b) => b.raised - a.raised);

    return NextResponse.json({
      summary: { totalRaised, totalDonations, avgDonation, activeCampaigns: campaigns.filter(c => c.active).length },
      byCategory,
      byPayment,
      donationTypes: { oneTime: oneTime.length, monthly: monthly.length },
      dailyTrend: Object.entries(dailyTrend).map(([date, amount]) => ({ date, amount })),
      monthlyTrend: Object.entries(monthlyTrend).map(([month, amount]) => ({ month, amount })),
      topDonors,
      campaignPerformance,
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics.' }, { status: 500 });
  }
}
