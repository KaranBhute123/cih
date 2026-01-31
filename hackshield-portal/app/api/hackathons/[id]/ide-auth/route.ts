import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/models/Team';
import Hackathon from '@/lib/db/models/Hackathon';

// POST - Authenticate IDE access (Demo mode - no credentials needed)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    await connectDB();

    // For demo: Find user's team in this hackathon (no credentials needed)
    const team = await Team.findOne({
      hackathonId: params.id,
      $or: [
        { leaderId: session.user.id },
        { 'members.userId': session.user.id }
      ]
    }).populate('leaderId').populate('members.userId');

    if (!team) {
      return NextResponse.json(
        { error: 'You are not registered for this hackathon' },
        { status: 403 }
      );
    }

    // Get hackathon details
    const hackathon = await Hackathon.findById(params.id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // IDE available immediately after registration - no status check needed for demo

    // Default security settings for IDE
    const defaultSecuritySettings = {
      enableLockdownMode: hackathon.enableScreenshotDetection || false,
      tabSwitchLimit: 5,
      screenshotInterval: 300000,
      enableCodeExecution: true
    };

    return NextResponse.json({
      success: true,
      teamId: team._id,
      teamName: team.name,
      isLeader: team.leaderId._id.toString() === session.user.id,
      participant: {
        name: session.user.name,
        teamName: team.name,
        email: session.user.email,
      },
      hackathon: {
        title: hackathon.title,
        endTime: hackathon.endDate,
      },
      endTime: hackathon.endDate,
      securitySettings: defaultSecuritySettings
    });

  } catch (error) {
    console.error('IDE authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
