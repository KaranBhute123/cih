import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import NotificationPreferences from '@/models/NotificationPreferences';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    let preferences = await NotificationPreferences.findOne({ userId: session.user.id });

    if (!preferences) {
      // Create default preferences
      preferences = NotificationPreferences.createDefault(session.user.id, session.user.email || '');
      await preferences.save();
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    let preferences = await NotificationPreferences.findOne({ userId: session.user.id });

    if (!preferences) {
      // Create new preferences if they don't exist
      preferences = NotificationPreferences.createDefault(session.user.id, session.user.email || '');
    }

    // Update preferences
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        if (typeof body[key] === 'object' && body[key] !== null) {
          preferences[key] = { ...preferences[key], ...body[key] };
        } else {
          preferences[key] = body[key];
        }
      }
    });

    await preferences.save();

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}