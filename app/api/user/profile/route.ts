import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

/**
 * Update user profile
 * PUT /api/user/profile
 * Body: { name: string, email: string }
 */

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, email } = await req.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email is already in use by another user
    if (email !== session.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este email ya está en uso por otra cuenta' },
          { status: 400 }
        );
      }
    }

    // Update user
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Profile updated:', {
      userId: user._id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        hasMembership: user.hasMembership,
        membershipExpires: user.membershipExpires,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}

