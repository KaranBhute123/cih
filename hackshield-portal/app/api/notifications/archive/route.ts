import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database';
import Notification from '@/models/Notification';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { notificationIds } = await request.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    await Notification.updateMany(
      { 
        _id: { $in: notificationIds }, 
        userId: session.user.id 
      },
      { archived: true }
    );

    return NextResponse.json({
      message: 'Notifications archived successfully'
    });

  } catch (error) {
    console.error('Error archiving notifications:', error);
    return NextResponse.json(
      { error: 'Failed to archive notifications' },
      { status: 500 }
    );
  }
}