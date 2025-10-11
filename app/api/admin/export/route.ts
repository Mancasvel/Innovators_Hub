import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';

/**
 * Admin API for exporting data
 * GET /api/admin/export - Export tickets data as CSV
 */

export async function GET(req: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get('type') || 'tickets';
    const format = searchParams.get('format') || 'csv';

    switch (exportType) {
      case 'tickets':
        return await exportTickets(format);
      case 'users':
        return await exportUsers(format);
      case 'events':
        return await exportEvents(format);
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

async function exportTickets(format: string) {
  // Get all tickets with populated data
  const tickets = await Ticket.find({})
    .populate('userId', 'name email')
    .populate('eventId', 'title date location')
    .populate('usedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'json') {
    return NextResponse.json({
      data: tickets,
      count: tickets.length,
      exportedAt: new Date().toISOString(),
    });
  }

  // Generate CSV
  const headers = [
    'Ticket ID',
    'User Name',
    'User Email',
    'Event Title',
    'Event Date',
    'Event Location',
    'Purchase Price (€)',
    'Membership Free',
    'Status',
    'QR Code',
    'Assisted',
    'Used At',
    'Validated By',
    'Created At',
    'Updated At',
  ];

  const csvRows = [
    headers.join(','),
    ...tickets.map(ticket => [
      ticket._id,
      `"${(ticket.userId as any)?.name || ''}"`,
      `"${(ticket.userId as any)?.email || ''}"`,
      `"${(ticket.eventId as any)?.title || ''}"`,
      `"${(ticket.eventId as any)?.date ? new Date((ticket.eventId as any).date).toLocaleDateString() : ''}"`,
      `"${(ticket.eventId as any)?.location || ''}"`,
      (ticket.purchasePrice / 100).toFixed(2),
      ticket.purchasedWithMembership ? 'Yes' : 'No',
      ticket.status,
      `"${ticket.qrCode}"`,
      ticket.assisted ? 'Yes' : 'No',
      ticket.usedAt ? new Date(ticket.usedAt).toLocaleString() : '',
      `"${(ticket.usedBy as any)?.name || ''}"`,
      new Date(ticket.createdAt).toLocaleString(),
      new Date(ticket.updatedAt).toLocaleString(),
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tickets-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

async function exportUsers(format: string) {
  const users = await User.find({})
    .select('name email role hasMembership membershipExpires createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'json') {
    return NextResponse.json({
      data: users,
      count: users.length,
      exportedAt: new Date().toISOString(),
    });
  }

  const headers = [
    'User ID',
    'Name',
    'Email',
    'Role',
    'Has Membership',
    'Membership Expires',
    'Created At',
    'Updated At',
  ];

  const csvRows = [
    headers.join(','),
    ...users.map(user => [
      user._id,
      `"${user.name}"`,
      `"${user.email}"`,
      user.role,
      user.hasMembership ? 'Yes' : 'No',
      user.membershipExpires ? new Date(user.membershipExpires).toLocaleDateString() : '',
      new Date(user.createdAt).toLocaleString(),
      new Date(user.updatedAt).toLocaleString(),
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

async function exportEvents(format: string) {
  const events = await Event.find({})
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  if (format === 'json') {
    return NextResponse.json({
      data: events,
      count: events.length,
      exportedAt: new Date().toISOString(),
    });
  }

  const headers = [
    'Event ID',
    'Title',
    'Description',
    'Date',
    'Location',
    'Price (€)',
    'Membership Free',
    'Capacity',
    'Tickets Sold',
    'Category',
    'Status',
    'Created By',
    'Created At',
    'Updated At',
  ];

  const csvRows = [
    headers.join(','),
    ...events.map(event => [
      event._id,
      `"${event.title}"`,
      `"${event.description.replace(/"/g, '""')}"`, // Escape quotes
      new Date(event.date).toLocaleDateString(),
      `"${event.location}"`,
      (event.price / 100).toFixed(2),
      event.membershipFree ? 'Yes' : 'No',
      event.capacity || 'Unlimited',
      event.ticketsSold,
      event.category,
      event.status,
      `"${(event.createdBy as any)?.name || ''}"`,
      new Date(event.createdAt).toLocaleString(),
      new Date(event.updatedAt).toLocaleString(),
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="events-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
