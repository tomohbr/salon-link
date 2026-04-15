import Stripe from 'stripe';

// Stripe client - テストキー対応
// 環境変数: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
// 未設定時は "demo mode" となり、決済画面をスキップして自動で成功扱いにする

const key = process.env.STRIPE_SECRET_KEY || '';

export const stripe = key ? new Stripe(key) : null;

export const isDemoMode = !stripe;

// プラン価格定義
export const PLANS = {
  light: {
    name: 'Light',
    price: 3980,
    features: ['顧客 300名', '予約無制限', 'LINE連携', 'クーポン配信', '基本分析'],
  },
  standard: {
    name: 'Standard',
    price: 7980,
    features: ['顧客無制限', 'AI離反予測', 'デザインギャラリー', '複数スタッフ管理'],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export async function createCheckoutSession(params: {
  plan: PlanId;
  salonId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) return null;
  const plan = PLANS[params.plan];
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `SalonLink ${plan.name}プラン`,
            description: plan.features.join(' / '),
          },
          unit_amount: plan.price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: {
      salonId: params.salonId,
      plan: params.plan,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
  return session;
}
