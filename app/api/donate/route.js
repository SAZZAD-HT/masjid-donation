// app/api/donate/route.js
import { NextResponse } from 'next/server';
import { submitDonation } from '@/lib/queries';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, donorName, email, campaignId, category, donationType, paymentMethod, anonymous, message } = body;

    // Validate amount
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || numAmount > 1_000_000) {
      return NextResponse.json({ error: 'Invalid donation amount.' }, { status: 400 });
    }

    // Validate donor info (if not anonymous)
    if (!anonymous) {
      if (!donorName?.trim()) return NextResponse.json({ error: 'Name required.' }, { status: 400 });
      if (email && !/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }

    const validCategories = ['masjid', 'education', 'food', 'relief', 'water', 'medical', 'youth', 'zakat', 'general'];
    const validTypes = ['one-time', 'monthly'];
    const validMethods = ['card', 'bank', 'cash'];

    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    // Record donation
    const { id } = await submitDonation({
      donorName: anonymous ? 'Anonymous' : donorName?.trim() || 'Anonymous',
      email: anonymous ? '' : email?.trim().toLowerCase() || '',
      amount: numAmount,
      campaignId: campaignId || '',
      category: category || 'general',
      donationType: validTypes.includes(donationType) ? donationType : 'one-time',
      paymentMethod: validMethods.includes(paymentMethod) ? paymentMethod : 'card',
      message: message?.trim().slice(0, 500) || '',
      anonymous: Boolean(anonymous),
    });

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Donation API error:', error);
    return NextResponse.json({ error: 'Donation failed. Please try again.' }, { status: 500 });
  }
}
