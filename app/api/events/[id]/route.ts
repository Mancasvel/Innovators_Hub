import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import {
  updateEventSchema,
  formatZodErrors,
  sanitizeObject,
} from "@/lib/validation";
import {
  canModifyResource,
  isOrganizerOrAdmin,
  AuthErrors,
} from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * Single event API
 * GET /api/events/[id] - Get event details (public)
 * PATCH /api/events/[id] - Update event (organizer/admin only)
 * DELETE /api/events/[id] - Delete event (organizer/admin only)
 */

/**
 * GET /api/events/[id] - Get single event details
 * Public endpoint - no authentication required
 *
 * Response: Event object with populated createdBy
 * Errors: 404 Not Found, 500 Internal Server Error
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 },
      );
    }

    const event = await Event.findById(id)
      .populate("createdBy", "name email image")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/events/[id] - Update event
 * Requires authentication: organizer (owner) or admin role
 *
 * Request body: Partial<UpdateEventInput> (validated with Zod)
 * Authorization: Users can only update their own events, admins can update any
 * Response: 200 OK with updated event object
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 });
    }

    // Check authorization (organizer or admin only)
    if (!isOrganizerOrAdmin(session)) {
      return NextResponse.json(AuthErrors.INVALID_ROLE, { status: 403 });
    }

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find existing event
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check ownership (organizers can only edit their own events)
    if (!canModifyResource(session, event.createdBy.toString())) {
      return NextResponse.json(AuthErrors.NOT_OWNER, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = updateEventSchema.parse(body);
    } catch (error) {
      return NextResponse.json(formatZodErrors(error as any), { status: 422 });
    }

    // Sanitize input
    const sanitizedData = sanitizeObject(validatedData);

    // Apply free event logic: if price is 0, automatically set membershipFree to true
    if (sanitizedData.price === 0) {
      sanitizedData.membershipFree = true;
    }

    // Prevent updating protected fields
    const protectedFields = ["createdBy", "ticketsSold", "_id"];
    protectedFields.forEach((field) => delete (sanitizedData as any)[field]);

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: sanitizedData },
      {
        new: true,
        runValidators: true,
      },
    ).populate("createdBy", "name email");

    console.log("✅ Event updated:", updatedEvent?._id);

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating event:", error);

    // Handle validation errors from Mongoose
    if ((error as any).name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.values((error as any).errors).map((err: any) => ({
            field: err.path,
            message: err.message,
          })),
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update event. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/events/[id] - Delete event
 * Requires authentication: organizer (owner) or admin role
 *
 * Authorization: Users can only delete their own events, admins can delete any
 * Behavior: Soft delete (sets status to 'cancelled')
 * Optional: Can cascade delete related tickets with ?cascade=true
 * Response: 200 OK with success message
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 });
    }

    // Check authorization (organizer or admin only)
    if (!isOrganizerOrAdmin(session)) {
      return NextResponse.json(AuthErrors.INVALID_ROLE, { status: 403 });
    }

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find existing event
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check ownership (organizers can only delete their own events)
    if (!canModifyResource(session, event.createdBy.toString())) {
      return NextResponse.json(AuthErrors.NOT_OWNER, { status: 403 });
    }

    // Check if cascade delete is requested
    const { searchParams } = new URL(req.url);
    const cascade = searchParams.get("cascade") === "true";

    // Soft delete event (set status to cancelled)
    await Event.findByIdAndUpdate(id, {
      status: "cancelled",
      updatedAt: new Date(),
    });

    // Optional: cascade delete related tickets
    if (cascade) {
      const result = await Ticket.updateMany(
        { eventId: id, status: "valid" },
        {
          status: "cancelled",
          updatedAt: new Date(),
        },
      );
      console.log(`✅ Cancelled ${result.modifiedCount} related tickets`);
    }

    // Get ticket count for logging
    const ticketCount = await Ticket.countDocuments({ eventId: id });

    console.log("✅ Event cancelled:", id, `(${ticketCount} tickets)`);

    return NextResponse.json({
      success: true,
      message: "Event cancelled successfully",
      ticketsAffected: cascade ? ticketCount : 0,
    });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event. Please try again." },
      { status: 500 },
    );
  }
}
