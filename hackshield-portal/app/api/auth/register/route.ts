import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, ...additionalData } = await req.json();

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      );
    }

    if (!['participant', 'organization', 'contributor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be participant, organization, or contributor' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const userData = {
      email: email.toLowerCase(),
      password,
      name,
      role,
      xp: 10, // XP for registration
      ...additionalData,
    };

    const user = await User.create(userData);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
