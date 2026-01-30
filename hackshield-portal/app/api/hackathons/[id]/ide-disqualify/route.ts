import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// POST - Disqualify participant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, reason } = await request.json();

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

    // Disqualify
    participant.ideDisqualified = true;
    participant.ideDisqualifiedReason = reason;
    participant.ideSessionActive = false;
    participant.status = 'disqualified';

    await hackathon.save();

    return NextResponse.json({
      success: true,
      message: 'Participant disqualified',
    });

  } catch (error) {
    console.error('Disqualification error:', error);
    return NextResponse.json(
      { error: 'Failed to disqualify' },
      { status: 500 }
    );
  }
}
