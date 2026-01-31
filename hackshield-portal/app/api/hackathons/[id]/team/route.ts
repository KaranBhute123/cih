import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/models/Team';
import Hackathon from '@/lib/db/models/Hackathon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find team where user is a member and hackathon matches
    const team = await Team.findOne({
      hackathonId: params.id,
      $or: [
        { leaderId: session.user.id },
        { 'members.userId': session.user.id }
      ]
    }).populate('members.userId', 'name email');

    if (!team) {
      return NextResponse.json(
        { team: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (error) {
    console.error('Error checking team registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
