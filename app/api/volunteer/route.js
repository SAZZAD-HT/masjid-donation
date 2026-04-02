import { NextResponse } from 'next/server';
import { addVolunteer } from '@/lib/queries';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, roles, availability, skills, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const { id } = await addVolunteer({ name, email, phone, roles, availability, skills, message });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('API Error /api/volunteer:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
