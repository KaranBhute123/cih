import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

// GET - Get current user stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'xp level badges reputation hackathonsParticipated hackathonsWon projectsCreated'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hackathonsJoined: user.hackathonsParticipated || 0,
      hackathonsWon: user.hackathonsWon || 0,
      projectsCreated: user.projectsCreated || 0,
      totalXP: user.xp || 0,
      level: user.level || 1,
      badges: user.badges || [],
      reputation: user.reputation || 0,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
