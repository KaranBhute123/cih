import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/lib/db/models/Team';

export const dynamic = 'force-dynamic';

// GET - Get teams for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Query for teams using both old and new field structures
    const teams = await Team.find({
      $or: [
        { 'members.user': session.user.id },
        { 'members.userId': session.user.id },
        { leaderId: session.user.id }
      ]
    })
      .populate('hackathon hackathonId', 'title status startDate endDate')
      .populate('members.user members.userId leaderId', 'name email avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error('Error fetching my teams:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
