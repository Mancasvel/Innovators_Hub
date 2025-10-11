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
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento requerido', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if event is free for everyone (price = 0) or free for members
    const isFreeEvent = event.price === 0;
    const isFreeForMember = event.membershipFree && user.hasMembership;

    if (!isFreeEvent && !isFreeForMember) {
      return NextResponse.json({
        error: isFreeForMember ? 'Este evento no es gratuito para miembros' : 'Se requiere membresía activa para reclamar esta entrada',
        code: isFreeForMember ? 'NOT_FREE' : 'NO_MEMBERSHIP'
      }, { status: 400 });
    }

    // Check if event has reached capacity
    if (event.capacity && event.ticketsSold >= event.capacity) {
      return NextResponse.json(
        { error: 'Este evento ha alcanzado su capacidad máxima', code: 'SOLD_OUT' },
        { status: 400 }
      );
    }

    // Check if user already has a ticket for this event (1 ticket per user per event)
    const existingTicket = await Ticket.findOne({
      userId: user._id,
      eventId: event._id,
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: 'Ya tienes una entrada para este evento', code: 'ALREADY_CLAIMED' },
        { status: 400 }
      );
    }

    // Generate secure QR code
    const { qrCode, signature } = generateSecureQRCode();

    // Create free ticket (atomic operation with capacity check)
    const updatedEvent = await Event.findOneAndUpdate(
      { 
        _id: eventId,
        $expr: {
          $or: [
            { $eq: ['$capacity', null] }, // No capacity limit
            { $lt: ['$ticketsSold', '$capacity'] } // Still has capacity
          ]
        }
      },
      { $inc: { ticketsSold: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      // Race condition: event sold out between checks
      return NextResponse.json(
        { error: 'El evento se agotó mientras procesábamos tu solicitud', code: 'SOLD_OUT' },
        { status: 400 }
      );
    }

    // Create the ticket
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

    console.log('✅ Free ticket claimed:', {
      userId: user._id,
      eventId: event._id,
      ticketId: ticket._id,
      ticketsSold: updatedEvent.ticketsSold,
      capacity: updatedEvent.capacity,
      userEmail: user.email,
    });

    // Send ticket email with updated event data (includes the new ticket count)
    try {
      console.log('📧 Attempting to send ticket email to:', user.email);
      await sendTicketEmail(user.email, user.name, updatedEvent, ticket);
      console.log('✅ Ticket email sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending ticket email:', emailError);
      // Don't block the user flow if email fails
    }

    return NextResponse.json({
      success: true,
      message: '¡Entrada reclamada con éxito! Revisa tu email para el código QR.',
      ticket: {
        id: ticket._id,
        qrCode: ticket.qrCode,
        eventTitle: updatedEvent.title,
      },
    });
  } catch (error) {
    console.error('Free claim error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud. Por favor, inténtalo de nuevo.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}



