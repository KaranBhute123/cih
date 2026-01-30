import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { Project } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const pricingType = searchParams.get('pricingType');
    const technology = searchParams.get('technology');
    const sortBy = searchParams.get('sortBy') || 'trending';

    // Build query
    const query: any = {
      marketplaceStatus: 'available',
    };

    if (category) {
      query.category = category;
    }

    if (pricingType) {
      query['pricing.type'] = pricingType;
    }

    if (technology) {
      query.technologies = { $in: [technology] };
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'mostLiked':
        sort = { 'analytics.likes': -1 };
        break;
      case 'mostViewed':
        sort = { 'analytics.views': -1 };
        break;
      case 'trending':
      default:
        sort = { featured: -1, 'analytics.views': -1 };
    }

    const projects = await Project.find(query)
      .populate('team', 'name')
      .populate('hackathon', 'title')
      .sort(sort)
      .limit(50);

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      title,
      description,
      team,
      hackathon,
      technologies,
      category,
      demoUrl,
      repoUrl,
      coverImage,
      pricing,
    } = body;

    if (!title || !description || !team) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and team are required' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title,
      description,
      team,
      hackathon,
      technologies: technologies || [],
      category: category || 'Other',
      demoUrl,
      repoUrl,
      coverImage,
      pricing,
      createdBy: session.user.id,
      marketplaceStatus: 'available',
      analytics: {
        views: 0,
        inquiries: 0,
        likes: 0,
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    );
  }
}
