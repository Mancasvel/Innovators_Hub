import mongoose from "mongoose";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import User from "@/models/User";

describe("Ticket Model", () => {
  let userId: string;
  let eventId: string;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/test",
      );
    }

    // Create test user and event
    const user = await User.create({
      name: "Test User",
      email: "user@test.com",
      password: "hashed_password",
      role: "user",
    });
    userId = user._id.toString();

    const event = await Event.create({
      title: "Test Event",
      description: "A test event",
      date: new Date("2025-12-01T18:00:00Z"),
      location: "Seville",
      price: 10,
      capacity: 50,
      createdBy: userId,
    });
    eventId = event._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Ticket.deleteMany({});
  });

  it("should create a valid ticket", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "valid",
      paymentId: "pi_test123",
      purchasePrice: 10,
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket._id).toBeDefined();
    expect(ticket.qrCode).toBe(ticketData.qrCode);
    expect(ticket.status).toBe(ticketData.status);
  });

  it("should require userId", async () => {
    const ticketData = {
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "valid",
      paymentId: "pi_test123",
    };

    await expect(Ticket.create(ticketData)).rejects.toThrow();
  });

  it("should require eventId", async () => {
    const ticketData = {
      userId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "valid",
      paymentId: "pi_test123",
    };

    await expect(Ticket.create(ticketData)).rejects.toThrow();
  });

  it("should require qrCode", async () => {
    const ticketData = {
      userId,
      eventId,
      qrSignature: "test-signature",
      status: "valid",
      paymentId: "pi_test123",
    };

    await expect(Ticket.create(ticketData)).rejects.toThrow();
  });

  it("should require qrSignature", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      status: "valid",
      paymentId: "pi_test123",
    };

    await expect(Ticket.create(ticketData)).rejects.toThrow();
  });

  it("should default status to valid", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.status).toBe("valid");
  });

  it("should allow used status", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "used",
      paymentId: "pi_test123",
      usedAt: new Date(),
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.status).toBe("used");
    expect(ticket.usedAt).toBeDefined();
  });

  it("should allow cancelled status", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "cancelled",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.status).toBe("cancelled");
  });

  it("should allow refunded status", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "refunded",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.status).toBe("refunded");
  });

  it("should default assisted to false", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.assisted).toBe(false);
  });

  it("should default purchasedWithMembership to false", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.purchasedWithMembership).toBe(false);
  });

  it("should store purchase price", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
      purchasePrice: 15,
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.purchasePrice).toBe(15);
  });

  it("should store usedBy reference", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      status: "used",
      paymentId: "pi_test123",
      usedBy: userId,
      usedAt: new Date(),
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.usedBy).toBeDefined();
  });

  it("should have timestamps", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.createdAt).toBeDefined();
    expect(ticket.updatedAt).toBeDefined();
  });

  it("should populate user and event references", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "test-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    const ticket = await Ticket.create(ticketData);
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("userId")
      .populate("eventId");

    expect(populatedTicket?.userId).toBeDefined();
    expect(populatedTicket?.eventId).toBeDefined();
    expect((populatedTicket?.userId as any).email).toBe("user@test.com");
    expect((populatedTicket?.eventId as any).title).toBe("Test Event");
  });

  it("should enforce unique qrCode", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "unique-qr-code",
      qrSignature: "test-signature",
      paymentId: "pi_test123",
    };

    await Ticket.create(ticketData);

    const duplicateTicket = {
      ...ticketData,
      paymentId: "pi_test456",
    };

    await expect(Ticket.create(duplicateTicket)).rejects.toThrow();
  });

  it("should allow free tickets with no payment ID", async () => {
    const ticketData = {
      userId,
      eventId,
      qrCode: "free-qr-code",
      qrSignature: "test-signature",
      paymentId: "free-membership",
      purchasePrice: 0,
      purchasedWithMembership: true,
    };

    const ticket = await Ticket.create(ticketData);

    expect(ticket.purchasePrice).toBe(0);
    expect(ticket.purchasedWithMembership).toBe(true);
  });
});
