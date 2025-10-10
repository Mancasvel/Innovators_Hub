import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

/**
 * Organizer statistics API
 * GET /api/organizer/stats - Get organizer's event stats
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'organizer' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Organizers only' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get organizer's events
    const events = await Event.find({ createdBy: session.user.id });
    const eventIds = events.map((e) => e._id);

    // Count tickets
    const totalTickets = await Ticket.countDocuments({
      eventId: { $in: eventIds },
    });

    const usedTickets = await Ticket.countDocuments({
      eventId: { $in: eventIds },
      status: 'used',
    });

    const validTickets = await Ticket.countDocuments({
      eventId: { $in: eventIds },
      status: 'valid',
    });

    // Calculate revenue
    const tickets = await Ticket.find({
      eventId: { $in: eventIds },
    }).select('purchasePrice');

    const totalRevenue = tickets.reduce((sum, t) => sum + t.purchasePrice, 0);

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        upcomingEvents: events.filter((e) => new Date(e.date) > new Date()).length,
        totalTickets,
        usedTickets,
        validTickets,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}



