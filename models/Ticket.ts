import mongoose, { Schema, Document, Model } from "mongoose";

export type TicketStatus = "valid" | "used" | "cancelled" | "refunded";

export interface ITicket extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId; // References User
  eventId: mongoose.Types.ObjectId; // References Event
  qrCode: string; // Unique UUID for the ticket (HMAC signed)
  qrSignature: string; // HMAC signature to prevent forgery
  assisted: boolean; // True if user attended (checked via QR scan)
  status: TicketStatus; // Enhanced status tracking
  paymentId?: string; // Stripe payment intent or session ID (optional for free tickets)
  purchasePrice: number; // Price at time of purchase (in cents, 0 for members)
  purchasedWithMembership: boolean; // True if obtained via membership
  usedAt?: Date; // When ticket was validated
  usedBy?: mongoose.Types.ObjectId; // Organizer who validated the ticket
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrSignature: {
      type: String,
      required: true,
    },
    assisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled", "refunded"],
      default: "valid",
      index: true,
    },
    paymentId: {
      type: String,
      required: false, // Optional for membership-based free tickets
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasedWithMembership: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
TicketSchema.index({ userId: 1, eventId: 1 });
TicketSchema.index({ qrCode: 1, status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
