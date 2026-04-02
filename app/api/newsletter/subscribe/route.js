import { NextResponse } from 'next/server';
import { addNewsletter } from '@/lib/queries';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { id } = addNewsletter(email);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('API Error /api/newsletter/subscribe:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
