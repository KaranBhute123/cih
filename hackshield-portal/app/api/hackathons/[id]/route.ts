import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';
import Team from '@/lib/db/models/Team';

export const dynamic = 'force-dynamic';

// GET - Get hackathon details by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const hackathon = await Hackathon.findById(params.id)
      .populate('judges', 'name email avatar')
      .populate({
        path: 'registeredTeams',
        select: 'name members status',
        populate: {
          path: 'members.user',
          select: 'name avatar',
        },
      });

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Hackathon.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ hackathon });
  } catch (error: any) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hackathon' },
      { status: 500 }
    );
  }
}

// PUT - Update hackathon (Organization only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Check if user is the organization owner
    if (hackathon.organization.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to update this hackathon' },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Recalculate prize pool if prizes updated
    if (data.prizes) {
      data.totalPrizePool = data.prizes.reduce(
        (acc: number, prize: any) => acc + (prize.amount || 0),
        0
      );
    }

    const updatedHackathon = await Hackathon.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );

    return NextResponse.json({
      message: 'Hackathon updated successfully',
      hackathon: updatedHackathon,
    });
  } catch (error: any) {
    console.error('Error updating hackathon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update hackathon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete hackathon (Organization only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Check if user is the organization owner
    if (hackathon.organization.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this hackathon' },
        { status: 403 }
      );
    }

    // Only allow deletion of draft hackathons
    if (hackathon.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft hackathons can be deleted' },
        { status: 400 }
      );
    }

    await Hackathon.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Hackathon deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting hackathon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete hackathon' },
      { status: 500 }
    );
  }
}
