import { NextResponse } from 'next/server';
import { getDonations, getDonationsByCampaign, getDonation } from '@/lib/queries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const campaignId = searchParams.get('campaignId');
    const limit = searchParams.get('limit');

    if (id) {
      const donation = await getDonation(id);
      if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(donation);
    }

    if (campaignId) {
      return NextResponse.json(await getDonationsByCampaign(campaignId));
    }

    const donations = await getDonations(limit ? Number(limit) : null);
    return NextResponse.json(donations);
  } catch (err) {
    console.error('API Error /api/donations:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
