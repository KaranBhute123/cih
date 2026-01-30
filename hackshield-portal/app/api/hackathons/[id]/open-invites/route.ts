import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get all users looking for a team for this hackathon
    const users = await User.find({
      lookingForTeam: true,
      lookingForHackathon: params.id
    }).select('name avatar skills experience bio github linkedin createdAt');

    const invites = users.map((user: any) => ({
      _id: user._id,
      userId: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      skills: user.skills || [],
      experience: user.experience || 'intermediate',
      bio: user.bio || '',
      createdAt: user.createdAt
    }));

    return NextResponse.json({ invites });
  } catch (error: any) {
    console.error('Error fetching open invites:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { bio, skills, experience } = await request.json();

    // Update user to mark as looking for team
    await User.findByIdAndUpdate(session.user.id, {
      lookingForTeam: true,
      lookingForHackathon: params.id,
      bio,
      skills,
      experience
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating open invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Remove looking for team status
    await User.findByIdAndUpdate(session.user.id, {
      lookingForTeam: false,
      lookingForHackathon: null
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting open invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
