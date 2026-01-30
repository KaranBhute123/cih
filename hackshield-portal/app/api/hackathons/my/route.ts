import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

export const dynamic = 'force-dynamic';

// GET - List hackathons created by the current organization
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const hackathons = await Hackathon.find({ organization: session.user.id })
      .sort({ createdAt: -1 })
      .select('-rules -codeOfConduct -longDescription');

    return NextResponse.json({ hackathons });
  } catch (error: any) {
    console.error('Error fetching my hackathons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}
