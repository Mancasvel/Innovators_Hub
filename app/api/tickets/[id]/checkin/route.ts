import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import {
  canModifyResource,
  isOrganizerOrAdmin,
  AuthErrors,
} from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * POST /api/tickets/[id]/checkin - Mark ticket as checked in (assisted)
 * Requires authentication: organizer (owner) or admin role
 *
 * Request body: none
 * Response: Success message with updated ticket info
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request
 */
export async function POST(
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
        { error: "Invalid ticket ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find the ticket first to get event info
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if ticket is valid and not already used
    if (ticket.status !== "valid") {
      return NextResponse.json(
        { error: "Ticket is not valid for check-in" },
        { status: 400 },
      );
    }

    // Get event to check ownership
    const event = await Event.findById(ticket.eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check ownership (organizers can only check-in their own events)
    if (!canModifyResource(session, event.createdBy.toString())) {
      return NextResponse.json(AuthErrors.NOT_OWNER, { status: 403 });
    }

    // Update ticket as assisted (checked in)
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        assisted: true,
        updatedAt: new Date(),
      },
      { new: true },
    );

    console.log(`✅ Ticket ${id} checked in by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Attendee checked in successfully",
      ticket: {
        id: updatedTicket?._id,
        assisted: updatedTicket?.assisted,
        updatedAt: updatedTicket?.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error during ticket check-in:", error);
    return NextResponse.json(
      { error: "Failed to check in attendee. Please try again." },
      { status: 500 },
    );
  }
}
