import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { status } = await req.json();
    
    if (!['draft', 'published', 'active', 'judging', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: draft, published, active, judging, or completed' },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(params.id);
    
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Verify ownership (only organization that created it can update status)
    if (hackathon.organization.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this hackathon' },
        { status: 403 }
      );
    }

    // Validation: Cannot publish without required fields
    if (status === 'published') {
      const requiredFields = [
        'title',
        'tagline',
        'description',
        'theme',
        'startDate',
        'endDate',
        'registrationStart',
        'registrationEnd'
      ];

      const missingFields = requiredFields.filter(field => !(hackathon as any)[field]);

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            error: 'Cannot publish hackathon',
            message: `Missing required fields: ${missingFields.join(', ')}`,
            missingFields
          },
          { status: 400 }
        );
      }

      // Check dates are valid
      const now = new Date();
      if (new Date(hackathon.startDate) < now) {
        return NextResponse.json(
          { error: 'Cannot publish: Start date must be in the future' },
          { status: 400 }
        );
      }

      if (new Date(hackathon.registrationEnd) > new Date(hackathon.startDate)) {
        return NextResponse.json(
          { error: 'Cannot publish: Registration must end before hackathon starts' },
          { status: 400 }
        );
      }

      if (hackathon.prizes.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish: At least one prize must be defined' },
          { status: 400 }
        );
      }
    }

    // Update status
    hackathon.status = status;
    await hackathon.save();

    return NextResponse.json({
      success: true,
      message: `Hackathon status updated to: ${status}`,
      hackathon: {
        id: hackathon._id,
        title: hackathon.title,
        status: hackathon.status
      }
    });

  } catch (error: any) {
    console.error('Error updating hackathon status:', error);
    return NextResponse.json(
      { error: 'Failed to update hackathon status', details: error.message },
      { status: 500 }
    );
  }
}
