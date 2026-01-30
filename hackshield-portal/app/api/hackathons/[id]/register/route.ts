import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'participant') {
      return NextResponse.json(
        { error: 'Unauthorized. Only participants can register.' },
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

    // Check if hackathon is open for registration
    if (hackathon.status !== 'published' && hackathon.status !== 'active') {
      return NextResponse.json(
        { error: 'This hackathon is not open for registration' },
        { status: 400 }
      );
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(hackathon.registrationEnd)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check if already registered
    const alreadyRegistered = hackathon.participants?.some(
      (p: any) => p.userId === session.user.id
    );

    if (alreadyRegistered) {
      return NextResponse.json(
        { error: 'You are already registered for this hackathon' },
        { status: 400 }
      );
    }

    // Check if hackathon is full
    if (hackathon.maxParticipants && 
        (hackathon.participants?.length || 0) >= hackathon.maxParticipants) {
      return NextResponse.json(
        { error: 'This hackathon has reached maximum participants' },
        { status: 400 }
      );
    }

    // Get registration data from request body
    const registrationData = await request.json();

    // Validate team size only if user has a team
    if (registrationData.hasTeam) {
      if (registrationData.teamSize < hackathon.minTeamSize || 
          registrationData.teamSize > hackathon.maxTeamSize) {
        return NextResponse.json(
          { error: `Team size must be between ${hackathon.minTeamSize} and ${hackathon.maxTeamSize}` },
          { status: 400 }
        );
      }
    }

    // Add participant with full registration details
    const participant = {
      userId: session.user.id,
      name: session.user.name || registrationData.teamLeaderName,
      email: session.user.email || registrationData.teamLeaderEmail,
      avatar: session.user.avatar,
      registeredAt: new Date(),
      status: 'registered' as const,
      teamId: undefined,
      
      // Team Formation Mode
      hasTeam: registrationData.hasTeam,
      needSmartMatching: registrationData.needSmartMatching || false,
      skills: registrationData.skills || [],
      preferredTeamSize: registrationData.preferredTeamSize,
      matchingStatus: registrationData.needSmartMatching ? 'pending' : 'not-needed',
      matchedWith: [],
      
      // Team Information (only if has team)
      teamName: registrationData.teamName,
      teamSize: registrationData.teamSize,
      teamLeaderName: registrationData.teamLeaderName,
      teamLeaderEmail: registrationData.teamLeaderEmail,
      teamLeaderMobile: registrationData.teamLeaderMobile,
      teamLeaderGender: registrationData.teamLeaderGender,
      teamLeaderDOB: new Date(registrationData.teamLeaderDOB),
      teamLeaderCollege: registrationData.teamLeaderCollege,
      teamLeaderUniversity: registrationData.teamLeaderUniversity,
      teamLeaderYearOfStudy: registrationData.teamLeaderYearOfStudy,
      teamLeaderCourse: registrationData.teamLeaderCourse,
      
      // Team Members (empty if no team)
      teamMembers: registrationData.teamMembers?.map((member: any) => ({
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        gender: member.gender,
        dateOfBirth: new Date(member.dateOfBirth),
        collegeName: member.collegeName,
        universityName: member.universityName,
        yearOfStudy: member.yearOfStudy,
        course: member.course,
      })) || [],
      
      // Additional Information
      projectIdea: registrationData.projectIdea,
      previousHackathonExperience: registrationData.previousHackathonExperience,
      specialRequirements: registrationData.specialRequirements,
      
      // PPT Upload for Selection Round
      pptUrl: registrationData.pptUrl,
      pptUploadedAt: registrationData.pptUrl ? new Date() : undefined,
      selectionRound1Status: 'pending',
      selectionRound1Feedback: '',
    };

    hackathon.participants = hackathon.participants || [];
    hackathon.participants.push(participant);

    await hackathon.save();

    return NextResponse.json({
      message: 'Successfully registered for hackathon',
      participant,
      totalParticipants: hackathon.participants.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register for hackathon' },
      { status: 500 }
    );
  }
}

// GET - Check registration status
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

    const isRegistered = hackathon.participants?.some(
      (p: any) => p.userId === session.user.id
    );

    return NextResponse.json({
      isRegistered,
      totalParticipants: hackathon.participants?.length || 0,
      maxParticipants: hackathon.maxParticipants,
      canRegister: hackathon.status === 'published' || hackathon.status === 'active',
      registrationDeadlinePassed: new Date() > new Date(hackathon.registrationEnd),
    }, { status: 200 });

  } catch (error) {
    console.error('Check registration error:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}

// DELETE - Unregister from hackathon
export async function DELETE(
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

    // Check if hackathon has started
    if (hackathon.status === 'active' || hackathon.status === 'judging' || hackathon.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot unregister after hackathon has started' },
        { status: 400 }
      );
    }

    // Remove participant
    hackathon.participants = hackathon.participants?.filter(
      (p: any) => p.userId !== session.user.id
    ) || [];

    await hackathon.save();

    return NextResponse.json({
      message: 'Successfully unregistered from hackathon',
    }, { status: 200 });

  } catch (error) {
    console.error('Unregister error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from hackathon' },
      { status: 500 }
    );
  }
}
