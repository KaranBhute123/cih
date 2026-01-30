import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Team } from '@/lib/db/models';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, message: 'Invite code is required' },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = team.members.some(
      (m: any) => m.user.toString() === session.user.id
    );

    if (isMember) {
      return NextResponse.json(
        { success: false, message: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Check team size limit (assume max 5 members)
    if (team.members.length >= 5) {
      return NextResponse.json(
        { success: false, message: 'Team is full' },
        { status: 400 }
      );
    }

    // Add user to team
    team.members.push({
      user: new mongoose.Types.ObjectId(session.user.id),
      role: 'member',
      joinedAt: new Date(),
    } as any);

    await team.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Joined team successfully',
      team 
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to join team' },
      { status: 500 }
    );
  }
}
