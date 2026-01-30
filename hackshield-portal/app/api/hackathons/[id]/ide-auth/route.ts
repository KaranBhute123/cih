import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// POST - Authenticate IDE access
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, accessPassword } = await request.json();

    if (!accessId || !accessPassword) {
      return NextResponse.json(
        { error: 'Access ID and Password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Find participant with matching credentials
    const participant: any = hackathon.participants?.find(
      (p: any) => 
        p.ideAccessId === accessId && 
        p.ideAccessPassword === accessPassword
    );

    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if already disqualified
    if (participant.ideDisqualified) {
      return NextResponse.json(
        { error: `Disqualified: ${participant.ideDisqualifiedReason}` },
        { status: 403 }
      );
    }

    // Check if hackathon is active
    const now = new Date();
    const startTime = new Date(hackathon.startDate);
    const endTime = new Date(hackathon.endDate);

    if (now < startTime) {
      return NextResponse.json(
        { error: 'Hackathon has not started yet' },
        { status: 400 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: 'Hackathon has ended' },
        { status: 400 }
      );
    }

    // Activate session
    participant.ideSessionActive = true;
    participant.ideSessionStarted = participant.ideSessionStarted || now;
    participant.ideLastActivity = now;
    await hackathon.save();

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      participant: {
        name: participant.teamLeaderName,
        teamName: participant.teamName,
        email: participant.teamLeaderEmail,
      },
      hackathon: {
        title: hackathon.title,
        endTime: endTime.toISOString(),
      },
      endTime: endTime.toISOString(),
    });

  } catch (error) {
    console.error('IDE auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
