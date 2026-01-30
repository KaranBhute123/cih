import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Team } from '@/lib/db/models';

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

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    const memberIndex = team.members.findIndex(
      (m: any) => m.user.toString() === session.user.id
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this team' },
        { status: 403 }
      );
    }

    // Check if user is the leader
    const isLeader = team.members[memberIndex].role === 'leader';
    if (isLeader) {
      return NextResponse.json(
        { success: false, message: 'Team leader cannot leave. Transfer leadership or delete the team.' },
        { status: 400 }
      );
    }

    // Remove user from team
    team.members.splice(memberIndex, 1);
    await team.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Left team successfully' 
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to leave team' },
      { status: 500 }
    );
  }
}
