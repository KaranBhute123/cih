import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Team } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const team = await Team.findById(params.id)
      .populate('hackathon', 'title startDate endDate status')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is team leader
    const isLeader = team.members.some(
      (m: any) => m.user.toString() === session.user.id && m.role === 'leader'
    );

    if (!isLeader) {
      return NextResponse.json(
        { success: false, message: 'Only team leader can update team' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (name) {
      team.name = name;
    }

    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is team leader
    const isLeader = team.members.some(
      (m: any) => m.user.toString() === session.user.id && m.role === 'leader'
    );

    if (!isLeader) {
      return NextResponse.json(
        { success: false, message: 'Only team leader can delete team' },
        { status: 403 }
      );
    }

    await Team.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: 'Team deleted' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
