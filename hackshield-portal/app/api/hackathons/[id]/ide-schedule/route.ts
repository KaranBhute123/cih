import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    // Find user's registration
    const participant = hackathon.participants?.find(
      (p: any) => p.userId === session.user.id
    );

    if (!participant) {
      return NextResponse.json({
        scheduleStatus: {
          isActive: false,
          isApproved: false,
          nextWindow: null,
          currentWindow: null,
          message: 'You are not registered for this hackathon'
        }
      });
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check if IDE access is approved
    if (!(participant as any).ideSchedule?.organizationApproved) {
      return NextResponse.json({
        scheduleStatus: {
          isActive: false,
          isApproved: false,
          nextWindow: null,
          currentWindow: null,
          message: 'IDE access is pending organizational approval. Please wait for admin approval.'
        }
      });
    }

    // Check if current time is within any access window
    let currentWindow = null;
    let isActive = false;

    if ((participant as any).ideSchedule?.accessWindows?.length > 0) {
      for (const window of (participant as any).ideSchedule.accessWindows) {
        if (window.day === currentDay) {
          const windowStart = window.startTime;
          const windowEnd = window.endTime;
          
          if (currentTime >= windowStart && currentTime <= windowEnd) {
            isActive = true;
            currentWindow = {
              start: new Date(),
              end: new Date()
            };
            // Set proper start/end times
            const [startHour, startMin] = windowStart.split(':');
            const [endHour, endMin] = windowEnd.split(':');
            currentWindow.start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
            currentWindow.end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
            break;
          }
        }
      }
    } else {
      // Fallback to general schedule if no specific windows
      const allowedDays = (participant as any).ideSchedule?.allowedDays || [];
      if (allowedDays.includes(currentDay)) {
        const startTime = (participant as any).ideSchedule?.startTime || '09:00';
        const endTime = (participant as any).ideSchedule?.endTime || '17:00';
        
        if (currentTime >= startTime && currentTime <= endTime) {
          isActive = true;
          currentWindow = {
            start: new Date(),
            end: new Date()
          };
          const [startHour, startMin] = startTime.split(':');
          const [endHour, endMin] = endTime.split(':');
          currentWindow.start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
          currentWindow.end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
        }
      }
    }

    // Find next window if not currently active
    let nextWindow = null;
    if (!isActive) {
      const windows = (participant as any).ideSchedule?.accessWindows || [];
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayIndex = days.indexOf(currentDay);
      
      // Look for next window in the coming days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDayIndex = (currentDayIndex + dayOffset) % 7;
        const checkDay = days[checkDayIndex];
        
        const dayWindows = windows.filter((w: any) => w.day === checkDay);
        
        for (const window of dayWindows) {
          const windowDateTime = new Date();
          windowDateTime.setDate(now.getDate() + dayOffset);
          const [hour, minute] = window.startTime.split(':');
          windowDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
          
          // If this window is in the future
          if (windowDateTime > now) {
            nextWindow = windowDateTime;
            break;
          }
        }
        
        if (nextWindow) break;
      }
    }

    const message = isActive 
      ? `IDE access is active until ${currentWindow?.end.toTimeString().slice(0, 5)}`
      : nextWindow 
        ? `Next IDE access window opens at ${nextWindow.toLocaleDateString()} ${nextWindow.toTimeString().slice(0, 5)}`
        : 'No upcoming IDE access windows scheduled';

    return NextResponse.json({
      scheduleStatus: {
        isActive,
        isApproved: (participant as any).ideSchedule?.organizationApproved || false,
        nextWindow,
        currentWindow,
        message
      }
    });

  } catch (error) {
    console.error('Error checking IDE schedule:', error);
    return NextResponse.json(
      { error: 'Failed to check IDE schedule' },
      { status: 500 }
    );
  }
}