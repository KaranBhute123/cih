import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  participantId: { type: String, required: true },
  participantName: { type: String, required: true },
  activityType: { 
    type: String, 
    enum: ['code_change', 'file_created', 'file_deleted', 'terminal_command', 'ai_query', 'violation', 'save', 'execute'],
    required: true 
  },
  details: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  timestamp: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// GET - Fetch activities
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const activityType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { hackathonId: params.id };
    
    if (teamId && teamId !== 'all') {
      query.teamId = teamId;
    }
    
    if (activityType && activityType !== 'all') {
      query.activityType = activityType;
    }

    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      activities: activities.reverse(), // Reverse to show oldest first
      count: activities.length,
    });

  } catch (error: any) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Log a new activity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, teamName, participantName, activityType, details, metadata, severity } = body;

    if (!teamId || !teamName || !participantName || !activityType || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const activity = await ActivityLog.create({
      hackathonId: params.id,
      teamId,
      teamName,
      participantId: session.user.id,
      participantName,
      activityType,
      details,
      metadata: metadata || {},
      severity: severity || 'info',
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      activity,
    });

  } catch (error: any) {
    console.error('Log activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log activity' },
      { status: 500 }
    );
  }
}
