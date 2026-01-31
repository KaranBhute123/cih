import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Contributor from '@/models/Contributor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type')?.split(',').filter(Boolean) || [];
    const expertise = searchParams.get('expertise')?.split(',').filter(Boolean) || [];
    const location = searchParams.get('location') || '';
    const verified = searchParams.get('verified');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    
    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { expertise: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (type.length > 0) {
      filter.type = { $in: type };
    }
    
    if (expertise.length > 0) {
      filter.expertise = { $in: expertise };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (verified !== null && verified !== undefined) {
      filter.verified = verified === 'true';
    }
    
    // Build sort query
    let sort: any = {};
    switch (sortBy) {
      case 'popularity':
        sort = { 
          rating: -1, 
          reviewCount: -1,
          'stats.projectsSupported': -1
        };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'projects':
        sort = { 'stats.projectsSupported': -1 };
        break;
      default:
        sort = { rating: -1, reviewCount: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const contributors = await Contributor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-email') // Don't expose emails in public listings
      .exec();
    
    const totalContributors = await Contributor.countDocuments(filter);
    const totalPages = Math.ceil(totalContributors / limit);
    
    return NextResponse.json({
      contributors,
      pagination: {
        currentPage: page,
        totalPages,
        totalContributors,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const {
      name,
      avatar,
      type,
      title,
      company,
      bio,
      expertise,
      investmentRange,
      location,
      website,
      linkedin,
      portfolio
    } = body;
    
    // Validate required fields
    if (!name || !type || !title || !bio || !expertise) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if contributor already exists for this user
    const existingContributor = await Contributor.findOne({ userId: session.user.id });
    if (existingContributor) {
      return NextResponse.json(
        { error: 'Contributor profile already exists' },
        { status: 400 }
      );
    }
    
    // Initialize stats
    const stats = {
      projectsSupported: 0,
      totalInvestment: 0,
      successRate: 0,
      responseTime: '< 24h'
    };
    
    const contributor = new Contributor({
      userId: session.user.id,
      name,
      avatar,
      type,
      title,
      company,
      bio,
      expertise,
      investmentRange,
      location,
      website,
      linkedin,
      email: session.user.email,
      verified: false, // Requires manual verification
      rating: 0,
      reviewCount: 0,
      portfolio: portfolio || [],
      stats
    });
    
    await contributor.save();
    
    return NextResponse.json({
      message: 'Contributor profile created successfully',
      contributor
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating contributor:', error);
    return NextResponse.json(
      { error: 'Failed to create contributor profile' },
      { status: 500 }
    );
  }
}