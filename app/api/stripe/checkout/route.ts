import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  stripe,
  createCheckoutSession,
  createMembershipSession,
} from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";

/**
 * Create Stripe checkout session
 * POST /api/stripe/checkout
 * Body: { eventId?: string, type: 'ticket' | 'membership' }
 */

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, type } = await req.json();

    await connectDB();

    if (type === "membership") {
      // Create membership checkout session
      const user = await User.findOne({ email: session.user.email });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.hasMembership) {
        return NextResponse.json(
          { error: "You already have an active membership" },
          { status: 400 },
        );
      }

      const checkout = await createMembershipSession({
        userId: user._id.toString(),
        userEmail: user.email,
        stripeCustomerId: user.stripeCustomerId,
      });

      return NextResponse.json(checkout);
    }

    if (type === "ticket") {
      // Create ticket checkout session
      if (!eventId) {
        return NextResponse.json(
          { error: "Event ID is required" },
          { status: 400 },
        );
      }

      const event = await Event.findById(eventId);

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      if (new Date(event.date) < new Date()) {
        return NextResponse.json(
          { error: "This event has already passed" },
          { status: 400 },
        );
      }

      if (event.capacity && event.ticketsSold >= event.capacity) {
        return NextResponse.json(
          { error: "Event is sold out" },
          { status: 400 },
        );
      }

      const user = await User.findOne({ email: session.user.email });
      const isMember = user?.hasMembership || false;

      // If free for members and user is a member, redirect to free claim
      if (event.membershipFree && isMember) {
        return NextResponse.json({
          url: `/api/tickets/free-claim?eventId=${eventId}`,
          sessionId: null,
          free: true,
        });
      }

      const checkout = await createCheckoutSession({
        eventId: event._id.toString(),
        eventTitle: event.title,
        price: event.price,
        userId: user?._id.toString() || session.user.id,
        userEmail: session.user.email,
        isMember,
      });

      return NextResponse.json(checkout);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
