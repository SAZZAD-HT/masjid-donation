// app/api/webhooks/payment/route.js
// Stub for Stripe or PayPal payment webhook integration
// To activate real payments, install Stripe: npm install stripe
// Then set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local

import { NextResponse } from 'next/server';
import { submitDonation } from '@/lib/queries';

/**
 * POST /api/webhooks/payment
 * Handles incoming payment confirmations from Stripe or PayPal.
 *
 * ── Stripe Setup ─────────────────────────────────────────────────────────────
 * 1. npm install stripe
 * 2. Add to .env.local:
 *    STRIPE_SECRET_KEY=sk_live_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 * 3. In Stripe Dashboard → Webhooks → Add endpoint → /api/webhooks/payment
 *    Listen for: checkout.session.completed, payment_intent.succeeded
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function POST(request) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  // ── STRIPE INTEGRATION (uncomment to activate) ──────────────────────────
  /*
  const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    // Record donation in SQLite
    const { id } = submitDonation({
      donorName:     metadata.donorName     || 'Anonymous',
      email:         session.customer_email || '',
      amount:        session.amount_total / 100, // Stripe uses cents
      campaignId:    metadata.campaignId    || '',
      category:      metadata.category      || 'general',
      donationType:  metadata.donationType  || 'one-time',
      paymentMethod: 'card',
      paymentProvider: 'stripe',
      stripeSessionId: session.id,
      anonymous:     metadata.anonymous === 'true',
    });

    console.log('✅ Stripe donation recorded:', id);
  }
  */

  // ── PAYPAL INTEGRATION (uncomment to activate) ──────────────────────────
  /*
  // PayPal sends JSON body with event_type
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const capture = event.resource;
    const metadata = capture.custom_id ? JSON.parse(capture.custom_id) : {};

    submitDonation({
      donorName:     metadata.donorName     || 'PayPal Donor',
      email:         metadata.email         || '',
      amount:        parseFloat(capture.amount.value),
      campaignId:    metadata.campaignId    || '',
      category:      metadata.category      || 'general',
      donationType:  'one-time',
      paymentMethod: 'card',
      paymentProvider: 'paypal',
      paypalCaptureId: capture.id,
      anonymous:     false,
    });
  }
  */

  // ── STUB RESPONSE (remove when activating above) ─────────────────────────
  console.log('[Webhook stub] Payment webhook received. Activate Stripe/PayPal integration in this file.');
  return NextResponse.json({ received: true, status: 'stub — no payment provider configured' });
}
