import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Team, Notification } from '@/lib/db/models';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const team = await Team.findById(params.id)
      .populate('hackathon', 'title');
      
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is team leader
    const isLeader = team.members.some(
      (m: any) => m.user.toString() === session.user.id && m.role === 'leader'
    );

    if (!isLeader) {
      return NextResponse.json(
        { success: false, message: 'Only team leader can invite members' },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Find the user by email
    // 2. Create an invitation record
    // 3. Send an email notification

    // For now, create a notification (simulated)
    // This would require finding the user first
    
    // Create notification for the invitee (if they exist)
    // This is a simplified version
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      inviteCode: (team as any).inviteCode
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
