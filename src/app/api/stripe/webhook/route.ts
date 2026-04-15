import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import type Stripe from 'stripe';

// Stripe Webhook エンドポイント
// checkout.session.completed イベントでサロンを active 化

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const salonId = session.metadata?.salonId;
    if (salonId) {
      await prisma.salon.update({
        where: { id: salonId },
        data: {
          status: 'active',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        },
      });
      console.log('[Stripe] Salon activated:', salonId);
    }
  }

  return NextResponse.json({ received: true });
}
