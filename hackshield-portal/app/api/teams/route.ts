import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/lib/db/models/Team';
import Hackathon from '@/lib/db/models/Hackathon';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

// GET - List teams (with filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const hackathonId = searchParams.get('hackathon');

    const query: any = {};
    if (hackathonId) {
      query.hackathonId = hackathonId;
    }

    const teams = await Team.find(query)
      .populate('hackathonId', 'title status startDate')
      .populate('leaderId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST - Create a new team
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, hackathonId, invitedEmails } = await req.json();

    if (!name || !hackathonId) {
      return NextResponse.json(
        { error: 'Team name and hackathon ID are required' },
        { status: 400 }
      );
    }

    // Check if hackathon exists and registration is open
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now > new Date(hackathon.registrationEnd)) {
      return NextResponse.json(
        { error: 'Registration has closed for this hackathon' },
        { status: 400 }
      );
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathonId: hackathonId,
      $or: [
        { leaderId: session.user.id },
        { 'members.userId': session.user.id }
      ]
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You are already in a team for this hackathon' },
        { status: 400 }
      );
    }

    // Create the team
    const team = await Team.create({
      name,
      hackathonId: hackathonId,
      leaderId: session.user.id,
      members: [{
        userId: session.user.id,
        role: 'leader',
        joinedAt: new Date(),
      }],
      invitedEmails: invitedEmails || [],
      status: 'forming',
    });

    // Add team to hackathon's registered teams
    await Hackathon.findByIdAndUpdate(hackathonId, {
      $push: { registeredTeams: team._id },
    });

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { hackathonsParticipated: 1, xp: 15 },
    });

    // Populate the team
    const populatedTeam = await Team.findById(team._id)
      .populate('hackathon', 'title startDate')
      .populate('members.user', 'name email avatar');

    return NextResponse.json(
      { message: 'Team created successfully', team: populatedTeam },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
