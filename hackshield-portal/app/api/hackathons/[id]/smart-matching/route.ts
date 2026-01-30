import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

// Helper function to calculate skill match score
function calculateSkillMatch(skills1: string[], skills2: string[]): number {
  if (!skills1.length || !skills2.length) return 0;
  
  const normalizedSkills1 = skills1.map(s => s.toLowerCase().trim());
  const normalizedSkills2 = skills2.map(s => s.toLowerCase().trim());
  
  const commonSkills = normalizedSkills1.filter(skill => 
    normalizedSkills2.includes(skill)
  );
  
  const complementarySkills = normalizedSkills1.filter(skill => 
    !normalizedSkills2.includes(skill)
  );
  
  // Score: 30% for common skills (collaboration) + 70% for complementary skills (diversity)
  const commonScore = (commonSkills.length / Math.max(skills1.length, skills2.length)) * 30;
  const complementaryScore = (complementarySkills.length / skills1.length) * 70;
  
  return commonScore + complementaryScore;
}

// POST - Find smart matches for a participant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'participant') {
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

    // Find current participant
    const currentParticipant: any = hackathon.participants?.find(
      (p: any) => p.userId === session.user.id
    );

    if (!currentParticipant) {
      return NextResponse.json(
        { error: 'You are not registered for this hackathon' },
        { status: 400 }
      );
    }

    if (!currentParticipant.needSmartMatching) {
      return NextResponse.json(
        { error: 'Smart matching is not enabled for your registration' },
        { status: 400 }
      );
    }

    // Find other participants who need teammates
    const potentialTeammates = hackathon.participants?.filter((p: any) => 
      p.userId !== session.user.id &&
      p.needSmartMatching &&
      p.matchingStatus === 'pending' &&
      !p.hasTeam
    ) || [];

    if (potentialTeammates.length === 0) {
      return NextResponse.json({
        message: 'No potential teammates found yet',
        matches: [],
      });
    }

    // Calculate match scores
    const matches = potentialTeammates.map((teammate: any) => {
      const matchScore = calculateSkillMatch(
        currentParticipant.skills || [],
        teammate.skills || []
      );

      return {
        userId: teammate.userId,
        name: teammate.teamLeaderName,
        email: teammate.teamLeaderEmail,
        skills: teammate.skills,
        college: teammate.teamLeaderCollege,
        yearOfStudy: teammate.teamLeaderYearOfStudy,
        course: teammate.teamLeaderCourse,
        matchScore: Math.round(matchScore),
        preferredTeamSize: teammate.preferredTeamSize,
      };
    });

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 10 matches
    const topMatches = matches.slice(0, 10);

    return NextResponse.json({
      message: 'Smart matches found',
      matches: topMatches,
      totalPotential: matches.length,
    });

  } catch (error) {
    console.error('Smart matching error:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}

// PATCH - Send collaboration invite
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'participant') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { targetUserId, action } = await request.json();

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    if (action === 'invite') {
      // Send collaboration invite
      const currentParticipant: any = hackathon.participants?.find(
        (p: any) => p.userId === session.user.id
      );

      const targetParticipant: any = hackathon.participants?.find(
        (p: any) => p.userId === targetUserId
      );

      if (!currentParticipant || !targetParticipant) {
        return NextResponse.json(
          { error: 'Participant not found' },
          { status: 404 }
        );
      }

      // Add to matched list
      if (!currentParticipant.matchedWith) {
        currentParticipant.matchedWith = [];
      }
      
      if (!currentParticipant.matchedWith.includes(targetUserId)) {
        currentParticipant.matchedWith.push(targetUserId);
        currentParticipant.matchingStatus = 'matched';
      }

      await hackathon.save();

      return NextResponse.json({
        message: 'Collaboration invite sent successfully',
        matchedWith: currentParticipant.matchedWith,
      });

    } else if (action === 'accept') {
      // Accept collaboration invite
      // This would create a team with both participants
      return NextResponse.json({
        message: 'Collaboration accepted',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Collaboration invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}
