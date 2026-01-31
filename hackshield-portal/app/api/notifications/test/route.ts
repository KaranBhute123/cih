import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { channel } = await request.json();

    // Mock test notification - in a real app you'd integrate with actual services
    const testMessages = {
      email: 'Test email notification sent successfully!',
      sms: 'Test SMS notification sent successfully!',
      push: 'Test push notification sent successfully!',
      in_app: 'Test in-app notification created successfully!'
    };

    const message = testMessages[channel as keyof typeof testMessages] || 'Test notification sent!';

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      message,
      channel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}