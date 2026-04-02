// app/api/newsletter/unsubscribe/route.js
import { NextResponse } from 'next/server';
import { unsubscribeNewsletterByEmail } from '@/lib/queries';

/**
 * GET /api/newsletter/unsubscribe?email=user@example.com
 * One-click unsubscribe link (included in newsletter emails)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(unsubscribePage('Invalid email address.', false), {
      headers: { 'Content-Type': 'text/html' },
      status: 400,
    });
  }

  try {
    const unsubscribed = unsubscribeNewsletterByEmail(email);

    if (!unsubscribed) {
      return new Response(unsubscribePage('Email not found or already unsubscribed.', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response(unsubscribePage(`${email} has been unsubscribed successfully.`, true), {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(unsubscribePage('Something went wrong. Please try again.', false), {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
  }
}

function unsubscribePage(message, success) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe | Al-Noor Masjid</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #faf7f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: white; border-radius: 20px; padding: 56px 48px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(26,92,56,0.1); }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #1a5c38; margin-bottom: 12px; }
    p { color: #6b7280; line-height: 1.7; margin-bottom: 24px; }
    .icon { font-size: 4rem; margin-bottom: 20px; }
    a { display: inline-block; padding: 12px 28px; background: #1a5c38; color: white; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    a:hover { background: #256b44; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✅' : '⚠️'}</div>
    <h1>${success ? 'Unsubscribed' : 'Oops'}</h1>
    <p>${message}</p>
    <a href="/">← Return to Al-Noor Masjid</a>
  </div>
</body>
</html>`;
}
