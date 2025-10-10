import Stripe from 'stripe';

/**
 * Stripe configuration for payment processing
 * Uses test mode keys in development, live keys in production
 */

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is not defined. Stripe functionality will be disabled.');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null;

/**
 * Create a Stripe checkout session for event ticket purchase
 */
export async function createCheckoutSession({
  eventId,
  eventTitle,
  price,
  userId,
  userEmail,
  isMember,
}: {
  eventId: string;
  eventTitle: string;
  price: number;
  userId: string;
  userEmail: string;
  isMember: boolean;
}) {
  const finalPrice = isMember ? 0 : price;

  // If free for members, create a zero-cost session
  if (finalPrice === 0) {
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/free-claim?eventId=${eventId}`,
      sessionId: null,
    };
  }

  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: eventTitle,
            description: 'Event ticket for Innovators Hub',
            images: [`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`],
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/tickets?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}?cancelled=true`,
    customer_email: userEmail,
    metadata: {
      eventId,
      userId,
      type: 'ticket',
    },
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe checkout session for annual membership subscription
 */
export async function createMembershipSession({
  userId,
  userEmail,
  stripeCustomerId,
}: {
  userId: string;
  userEmail: string;
  stripeCustomerId?: string;
}) {
  const priceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

  if (!priceId) {
    throw new Error('STRIPE_MEMBERSHIP_PRICE_ID is not configured');
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/membership?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/membership?cancelled=true`,
    metadata: {
      userId,
      type: 'membership',
    },
  };

  // Use existing customer or create new one
  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else {
    sessionParams.customer_email = userEmail;
  }

  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession(stripeCustomerId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/membership`,
  });

  return session.url;
}

export default stripe;



