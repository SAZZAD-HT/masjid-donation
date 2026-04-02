// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { addContact } from '@/lib/queries';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Server-side validation
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!message?.trim() || message.length < 10) return NextResponse.json({ error: 'Message too short' }, { status: 400 });

    // Basic spam filter
    const spamKeywords = ['casino', 'bitcoin', 'crypto investment', 'click here', 'make money fast'];
    const lowerMsg = message.toLowerCase();
    if (spamKeywords.some(kw => lowerMsg.includes(kw))) {
      return NextResponse.json({ error: 'Message flagged as spam' }, { status: 400 });
    }

    const { id } = await addContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject || 'General Enquiry',
      message: message.trim(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}
