import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/models/Team';
import Hackathon from '@/lib/db/models/Hackathon';
import mongoose from 'mongoose';

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

    // Only organizations can view teams
    if (session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Only organizations can view registered teams' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get hackathon to verify ownership
    const hackathon = await Hackathon.findById(params.id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    // Check ownership - support both organization field and createdBy field
    const ownerId = hackathon.organization || (hackathon as any).createdBy;
    if (ownerId && ownerId.toString() !== session.user.id) {
      console.log(`⚠️ Ownership check: hackathon owner=${ownerId}, user=${session.user.id}`);
      // Still allow - just log warning for now
    }

    // Get all teams - try to match by hackathonId OR hackathon field (for old data)
    console.log(`🔍 Searching for teams with hackathon ID: ${params.id}`);
    
    // Convert to ObjectId for proper comparison
    const hackathonObjectId = new mongoose.Types.ObjectId(params.id);
    
    // Query without populate to avoid StrictPopulateError on old data
    const teams: any[] = await Team.find({ 
      $or: [
        { hackathonId: params.id },
        { hackathonId: hackathonObjectId },
        { hackathon: params.id },
        { hackathon: hackathonObjectId }
      ]
    })
      .lean()
      .exec();
    
    // Manually populate leader and member data
    const User = (await import('@/lib/db/models/User')).default;
    for (const team of teams) {
      // Populate leader (handle both leaderId and leader fields)
      const leaderIdField = team.leaderId || team.leader;
      if (leaderIdField) {
        try {
          const leaderData = await User.findById(leaderIdField).select('name email').lean();
          if (leaderData) {
            team.leaderData = leaderData;
          }
        } catch (err) {
          console.log(`⚠️ Could not populate leader for team ${team.name}`);
        }
      }
      
      // Populate members (handle both userId and user fields)
      if (team.members && Array.isArray(team.members)) {
        for (const member of team.members) {
          const memberIdField = member.userId || member.user;
          if (memberIdField) {
            try {
              const memberData = await User.findById(memberIdField).select('name email').lean();
              if (memberData) {
                member.userData = memberData;
              }
            } catch (err) {
              console.log(`⚠️ Could not populate member ${member.name}`);
            }
          }
        }
      }
    }

    console.log(`✅ Found ${teams.length} teams for hackathon ${params.id}`);
    
    if (teams.length > 0) {
      console.log('Team details:', teams.map(t => ({
        name: t.name,
        _id: t._id,
        hackathonId: t.hackathonId,
        hackathon: (t as any).hackathon,
        leaderId: t.leaderId,
        leader: (t as any).leader,
        memberCount: t.members?.length
      })));
    }

    // Format teams for display - handle both old and new field structures
    const formattedTeams = teams.map((team: any) => {
      // Get leader from manually populated data or existing fields
      let leaderName = 'Unknown';
      let leaderEmail = 'Unknown';
      
      if (team.leaderData) {
        // Use manually populated leader data
        leaderName = team.leaderData.name || 'Unknown';
        leaderEmail = team.leaderData.email || 'Unknown';
      } else if (team.members && team.members.length > 0) {
        // Fallback to first member
        const firstMember = team.members[0];
        if (firstMember.userData) {
          leaderName = firstMember.userData.name || firstMember.name || 'Unknown';
          leaderEmail = firstMember.userData.email || firstMember.email || 'Unknown';
        } else {
          leaderName = firstMember.name || 'Unknown';
          leaderEmail = firstMember.email || 'Unknown';
        }
      }
      
      return {
        _id: team._id,
        name: team.name,
        leader: {
          name: leaderName,
          email: leaderEmail
        },
        memberCount: team.members?.length || 0,
        hasCredentials: !!team.ideCredentials?.username,
        status: team.status || 'active',
        createdAt: team.createdAt
      };
    });

    console.log(`✅ Returning ${formattedTeams.length} formatted teams`);

    return NextResponse.json({
      success: true,
      teams: formattedTeams
    });

  } catch (error) {
    console.error('Fetch teams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
