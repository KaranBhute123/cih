import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// POST - Track IDE activity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, action, attempts, timestamp } = await request.json();

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    const participant: any = hackathon.participants?.find(
      (p: any) => p.ideAccessId === accessId
    );

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Update activity
    participant.ideLastActivity = new Date(timestamp || Date.now());

    if (action === 'leave_attempt') {
      participant.ideAttemptedLeave = attempts || (participant.ideAttemptedLeave || 0) + 1;
    }

    await hackathon.save();

    return NextResponse.json({
      success: true,
      attempts: participant.ideAttemptedLeave,
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}
