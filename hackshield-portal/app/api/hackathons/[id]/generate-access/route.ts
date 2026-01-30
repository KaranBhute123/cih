import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';
import crypto from 'crypto';

// Generate unique ID and password for hackathon access
function generateAccessCredentials() {
  const id = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 character ID
  const password = crypto.randomBytes(8).toString('hex'); // 16 character password
  return { id, password };
}

// POST - Generate access credentials for a participant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Check if user is registered participant
    const participant: any = hackathon.participants?.find(
      (p: any) => p.userId === session.user.id
    );

    if (!participant && session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'You are not registered for this hackathon' },
        { status: 403 }
      );
    }

    // Organization can generate access for any participant
    if (session.user.role === 'organization') {
      const { participantUserId } = await request.json();
      
      const targetParticipant: any = hackathon.participants?.find(
        (p: any) => p.userId === participantUserId
      );

      if (!targetParticipant) {
        return NextResponse.json(
          { error: 'Participant not found' },
          { status: 404 }
        );
      }

      // Generate or return existing credentials
      if (!targetParticipant.ideAccessId || !targetParticipant.ideAccessPassword) {
        const { id, password } = generateAccessCredentials();
        targetParticipant.ideAccessId = id;
        targetParticipant.ideAccessPassword = password;
        targetParticipant.ideAccessGeneratedAt = new Date();
        await hackathon.save();
      }

      return NextResponse.json({
        accessId: targetParticipant.ideAccessId,
        accessPassword: targetParticipant.ideAccessPassword,
        participantName: targetParticipant.name,
        teamName: targetParticipant.teamName,
      });
    }

    // Participant generating their own credentials
    if (!participant.ideAccessId || !participant.ideAccessPassword) {
      const { id, password } = generateAccessCredentials();
      participant.ideAccessId = id;
      participant.ideAccessPassword = password;
      participant.ideAccessGeneratedAt = new Date();
      await hackathon.save();
    }

    return NextResponse.json({
      accessId: participant.ideAccessId,
      accessPassword: participant.ideAccessPassword,
      message: 'Access credentials generated successfully',
    });

  } catch (error) {
    console.error('Generate access error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access credentials' },
      { status: 500 }
    );
  }
}

// GET - Get access credentials (for organization to view)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Only organization can view all credentials
    if (session.user.role === 'organization') {
      const participantsWithAccess = hackathon.participants
        ?.filter((p: any) => p.ideAccessId && p.ideAccessPassword)
        .map((p: any) => ({
          userId: p.userId,
          name: p.teamLeaderName,
          email: p.teamLeaderEmail,
          teamName: p.teamName,
          accessId: p.ideAccessId,
          accessPassword: p.ideAccessPassword,
          generatedAt: p.ideAccessGeneratedAt,
          isActive: p.ideSessionActive || false,
          lastActivity: p.ideLastActivity,
        })) || [];

      return NextResponse.json({
        participants: participantsWithAccess,
        total: participantsWithAccess.length,
      });
    }

    // Participant viewing their own credentials
    const participant: any = hackathon.participants?.find(
      (p: any) => p.userId === session.user.id
    );

    if (!participant) {
      return NextResponse.json(
        { error: 'Not registered' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      accessId: participant.ideAccessId,
      accessPassword: participant.ideAccessPassword,
      hasAccess: !!(participant.ideAccessId && participant.ideAccessPassword),
    });

  } catch (error) {
    console.error('Get access error:', error);
    return NextResponse.json(
      { error: 'Failed to get access credentials' },
      { status: 500 }
    );
  }
}
