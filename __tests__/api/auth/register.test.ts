import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("bcryptjs");

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const mockUser = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
    };

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "SecureP@ss123",
        role: "user",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  it("should reject registration with existing email", async () => {
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (User.findOne as jest.Mock).mockResolvedValue({
      email: "john@example.com",
    });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "SecureP@ss123",
        role: "user",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email already registered");
  });

  it("should reject registration with invalid data", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        email: "invalid-email",
        password: "123",
        role: "user",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should handle organizer registration with pending status", async () => {
    const mockUser = {
      _id: "123",
      name: "Organizer User",
      email: "organizer@example.com",
      role: "user",
      requestedRole: "organizer",
    };

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Organizer User",
        email: "organizer@example.com",
        password: "SecureP@ss123",
        role: "organizer",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe("user");
  });

  it("should handle database errors gracefully", async () => {
    (connectDB as jest.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "SecureP@ss123",
        role: "user",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("should reject registration with missing required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        password: "SecureP@ss123",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should sanitize email to lowercase", async () => {
    const mockUser = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
    };

    (connectDB as jest.Mock).mockResolvedValue(undefined);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "JOHN@EXAMPLE.COM",
        password: "SecureP@ss123",
        role: "user",
      }),
    });

    await POST(request);

    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
  });
});
