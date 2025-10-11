import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import User from '@/models/User';
import {
  createEventSchema,
  eventQuerySchema,
  formatZodErrors,
  sanitizeObject
} from '@/lib/validation';
import { 
  isOrganizerOrAdmin, 
  getUserId, 
  AuthErrors 
} from '@/lib/permissions';

/**
 * GET /api/events - List events with filtering, pagination, and sorting
 * Public endpoint - no authentication required
 * 
 * Query parameters:
 * - membershipFree: boolean (filter events free for members)
 * - upcoming: boolean (filter future events only)
 * - status: draft | published | cancelled
 * - category: networking | workshop | talk | social | other
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: date | createdAt | title | price
 * - sortOrder: asc | desc
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      membershipFree: searchParams.get('membershipFree'),
      upcoming: searchParams.get('upcoming'),
      status: searchParams.get('status') || 'published',
      category: searchParams.get('category'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    };

    // Validate query parameters
    const validatedParams = eventQuerySchema.parse(queryParams);

    // Build query
    const query: any = {};

    // Status filter (default: published for public access)
    // Always apply status filter unless explicitly requesting other statuses
    query.status = validatedParams.status || 'published';

    // Upcoming events filter
    if (validatedParams.upcoming) {
      query.date = { $gte: new Date() };
    }

    // Membership free filter (only apply if explicitly set)
    if (validatedParams.membershipFree !== undefined) {
      query.membershipFree = validatedParams.membershipFree;
    }

    // Category filter (only apply if explicitly set)
    if (validatedParams.category !== undefined) {
      query.category = validatedParams.category;
    }

    // Date range filters
    if (validatedParams.dateFrom || validatedParams.dateTo) {
      if (!query.date) query.date = {};
      
      if (validatedParams.dateFrom) {
        query.date.$gte = new Date(validatedParams.dateFrom);
      }
      
      if (validatedParams.dateTo) {
        // Set to end of day for dateTo
        const endDate = new Date(validatedParams.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    // Pagination
    const page = validatedParams.page;
    const limit = validatedParams.limit;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = validatedParams.sortBy || 'date';
    const sortOrder = validatedParams.sortOrder === 'asc' ? 1 : -1;
    const sort: { [key: string]: 1 | -1 } = { [sortField]: sortOrder };

    // Debug: Log query
    console.log('🔍 Events API Query:', JSON.stringify(query));
    console.log('📊 Sort:', sort, 'Skip:', skip, 'Limit:', limit);
    console.log('🌐 MONGODB_URI from env:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');

    // Debug: Check collection name and total documents
    const collectionName = Event.collection.name;
    const allDocsCount = await Event.countDocuments({});
    const publishedCount = await Event.countDocuments({ status: 'published' });
    const upcomingCount = await Event.countDocuments({ date: { $gte: new Date() } });

    console.log('📂 Collection name:', collectionName);
    console.log('📚 Total documents in collection:', allDocsCount);
    console.log('✅ Published events:', publishedCount);
    console.log('⏰ Upcoming events:', upcomingCount);

    // Log sample documents
    const sampleEvents = await Event.find({}).limit(3).lean();
    console.log('📋 Sample events in DB:', sampleEvents.map(e => ({ id: e._id, title: e.title, status: e.status, date: e.date })));

    // Check users in the same database
    const userCount = await User.countDocuments({});
    const organizerUsers = await User.countDocuments({ role: { $in: ['organizer', 'admin'] } });
    console.log('👥 Total users in DB:', userCount);
    console.log('👑 Organizer/Admin users:', organizerUsers);

    // Execute query with pagination
    const [events, totalCount] = await Promise.all([
      Event.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      Event.countDocuments(query),
    ]);

    console.log('📦 Found events matching query:', totalCount, '| events returned:', events.length);
    if (events.length > 0) {
      console.log('📋 First event:', events[0].title, '| Status:', events[0].status);
    } else {
      console.log('⚠️ No events found with current query');
      console.log('🔍 Query details:', JSON.stringify(query, null, 2));
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      events,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        formatZodErrors(error as any),
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events - Create new event
 * Requires authentication: organizer or admin role
 * 
 * Request body: CreateEventInput (validated with Zod)
 * Response: 201 Created with event object
 * Errors: 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity
 */
export async function POST(req: Request) {
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

    // Parse and validate request body
    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = createEventSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        formatZodErrors(error as any),
        { status: 422 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeObject(validatedData);

    // Connect to database
    await connectDB();

    // Create event
    const event = await Event.create({
      ...sanitizedData,
      createdBy: getUserId(session),
      status: 'published',
      ticketsSold: 0,
    });

    // Populate createdBy for response
    await event.populate('createdBy', 'name email');

    console.log('✅ Event created:', event._id, 'by', getUserId(session));

    return NextResponse.json(
      { 
        success: true,
        event,
        message: 'Event created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating event:', error);

    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'An event with similar details already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create event. Please try again.' },
      { status: 500 }
    );
  }
}



