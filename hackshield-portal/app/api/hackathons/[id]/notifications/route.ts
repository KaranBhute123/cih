import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Notification from '@/models/Notification';
import Hackathon from '@/lib/db/models/Hackathon';
import Team from '@/models/Team';

// POST - Send notification to hackathon participants
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only organizations can send notifications
    if (session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Only organizations can send notifications' },
        { status: 403 }
      );
    }

    const { title, message, priority, recipients, channels } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get hackathon
    const hackathon = await Hackathon.findById(params.id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Verify organization owns this hackathon
    const ownerId = hackathon.organization || (hackathon as any).createdBy;
    if (ownerId && ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only send notifications for your own hackathons' },
        { status: 403 }
      );
    }

    // Get all teams registered for this hackathon
    const teams: any[] = await Team.find({
      $or: [
        { hackathonId: params.id },
        { hackathon: params.id }
      ]
    }).lean();

    // Collect all participant user IDs
    const participantIds = new Set<string>();
    
    for (const team of teams) {
      // Add team leader
      const leaderId = team.leaderId || team.leader;
      if (leaderId) {
        participantIds.add(leaderId.toString());
      }
      
      // Add all team members
      if (team.members && Array.isArray(team.members)) {
        for (const member of team.members) {
          const memberId = member.userId || member.user;
          if (memberId) {
            participantIds.add(memberId.toString());
          }
        }
      }
    }

    if (participantIds.size === 0) {
      return NextResponse.json(
        { error: 'No participants found for this hackathon' },
        { status: 404 }
      );
    }

    console.log(`📢 Sending notification to ${participantIds.size} participants`);

    // Create notifications for all participants
    const notifications = [];
    const notificationChannels = channels || ['in_app', 'email'];
    const notificationPriority = priority || 'medium';

    for (const userId of Array.from(participantIds)) {
      // Filter by recipient type if specified
      if (recipients && recipients !== 'all') {
        // You can add logic here to filter by team leaders only, etc.
        // For now, we send to all
      }

      const notification = await Notification.create({
        recipient: userId,
        type: 'hackathon',
        priority: notificationPriority,
        title,
        message,
        read: false,
        emailSent: notificationChannels.includes('email'),
        smsSent: notificationChannels.includes('sms'),
        data: {
          hackathonId: hackathon._id.toString(),
          hackathonTitle: hackathon.title,
          senderId: session.user.id,
          senderName: session.user.name,
          channels: notificationChannels,
          recipients: recipients
        }
      });

      notifications.push(notification);

      // Log email notification (in production, send actual emails)
      if (notificationChannels.includes('email')) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📧 EMAIL NOTIFICATION`);
        console.log(`${'='.repeat(60)}`);
        console.log(`To: User ${userId}`);
        console.log(`From: ${session.user.name} (${hackathon.title})`);
        console.log(`Subject: ${title}`);
        console.log(`Priority: ${notificationPriority.toUpperCase()}`);
        console.log(`\n${message}`);
        console.log(`${'='.repeat(60)}\n`);
      }
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${notifications.length} participant(s)`,
      notificationCount: notifications.length,
      participants: participantIds.size
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET - Get notifications for a hackathon (for organization to see what they sent)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get hackathon
    const hackathon = await Hackathon.findById(params.id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Get notifications sent for this hackathon
    const notifications = await Notification.find({
      'metadata.hackathon.id': params.id,
      'metadata.sender.userId': session.user.id
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}
