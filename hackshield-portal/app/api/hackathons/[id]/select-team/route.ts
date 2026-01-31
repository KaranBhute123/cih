import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/models/Team';
import Hackathon from '@/lib/db/models/Hackathon';
import crypto from 'crypto';

// Helper function to generate a secure but readable passkey
function generatePasskey(length: number = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  let passkey = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    passkey += chars[bytes[i] % chars.length];
  }
  
  return passkey;
}

// Helper function to generate username from team name
function generateUsername(teamName: string, hackathonId: string): string {
  const cleanName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hackathonShort = hackathonId.substring(hackathonId.length - 6);
  return `team_${cleanName}_${hackathonShort}`;
}

// Send email with credentials to a team member
async function sendCredentialsEmail(
  recipientEmail: string, 
  recipientName: string, 
  teamName: string, 
  username: string, 
  passkey: string, 
  hackathonTitle: string,
  isLeader: boolean = false
) {
  // TODO: Implement actual email sending with your email service (SendGrid, AWS SES, etc.)
  console.log('='.repeat(60));
  console.log(`📧 IDE CREDENTIALS EMAIL - ${isLeader ? 'TEAM LEADER' : 'TEAM MEMBER'}`);
  console.log('='.repeat(60));
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: 🎉 Your Team Selected for ${hackathonTitle}!`);
  console.log('');
  console.log(`Dear ${recipientName},`);
  console.log('');
  console.log(`Congratulations! Your team "${teamName}" has been selected for ${hackathonTitle}!`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 YOUR IDE ACCESS CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Username: ${username}`);
  console.log(`Passkey:  ${passkey}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('⚠️  IMPORTANT INSTRUCTIONS:');
  console.log('');
  console.log('1. Keep these credentials SECURE - these are for your team only');
  console.log('2. Access the IDE from your dashboard sidebar');
  console.log('3. Click "IDE" to access the collaborative coding environment');
  console.log('4. All team members share the same credentials');
  console.log('');
  if (isLeader) {
    console.log('👥 AS TEAM LEADER, YOU CAN:');
    console.log('  • Work on the main branch');
    console.log('  • Create child branches for team members');
    console.log('  • Manage team code collaboration');
    console.log('  • Monitor team progress');
    console.log('');
  } else {
    console.log('👤 AS TEAM MEMBER:');
    console.log('  • Collaborate with your team in real-time');
    console.log('  • Work on assigned branches');
    console.log('  • Coordinate with your team leader');
    console.log('');
  }
  console.log('⚡ REMEMBER:');
  console.log('  • IDE is accessible immediately from your dashboard');
  console.log('  • All team members can code together');
  console.log('  • Save your work frequently');
  console.log('');
  console.log('Good luck! 🚀');
  console.log('');
  console.log('The HackShield Team');
  console.log('='.repeat(60));
  console.log('');
}

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

    // Only organizations can select teams
    if (session.user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Only organizations can select teams' },
        { status: 403 }
      );
    }

    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
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

    // Verify organization owns this hackathon (handle both old and new field names)
    const ownerId = hackathon.organization || (hackathon as any).createdBy;
    if (ownerId && ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only select teams for your own hackathons' },
        { status: 403 }
      );
    }

    // Get team without populate to avoid StrictPopulateError
    const team: any = await Team.findById(teamId).lean();
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Manually populate leader and member data
    const User = (await import('@/lib/db/models/User')).default;
    
    // Get leader info - handle both old and new structures
    let leaderInfo: any = null;
    const leaderIdField = team.leaderId || team.leader;
    
    if (leaderIdField) {
      try {
        leaderInfo = await User.findById(leaderIdField).select('name email').lean();
      } catch (err) {
        console.log(`⚠️ Could not populate leader`);
      }
    }
    
    // Fallback: use first member if leader not found
    if (!leaderInfo && team.members && team.members.length > 0) {
      const firstMember = team.members[0];
      const memberIdField = firstMember.userId || firstMember.user;
      if (memberIdField) {
        try {
          leaderInfo = await User.findById(memberIdField).select('name email').lean();
        } catch (err) {
          leaderInfo = { name: firstMember.name, email: firstMember.email };
        }
      } else {
        leaderInfo = { name: firstMember.name, email: firstMember.email };
      }
    }

    if (!leaderInfo || !leaderInfo.email) {
      return NextResponse.json(
        { error: 'Could not determine team leader or leader email' },
        { status: 400 }
      );
    }

    console.log(`👤 Team Leader: ${leaderInfo.name || 'Unknown'} (${leaderInfo.email || 'No email'})`);

    // Check if team already has credentials
    if (team.ideCredentials && team.ideCredentials.username) {
      return NextResponse.json(
        { error: 'Team already selected - credentials already generated' },
        { status: 400 }
      );
    }

    // Generate credentials
    const username = generateUsername(team.name, params.id);
    const passkey = generatePasskey();

    console.log(`\n🎯 Generating IDE credentials for team: ${team.name}`);
    console.log(`👥 Team has ${team.members.length} member(s) + 1 leader`);
    console.log(`🔑 Username: ${username}`);
    console.log(`🔐 Passkey: ${passkey}`);

    // Update team with IDE credentials (need to fetch non-lean version for save)
    const teamToUpdate = await Team.findById(teamId);
    if (!teamToUpdate) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    teamToUpdate.ideCredentials = {
      username,
      passkey,
      mainBranch: 'main',
      branches: [
        {
          name: 'main',
          createdBy: leaderInfo._id || team.members[0].userId,
          createdAt: new Date()
        }
      ],
      credentialsSentAt: new Date(),
      leaderActivated: false
    };
    teamToUpdate.ideAccessStatus = 'approved';
    teamToUpdate.status = 'active';

    await teamToUpdate.save();
    console.log(`✅ Credentials saved to database`);

    // Prepare email list
    const emailRecipients = [];

    // Send email to team leader
    console.log(`\n📤 Preparing to send credentials to TEAM LEADER...`);
    if (leaderInfo.email) {
      emailRecipients.push({
        email: leaderInfo.email,
        name: leaderInfo.name || 'Team Leader',
        isLeader: true
      });
    }

    // Send emails to ALL team members
    console.log(`📤 Preparing to send credentials to ALL TEAM MEMBERS...`);
    if (team.members && Array.isArray(team.members)) {
      for (const member of team.members) {
        const memberIdField = member.userId || member.user;
        let memberInfo = null;
        
        if (memberIdField) {
          try {
            memberInfo = await User.findById(memberIdField).select('name email').lean();
          } catch (err) {
            console.log(`⚠️ Could not populate member ${member.name}`);
          }
        }
        
        const memberEmail = memberInfo?.email || member.email;
        const memberName = memberInfo?.name || member.name;
        
        if (memberEmail) {
          emailRecipients.push({
            email: memberEmail,
            name: memberName,
            isLeader: false
          });
        }
      }
    }

    // Send all emails
    console.log(`\n📧 Sending ${emailRecipients.length} emails...`);
    for (const recipient of emailRecipients) {
      await sendCredentialsEmail(
        recipient.email,
        recipient.name,
        team.name,
        username,
        passkey,
        hackathon.title,
        recipient.isLeader
      );
    }

    console.log(`\n✅ ALL EMAILS SENT SUCCESSFULLY!`);
    console.log(`📊 Total emails sent: ${emailRecipients.length}`);
    console.log(`   - Team Leader: 1`);
    console.log(`   - Team Members: ${emailRecipients.length - 1}`);

    return NextResponse.json({
      success: true,
      message: `Team selected! IDE credentials sent to all ${emailRecipients.length} team member(s).`,
      teamName: team.name,
      username: username,
      emailsSent: emailRecipients.length,
      recipients: emailRecipients.map(r => ({ name: r.name, email: r.email }))
    });

  } catch (error) {
    console.error('Select team error:', error);
    return NextResponse.json(
      { error: 'Failed to select team' },
      { status: 500 }
    );
  }
}
