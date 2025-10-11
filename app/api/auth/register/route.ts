import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, sanitizeInput } from '@/lib/verifyTicket';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * User registration endpoint with role support
 * POST /api/auth/register
 * Supports: user, organizer (requires approval), member (redirects to payment)
 */

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'organizer', 'admin']).optional().default('user'),
  requestedRole: z.enum(['user', 'organizer']).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Sanitize inputs
    const name = sanitizeInput(validatedData.name);
    const email = validatedData.email.toLowerCase().trim();
    const password = validatedData.password;
    const role = validatedData.role || 'user';
    const requestedRole = validatedData.requestedRole;

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine final role
    // Organizer requests must be approved by admin
    // Users can't self-assign admin role
    let finalRole: 'user' | 'organizer' | 'admin' = 'user';
    
    if (role === 'admin') {
      // Prevent self-registration as admin
      finalRole = 'user';
    } else if (role === 'organizer' || requestedRole === 'organizer') {
      // Organizer requires admin approval, store as user for now
      finalRole = 'user';
      // TODO: Create a pending approval system or notification to admins
      console.log(`⚠️ Organizer request from: ${email} - Requires admin approval`);
    } else {
      finalRole = role;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    // Send welcome email (non-blocking)
    const emailType = requestedRole === 'organizer' ? 'organizer-pending' : 'standard';
    sendWelcomeEmail(email, name, emailType).catch((err) =>
      console.error('Failed to send welcome email:', err)
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: requestedRole === 'organizer' 
          ? 'Account created. Organizer access requires admin approval.' 
          : 'Account created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}



