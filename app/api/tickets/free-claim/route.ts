import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { generateSecureQRCode } from '@/lib/verifyTicket';
import { sendTicketEmail } from '@/lib/email';

/**
 * Claim a free ticket (for members)
 * GET /api/tickets/free-claim?eventId=xxx
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a member
    if (!user.hasMembership) {
      return NextResponse.json(
        { error: 'Active membership required' },
        { status: 403 }
      );
    }

    // Check if event is free for members
    if (!event.membershipFree) {
      return NextResponse.json(
        { error: 'This event is not free for members' },
        { status: 400 }
      );
    }

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({
      userId: user._id,
      eventId: event._id,
    });

    if (existingTicket) {
      return NextResponse.redirect(
        new URL('/user/tickets?error=already-claimed', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Generate secure QR code
    const { qrCode, signature } = generateSecureQRCode();

    // Create free ticket
    const ticket = await Ticket.create({
      userId: user._id,
      eventId: event._id,
      qrCode,
      qrSignature: signature,
      status: 'valid',
      paymentId: 'free-membership',
      purchasePrice: 0,
      purchasedWithMembership: true,
    });

    // Increment tickets sold
    await Event.findByIdAndUpdate(eventId, { $inc: { ticketsSold: 1 } });

    // Send ticket email
    await sendTicketEmail(user.email, user.name, event, ticket);

    return NextResponse.redirect(
      new URL('/user/tickets?success=true', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('Free claim error:', error);
    return NextResponse.redirect(
      new URL('/user/tickets?error=claim-failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}



