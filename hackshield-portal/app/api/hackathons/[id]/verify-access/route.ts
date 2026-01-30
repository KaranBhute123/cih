import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// Verify IDE access credentials
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessId, password } = await request.json();

    if (!accessId || !password) {
      return NextResponse.json({ error: 'Access ID and password are required' }, { status: 400 });
    }

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    if (!hackathon.participants || hackathon.participants.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 404 });
    }

    // Find participant with matching credentials
    const participant = hackathon.participants.find(
      (p: any) => 
        p.ideAccessId === accessId && 
        p.ideAccessPassword === password
    );

    if (!participant) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if participant is disqualified
    if (participant.ideDisqualified) {
      return NextResponse.json({ 
        error: `Access denied: ${participant.ideDisqualifiedReason || 'You have been disqualified'}` 
      }, { status: 403 });
    }

    // Check hackathon timing
    const now = new Date();
    const hackathonStart = new Date(hackathon.startDate);
    const hackathonEnd = new Date(hackathon.endDate);

    if (now < hackathonStart) {
      return NextResponse.json({ 
        error: 'Hackathon has not started yet',
        startsAt: hackathonStart 
      }, { status: 403 });
    }

    if (now > hackathonEnd) {
      return NextResponse.json({ 
        error: 'Hackathon has ended' 
      }, { status: 403 });
    }

    // Update participant's IDE session status
    participant.ideSessionActive = true;
    participant.ideLastActivity = new Date();
    
    // Set session start time if not already set
    if (!participant.ideSessionStarted) {
      participant.ideSessionStarted = new Date();
    }

    await hackathon.save();

    return NextResponse.json({
      success: true,
      message: 'Credentials verified successfully',
      participant: {
        name: participant.name,
        email: participant.email,
        teamName: participant.teamName,
        sessionStarted: participant.ideSessionStarted,
        attemptedLeave: participant.ideAttemptedLeave || 0,
      },
      hackathon: {
        title: hackathon.title,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        duration: hackathon.duration,
      }
    });

  } catch (error: any) {
    console.error('Verify access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify credentials' },
      { status: 500 }
    );
  }
}
