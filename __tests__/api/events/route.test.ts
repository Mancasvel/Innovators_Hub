import { GET, POST } from "@/app/api/events/route";
import { NextRequest } from "next/server";
import Event from "@/models/Event";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { isOrganizerOrAdmin } from "@/lib/permissions";

jest.mock("@/lib/db");
jest.mock("@/models/Event");
jest.mock("next-auth");
jest.mock("@/lib/permissions");

describe("Events API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/events", () => {
    it("should return published events", async () => {
      const mockEvents = [
        {
          _id: "1",
          title: "Tech Meetup",
          description: "A tech meetup",
          date: new Date("2025-12-01"),
          location: "Seville",
          price: 10,
          status: "published",
          capacity: 50,
          ticketsSold: 10,
          images: [],
        },
      ];

      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEvents),
      };
      (Event.find as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest("http://localhost:3000/api/events");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toHaveLength(1);
      expect(data.events[0].title).toBe("Tech Meetup");
    });

    it("should filter events by category", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      (Event.find as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/events?category=networking",
      );
      await GET(request);

      expect(Event.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "networking",
        }),
      );
    });

    it("should filter events by search term", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      (Event.find as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/events?search=tech",
      );
      await GET(request);

      expect(Event.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: expect.any(Object) },
            { description: expect.any(Object) },
          ]),
        }),
      );
    });

    it("should filter upcoming events", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      (Event.find as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/events?upcoming=true",
      );
      await GET(request);

      expect(Event.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: { $gte: expect.any(Date) },
        }),
      );
    });

    it("should handle database errors", async () => {
      (connectDB as jest.Mock).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/events");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/events", () => {
    it("should create event when user is organizer", async () => {
      const mockSession = {
        user: { id: "123", role: "organizer" },
      };

      const mockEvent = {
        _id: "1",
        title: "New Event",
        description: "A new event",
        date: new Date("2025-12-01"),
        location: "Seville",
        price: 10,
        capacity: 50,
        createdBy: "123",
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (isOrganizerOrAdmin as jest.Mock).mockReturnValue(true);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Event.create as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "New Event",
          description: "A new event description",
          date: "2025-12-01T18:00:00Z",
          location: "Seville Tech Hub",
          price: 10,
          capacity: 50,
          category: "networking",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.event.title).toBe("New Event");
    });

    it("should reject event creation for non-organizers", async () => {
      const mockSession = {
        user: { id: "123", role: "user" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (isOrganizerOrAdmin as jest.Mock).mockReturnValue(false);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "New Event",
          description: "A new event",
          date: "2025-12-01T18:00:00Z",
          location: "Seville",
          price: 10,
          capacity: 50,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it("should reject unauthenticated event creation", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "New Event",
          description: "A new event",
          date: "2025-12-01T18:00:00Z",
          location: "Seville",
          price: 10,
          capacity: 50,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("should reject event with invalid data", async () => {
      const mockSession = {
        user: { id: "123", role: "organizer" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (isOrganizerOrAdmin as jest.Mock).mockReturnValue(true);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "AB", // Too short
          description: "Short",
          date: "2025-12-01T18:00:00Z",
          location: "Seville",
          price: -10, // Negative price
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should apply default capacity when not provided", async () => {
      const mockSession = {
        user: { id: "123", role: "organizer" },
      };

      const mockEvent = {
        _id: "1",
        title: "New Event",
        capacity: 50,
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (isOrganizerOrAdmin as jest.Mock).mockReturnValue(true);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Event.create as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "New Event",
          description: "A new event description",
          date: "2025-12-01T18:00:00Z",
          location: "Seville",
          price: 0,
        }),
      });

      await POST(request);

      expect(Event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          capacity: 50,
        }),
      );
    });
  });
});
