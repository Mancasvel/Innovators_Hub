import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * Security utilities for ticket QR code generation and verification
 * Uses HMAC signatures to prevent ticket forgery
 */

const SECRET_KEY = process.env.SECRET_TICKET_KEY;

if (!SECRET_KEY) {
  console.warn(
    "⚠️ SECRET_TICKET_KEY is not defined. Ticket security features will be disabled.",
  );
} else if (SECRET_KEY.length < 32) {
  console.warn(
    "⚠️ SECRET_TICKET_KEY should be at least 32 characters long for security.",
  );
}

/**
 * Generate a unique QR code with HMAC signature
 * @returns {qrCode: string, signature: string}
 */
export function generateSecureQRCode(): { qrCode: string; signature: string } {
  const qrCode = uuidv4();
  const signature = generateHMAC(qrCode);

  return { qrCode, signature };
}

/**
 * Generate HMAC signature for a QR code
 */
export function generateHMAC(qrCode: string): string {
  if (!SECRET_KEY) {
    // Fallback to simple hash if SECRET_KEY is not available
    return crypto.createHash("sha256").update(qrCode).digest("hex");
  }

  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(qrCode);
  return hmac.digest("hex");
}

/**
 * Verify HMAC signature of a QR code
 */
export function verifyHMAC(qrCode: string, signature: string): boolean {
  if (!SECRET_KEY) {
    // If no secret key, verification is disabled
    return true;
  }

  const expectedSignature = generateHMAC(qrCode);

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * Validate ticket structure and signature
 */
export function validateTicketFormat(
  qrCode: string,
  signature: string,
): boolean {
  // Check UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(qrCode)) {
    return false;
  }

  // Verify signature (disabled if no secret key)
  return verifyHMAC(qrCode, signature);
}

/**
 * Rate limiting store (in-memory for simplicity, use Redis in production)
 */
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple rate limiter for API endpoints
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;

  // Clean up old entries
  if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
    delete rateLimitStore[key];
  }

  // Initialize or get existing entry
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const entry = rateLimitStore[key];
  entry.count++;

  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return { allowed, remaining };
}

/**
 * Hash password using bcrypt
 */
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password with hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}
