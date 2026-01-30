import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Team } from '@/lib/db/models';

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
        { success: false, message: 'Only team leader can update project' },
        { status: 403 }
      );
    }

    const { title, description, repoUrl, demoUrl } = await req.json();

    // Update project fields
    if (!team.project) {
      (team as any).project = {};
    }
    (team as any).project = {
      title: title || (team as any).project?.title,
      description: description || (team as any).project?.description,
      repoUrl: repoUrl || (team as any).project?.repoUrl,
      demoUrl: demoUrl || (team as any).project?.demoUrl,
    };

    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
      { status: 500 }
    );
  }
}
