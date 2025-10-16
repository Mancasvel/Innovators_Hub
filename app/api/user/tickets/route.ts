import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";

/**
 * User tickets API
 * GET /api/user/tickets - Get current user's tickets
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tickets = await Ticket.find({ userId: session.user.id })
      .populate("eventId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 },
    );
  }
}
