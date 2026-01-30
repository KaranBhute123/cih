import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// Get team statuses for monitoring
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Check if user is the organization owner
    if (hackathon.organization.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all participants with IDE sessions
    const teams = hackathon.participants
      ?.filter((p: any) => p.ideSessionActive || p.ideSessionStarted)
      .map((p: any) => {
        const sessionDuration = p.ideSessionStarted
          ? formatDuration(new Date().getTime() - new Date(p.ideSessionStarted).getTime())
          : '0m';

        return {
          teamId: p._id.toString(),
          teamName: p.teamName || p.name,
          teamLeader: p.teamLeaderName || p.name,
          isActive: p.ideSessionActive || false,
          lastActivity: p.ideLastActivity || p.ideSessionStarted,
          filesCount: 0, // Will be populated from IDE storage
          violations: p.ideAttemptedLeave || 0,
          strikeCount: p.ideAttemptedLeave || 0,
          sessionDuration,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      teams,
      totalTeams: teams.length,
      activeTeams: teams.filter((t: any) => t.isActive).length,
    });

  } catch (error: any) {
    console.error('Get team statuses error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team statuses' },
      { status: 500 }
    );
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}
