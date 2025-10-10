import { z } from 'zod';

/**
 * Validation schemas and sanitization utilities
 * Centralized input validation for API routes
 */

/**
 * Event validation schema for POST /api/events
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  date: z
    .string()
    .datetime('Invalid date format')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Event date must be in the future',
    }),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .trim(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price cannot exceed €10,000'),
  membershipFree: z.boolean().default(false),
  capacity: z
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000')
    .optional(),
  category: z
    .enum(['networking', 'workshop', 'talk', 'social', 'other'])
    .optional()
    .default('other'),
  image: z.string().url('Invalid image URL').optional(),
});

/**
 * Event validation schema for PATCH /api/events/[id]
 * All fields are optional for partial updates
 */
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .datetime('Invalid date format')
    .refine(
      (date) => new Date(date) > new Date(),
      { message: 'Event date must be in the future' }
    )
    .optional(),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .trim()
    .optional(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price cannot exceed €10,000')
    .optional(),
  membershipFree: z.boolean().optional(),
  capacity: z
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000')
    .optional(),
  category: z
    .enum(['networking', 'workshop', 'talk', 'social', 'other'])
    .optional(),
  image: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
});

/**
 * Query parameters validation for GET /api/events
 */
export const eventQuerySchema = z.object({
  membershipFree: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  upcoming: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  category: z
    .enum(['networking', 'workshop', 'talk', 'social', 'other'])
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default('20'),
  sortBy: z.enum(['date', 'createdAt', 'title', 'price']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 5000); // Limit length
}

/**
 * Sanitize object by sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    }
  }
  
  return sanitized;
}

/**
 * Format Zod validation errors for API responses
 */
export function formatZodErrors(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;

