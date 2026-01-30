import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// Log a violation during hackathon
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { hackathonId, violationType, timestamp } = await req.json();
    
    if (!hackathonId || !violationType) {
      return NextResponse.json(
        { error: 'Missing required fields: hackathonId, violationType' },
        { status: 400 }
      );
    }

    // In a real implementation, you would save this to a Violation model
    // For now, we'll just log it
    console.log('🚨 VIOLATION DETECTED:', {
      userId: session.user.id,
      userName: session.user.name,
      email: session.user.email,
      hackathonId,
      violationType,
      timestamp: timestamp || new Date().toISOString()
    });

    // Here you would:
    // 1. Create a Violation document in MongoDB
    // 2. Update team/participant stats
    // 3. Send real-time notification to organizers
    // 4. Increment violation counter
    // 5. Check if disqualification threshold reached

    return NextResponse.json({
      success: true,
      message: 'Violation recorded',
      violationType,
      severity: getViolationSeverity(violationType)
    });

  } catch (error: any) {
    console.error('Error logging violation:', error);
    return NextResponse.json(
      { error: 'Failed to log violation', details: error.message },
      { status: 500 }
    );
  }
}

function getViolationSeverity(type: string): 'low' | 'medium' | 'high' {
  const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'focus_loss': 'low',
    'tab_switch': 'medium',
    'navigation': 'high',
    'back_button': 'high',
    'suspicious_activity': 'high'
  };
  
  return severityMap[type] || 'medium';
}
