import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import { generateSecureQRCode } from '@/lib/verifyTicket';
import { sendTicketEmail, sendMembershipEmail } from '@/lib/email';

/**
 * Stripe webhook handler
 * POST /api/stripe/webhook
 * Handles payment events from Stripe
 */

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata, customer_email, customer } = session;

  if (!metadata?.userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Handle ticket purchase
  if (metadata.type === 'ticket') {
    const eventId = metadata.eventId;

    if (!eventId) {
      console.error('No eventId in session metadata');
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }

    const user = await User.findById(metadata.userId);
    if (!user) {
      console.error('User not found:', metadata.userId);
      return;
    }

    // Check capacity before creating ticket
    if (event.capacity && event.ticketsSold >= event.capacity) {
      console.error('⚠️ Event sold out, cannot create ticket');
      // TODO: Refund the payment
      return;
    }

    // Generate secure QR code
    const { qrCode, signature } = generateSecureQRCode();

    // Increment tickets sold atomically
    const updatedEvent = await Event.findOneAndUpdate(
      { 
        _id: eventId,
        $expr: {
          $or: [
            { $eq: ['$capacity', null] },
            { $lt: ['$ticketsSold', '$capacity'] }
          ]
        }
      },
      { $inc: { ticketsSold: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      console.error('⚠️ Failed to increment ticketsSold - event may be sold out');
      // TODO: Refund the payment
      return;
    }

    // Create ticket
    const ticket = await Ticket.create({
      userId: user._id,
      eventId: event._id,
      qrCode,
      qrSignature: signature,
      status: 'valid',
      paymentId: session.payment_intent || session.id,
      purchasePrice: event.price,
      purchasedWithMembership: false,
    });

    // Send ticket email with updated event data (includes the new ticket count)
    await sendTicketEmail(user.email, user.name, updatedEvent, ticket);

    console.log('✅ Ticket created and email sent:', {
      ticketId: ticket._id,
      ticketsSold: updatedEvent.ticketsSold,
      capacity: updatedEvent.capacity,
    });
  }

  // Handle membership purchase
  if (metadata.type === 'membership' && customer) {
    const user = await User.findById(metadata.userId);
    if (!user) {
      console.error('User not found:', metadata.userId);
      return;
    }

    // Update user with Stripe customer ID
    user.stripeCustomerId = customer as string;
    user.hasMembership = true;
    user.membershipExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await user.save();

    // Send membership confirmation email
    await sendMembershipEmail(user.email, user.name, user.membershipExpires);

    console.log('✅ Membership activated for user:', user._id);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  user.hasMembership = isActive;
  if (isActive && subscription.current_period_end) {
    user.membershipExpires = new Date(subscription.current_period_end * 1000);
  }

  await user.save();
  console.log('✅ Subscription updated for user:', user._id);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  user.hasMembership = false;
  await user.save();

  console.log('✅ Subscription cancelled for user:', user._id);
}



