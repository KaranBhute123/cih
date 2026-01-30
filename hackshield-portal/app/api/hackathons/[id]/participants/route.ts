import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lookingForTeam = searchParams.get('lookingForTeam') === 'true';

    // Find users who are looking for a team for this hackathon
    const query: any = {
      role: 'participant',
    };

    if (lookingForTeam) {
      query.lookingForTeam = true;
      query.lookingForHackathon = params.id;
    }

    const participants = await User.find(query)
      .select('name avatar skills experience bio github linkedin portfolio')
      .limit(50);

    return NextResponse.json({ participants });
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
