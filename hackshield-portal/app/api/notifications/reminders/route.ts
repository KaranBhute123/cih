import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/db/connect';
import Notification from '@/models/Notification';
import Hackathon from '@/lib/db/models/Hackathon';
import Team from '@/models/Team';

// Helper function to send reminder notifications
async function sendHackathonReminder(
  hackathon: any,
  reminderType: 'starting_soon' | 'deadline_approaching' | 'ending_soon',
  hoursUntil: number
) {
  // Get all teams registered for this hackathon
  const teams: any[] = await Team.find({
    $or: [
      { hackathonId: hackathon._id.toString() },
      { hackathon: hackathon._id }
    ]
  }).lean();

  const participantIds = new Set<string>();
  
  for (const team of teams) {
    const leaderId = team.leaderId || team.leader;
    if (leaderId) participantIds.add(leaderId.toString());
    
    if (team.members && Array.isArray(team.members)) {
      for (const member of team.members) {
        const memberId = member.userId || member.user;
        if (memberId) participantIds.add(memberId.toString());
      }
    }
  }

  if (participantIds.size === 0) {
    console.log(`⚠️ No participants for hackathon: ${hackathon.title}`);
    return 0;
  }

  // Create title and message based on reminder type
  let title = '';
  let message = '';
  let priority = 'medium';

  switch (reminderType) {
    case 'starting_soon':
      title = `🚀 ${hackathon.title} starts in ${hoursUntil} hours!`;
      message = `Get ready! The hackathon "${hackathon.title}" begins in ${hoursUntil} hours. Make sure you have everything prepared and your team is ready to start coding!`;
      priority = 'high';
      break;
    case 'deadline_approaching':
      title = `⏰ ${hackathon.title} deadline in ${hoursUntil} hours`;
      message = `Reminder: The submission deadline for "${hackathon.title}" is in ${hoursUntil} hours. Make sure to submit your project before time runs out!`;
      priority = 'high';
      break;
    case 'ending_soon':
      title = `⚠️ ${hackathon.title} ends in ${hoursUntil} hours!`;
      message = `Final reminder: "${hackathon.title}" ends in ${hoursUntil} hours. Submit your project now if you haven't already!`;
      priority = 'critical';
      break;
  }

  // Create notifications
  let notificationCount = 0;
  for (const userId of Array.from(participantIds)) {
    await Notification.create({
      recipient: userId,
      type: 'hackathon',
      priority,
      title,
      message,
      link: `/dashboard/hackathons/${hackathon._id}`,
      read: false,
      emailSent: true,
      smsSent: false,
      data: {
        hackathonId: hackathon._id.toString(),
        hackathonTitle: hackathon.title,
        reminderType,
        hoursUntil,
        system: true
      }
    });
    notificationCount++;
  }

  console.log(`✅ Sent ${reminderType} reminder to ${notificationCount} participants for: ${hackathon.title}`);
  return notificationCount;
}

// POST - Trigger automatic reminders (can be called by cron job or manually)
export async function POST(request: NextRequest) {
  try {
    // Allow system calls with API key (for cron jobs)
    const body = await request.json();
    const { apiKey } = body || {};
    
    // Simple API key check for automated calls
    if (apiKey !== process.env.SYSTEM_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const reminders = [];

    // Find hackathons that need reminders
    const hackathons = await Hackathon.find({
      status: { $in: ['published', 'active'] }
    });

    for (const hackathon of hackathons) {
      const startDate = new Date(hackathon.startDate);
      const endDate = new Date(hackathon.endDate);
      
      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const hoursUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Starting in 24 hours
      if (hoursUntilStart > 23 && hoursUntilStart <= 25) {
        const count = await sendHackathonReminder(hackathon, 'starting_soon', 24);
        reminders.push({ hackathon: hackathon.title, type: 'starting_soon', count });
      }
      
      // Starting in 1 hour
      else if (hoursUntilStart > 0.5 && hoursUntilStart <= 1.5) {
        const count = await sendHackathonReminder(hackathon, 'starting_soon', 1);
        reminders.push({ hackathon: hackathon.title, type: 'starting_in_1h', count });
      }

      // Ending in 24 hours
      if (hoursUntilEnd > 23 && hoursUntilEnd <= 25) {
        const count = await sendHackathonReminder(hackathon, 'deadline_approaching', 24);
        reminders.push({ hackathon: hackathon.title, type: 'ending_in_24h', count });
      }

      // Ending in 6 hours
      else if (hoursUntilEnd > 5.5 && hoursUntilEnd <= 6.5) {
        const count = await sendHackathonReminder(hackathon, 'ending_soon', 6);
        reminders.push({ hackathon: hackathon.title, type: 'ending_in_6h', count });
      }

      // Ending in 1 hour
      else if (hoursUntilEnd > 0.5 && hoursUntilEnd <= 1.5) {
        const count = await sendHackathonReminder(hackathon, 'ending_soon', 1);
        reminders.push({ hackathon: hackathon.title, type: 'ending_in_1h', count });
      }
    }

    console.log(`📢 Auto-reminders sent: ${reminders.length} batches`);

    return NextResponse.json({
      success: true,
      message: `Sent ${reminders.length} reminder batch(es)`,
      reminders
    });

  } catch (error) {
    console.error('Send reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

// GET - Check upcoming hackathons that will need reminders
export async function GET(request: NextRequest) {
  try {
    // Simple endpoint to check upcoming hackathons

    await connectDB();

    const now = new Date();
    const upcoming = [];

    const hackathons = await Hackathon.find({
      status: { $in: ['published', 'active'] }
    });

    for (const hackathon of hackathons) {
      const startDate = new Date(hackathon.startDate);
      const endDate = new Date(hackathon.endDate);
      
      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const hoursUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilStart > 0) {
        upcoming.push({
          hackathon: hackathon.title,
          id: hackathon._id,
          hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
          willSendReminder: hoursUntilStart <= 25 || hoursUntilStart <= 1.5
        });
      } else if (hoursUntilEnd > 0) {
        upcoming.push({
          hackathon: hackathon.title,
          id: hackathon._id,
          hoursUntilEnd: Math.round(hoursUntilEnd * 10) / 10,
          willSendReminder: hoursUntilEnd <= 25 || hoursUntilEnd <= 6.5 || hoursUntilEnd <= 1.5
        });
      }
    }

    return NextResponse.json({
      success: true,
      upcoming
    });

  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to get upcoming reminders' },
      { status: 500 }
    );
  }
}
