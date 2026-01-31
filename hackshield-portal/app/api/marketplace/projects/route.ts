import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const domain = searchParams.get('domain')?.split(',').filter(Boolean) || [];
    const technologies = searchParams.get('technologies')?.split(',').filter(Boolean) || [];
    const stage = searchParams.get('stage')?.split(',').filter(Boolean) || [];
    const seeking = searchParams.get('seeking')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'popularity';
    
    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
        { domain: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (domain.length > 0) {
      filter.domain = { $in: domain };
    }
    
    if (technologies.length > 0) {
      filter.technologies = { $in: technologies };
    }
    
    if (stage.length > 0) {
      filter.stage = { $in: stage };
    }
    
    if (seeking.length > 0) {
      filter.seeking = { $in: seeking };
    }
    
    // Build sort query
    let sort: any = {};
    switch (sortBy) {
      case 'popularity':
        sort = { 
          'metrics.views': -1, 
          'metrics.likes': -1, 
          'metrics.bookmarks': -1 
        };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { 'codeQuality.score': -1 };
        break;
      case 'views':
        sort = { 'metrics.views': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const projects = await Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('team.members', 'name avatar role linkedin github')
      .exec();
    
    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / limit);
    
    return NextResponse.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
      title,
      description,
      longDescription,
      thumbnail,
      demoVideo,
      liveDemo,
      githubRepo,
      technologies,
      domain,
      team,
      hackathon,
      seeking,
      stage,
      traction
    } = body;
    
    // Validate required fields
    if (!title || !description || !technologies || !domain || !team || !hackathon) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate initial code quality metrics (this would normally be done by analyzing the actual code)
    const codeQuality = {
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      linesOfCode: Math.floor(Math.random() * 5000) + 500,
      commits: Math.floor(Math.random() * 100) + 10,
      testCoverage: Math.floor(Math.random() * 60) + 40,
      securityScore: Math.floor(Math.random() * 30) + 70
    };
    
    // Calculate blockchain metrics
    const blockchain = {
      verified: Math.random() > 0.3, // 70% chance of being verified
      originalityScore: Math.floor(Math.random() * 30) + 70,
      aiDependency: Math.floor(Math.random() * 50) + 10
    };
    
    // Initialize metrics
    const metrics = {
      views: 0,
      likes: 0,
      comments: 0,
      bookmarks: 0,
      shares: 0
    };
    
    const project = new Project({
      title,
      description,
      longDescription,
      thumbnail,
      demoVideo,
      liveDemo,
      githubRepo,
      technologies,
      domain,
      team,
      hackathon,
      seeking,
      stage,
      traction,
      codeQuality,
      blockchain,
      metrics,
      createdBy: session.user.id
    });
    
    await project.save();
    
    return NextResponse.json({
      message: 'Project created successfully',
      project
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}