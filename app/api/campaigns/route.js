import { NextResponse } from 'next/server';
import { getCampaigns, getCampaign } from '@/lib/queries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const campaign = await getCampaign(id);
      if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(campaign);
    }

    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (err) {
    console.error('API Error /api/campaigns:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
