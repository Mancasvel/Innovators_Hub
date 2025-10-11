import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import {
  canModifyResource,
  isOrganizerOrAdmin,
  AuthErrors
} from '@/lib/permissions';
import mongoose from 'mongoose';

/**
 * GET /api/events/[id]/attendants - Get event attendants
 * Requires authentication: organizer (owner) or admin role
 *
 * Response: Array of attendants with ticket and user information
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        AuthErrors.UNAUTHORIZED,
        { status: 401 }
      );
    }

    // Check authorization (organizer or admin only)
    if (!isOrganizerOrAdmin(session)) {
      return NextResponse.json(
        AuthErrors.INVALID_ROLE,
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find existing event
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check ownership (organizers can only see their own events)
    if (!canModifyResource(session, event.createdBy.toString())) {
      return NextResponse.json(
        AuthErrors.NOT_OWNER,
        { status: 403 }
      );
    }

    // Get all tickets for this event with user information
    const attendants = await Ticket.find({ eventId: id })
      .populate('userId', 'name email') // Only get name and email from user
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    // Format the response data
    const formattedAttendants = attendants.map((ticket: any) => ({
      ticketId: ticket._id,
      userName: ticket.userId?.name || 'Unknown User',
      userEmail: ticket.userId?.email || 'No email',
      purchaseDate: ticket.createdAt,
      ticketStatus: ticket.status,
      purchasePrice: ticket.purchasePrice,
      purchasedWithMembership: ticket.purchasedWithMembership,
      usedAt: ticket.usedAt,
      assisted: ticket.assisted,
    }));

    console.log(`✅ Retrieved ${formattedAttendants.length} attendants for event ${id}`);

    return NextResponse.json({
      success: true,
      attendants: formattedAttendants,
      totalCount: formattedAttendants.length,
      eventTitle: event.title,
    });
  } catch (error) {
    console.error('❌ Error fetching event attendants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event attendants. Please try again.' },
      { status: 500 }
    );
  }
}
