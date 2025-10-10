import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { validateTicketFormat, checkRateLimit } from '@/lib/verifyTicket';

/**
 * Validate and mark ticket as used
 * POST /api/tickets/validate
 * Body: { qrCode: string }
 * 
 * Only accessible by organizers and admins
 */

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and authorization
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'organizer' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only organizers can validate tickets' },
        { status: 403 }
      );
    }

    // Rate limiting
    const identifier = session.user.id;
    const { allowed, remaining } = checkRateLimit(identifier, 50, 60000); // 50 requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before scanning again.' },
        { status: 429 }
      );
    }

    const { qrCode } = await req.json();

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find ticket by QR code
    const ticket = await Ticket.findOne({ qrCode })
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate ticket format and signature
    if (!validateTicketFormat(ticket.qrCode, ticket.qrSignature)) {
      return NextResponse.json(
        { error: 'Invalid ticket signature', code: 'INVALID_SIGNATURE' },
        { status: 400 }
      );
    }

    // Check if already used
    if (ticket.status === 'used') {
      return NextResponse.json(
        {
          error: 'Ticket already used',
          code: 'ALREADY_USED',
          usedAt: ticket.usedAt,
          usedBy: ticket.usedBy,
        },
        { status: 409 }
      );
    }

    // Check if cancelled or refunded
    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json(
        { error: 'Ticket is not valid', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Mark ticket as used (atomic update with status check)
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: ticket._id, status: 'valid' },
      {
        status: 'used',
        usedAt: new Date(),
        usedBy: session.user.id,
      },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');

    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket validation failed. It may have been used concurrently.' },
        { status: 409 }
      );
    }

    // Log validation attempt
    console.log('✅ Ticket validated:', {
      ticketId: updatedTicket._id,
      userId: updatedTicket.userId,
      eventId: updatedTicket.eventId,
      validatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: updatedTicket._id,
        userName: (updatedTicket.userId as any).name,
        userEmail: (updatedTicket.userId as any).email,
        eventTitle: (updatedTicket.eventId as any).title,
        eventDate: (updatedTicket.eventId as any).date,
        usedAt: updatedTicket.usedAt,
      },
    });
  } catch (error) {
    console.error('Ticket validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }
}



