import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

export const dynamic = 'force-dynamic';

// GET - List hackathons with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const theme = searchParams.get('theme');
    const mode = searchParams.get('mode');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const organizationOwned = searchParams.get('organizationOwned');

    const query: any = {};

    // Filter by organization ownership
    if (organizationOwned === 'true') {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        query.organization = session.user.id;
        // Show all statuses for owned hackathons
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else if (status) {
      // Support multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim());
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    } else {
      query.status = { $in: ['published', 'active'] };
    }

    if (theme) {
      query.theme = theme;
    }

    if (mode) {
      query.mode = mode;
    }

    const skip = (page - 1) * limit;

    const [hackathons, total] = await Promise.all([
      Hackathon.find(query)
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .select('-rules -codeOfConduct -longDescription'),
      Hackathon.countDocuments(query),
    ]);

    return NextResponse.json({
      hackathons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}

// POST - Create a new hackathon (Organization only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Unauthorized. Only organizations can create hackathons.' },
        { status: 403 }
      );
    }

    await connectDB();

    const data = await req.json();
    
    console.log('Received hackathon data:', JSON.stringify(data, null, 2));

    // Validate required fields
    const requiredFields = ['title', 'tagline', 'description', 'theme', 'startDate', 'endDate', 'mode'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.log(`Missing required field: ${field}, value:`, data[field]);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate total prize pool
    const totalPrizePool = data.prizes?.reduce((acc: number, prize: any) => acc + (prize.amount || 0), 0) || 0;

    // Calculate duration in hours
    const duration = data.startDate && data.endDate 
      ? Math.round((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60))
      : 24;

    // Transform prizes - form uses 'position' but model uses 'place'
    const transformedPrizes = data.prizes?.map((prize: any) => ({
      place: prize.position || prize.place,
      amount: prize.amount,
      description: prize.description
    })) || [];

    // Prepare hackathon data
    const hackathonData = {
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      longDescription: data.longDescription,
      theme: data.theme,
      coverImage: data.coverImage,
      startDate: data.startDate,
      endDate: data.endDate,
      registrationStart: data.registrationStart || new Date(),
      registrationEnd: data.registrationDeadline || data.registrationEnd || data.startDate,
      duration,
      mode: data.mode,
      venue: data.venue,
      venueAddress: data.venueAddress,
      minTeamSize: data.minTeamSize || 1,
      maxTeamSize: data.maxTeamSize || 4,
      soloAllowed: data.minTeamSize === 1,
      allowedTechnologies: data.allowedTechnologies || [],
      prohibitedTechnologies: data.prohibitedTechnologies || [],
      externalLibrariesAllowed: data.externalLibrariesAllowed ?? true,
      preBuiltCodeAllowed: data.preBuiltCodeAllowed ?? false,
      aiAssistanceLevel: data.securitySettings?.aiProctoring ? 'strict' : 'moderate',
      prizes: transformedPrizes,
      totalPrizePool,
      judgingCriteria: data.judgingCriteria || [],
      publicLeaderboard: data.publicLeaderboard ?? true,
      enableNeuralFairness: data.enableNeuralFairness ?? true,
      enableBlockchain: data.enableBlockchain ?? false,
      enableGeolocation: data.securitySettings?.enableGeolocation ?? false,
      enableIdentityCheck: data.securitySettings?.enableIdentityCheck ?? false,
      enableScreenshotDetection: data.securitySettings?.codeRecording ?? true,
      rules: data.rules || [],
      codeOfConduct: data.codeOfConduct,
      organization: session.user.id,
      organizationName: session.user.name,
      organizationLogo: session.user.avatar,
      status: 'published', // Auto-publish so participants can see it immediately
      views: 0,
    };

    const hackathon = await Hackathon.create(hackathonData);

    return NextResponse.json(
      { message: 'Hackathon created successfully', hackathon },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating hackathon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create hackathon' },
      { status: 500 }
    );
  }
}
