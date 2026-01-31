import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Team from '@/models/Team';
import crypto from 'crypto';

// Helper function to generate a secure passkey
function generatePasskey(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

// Helper function to generate username from team name
function generateUsername(teamName: string, hackathonId: string): string {
  const cleanName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hackathonShort = hackathonId.substring(0, 6);
  return `${cleanName}_${hackathonShort}`;
}

// Send email with credentials (mock function - implement with your email service)
async function sendCredentialsEmail(leaderEmail: string, leaderName: string, teamName: string, username: string, passkey: string, hackathonTitle: string) {
  // TODO: Implement actual email sending with your email service (SendGrid, AWS SES, etc.)
  console.log('=== IDE Credentials Email ===');
  console.log(`To: ${leaderEmail}`);
  console.log(`Subject: Your Team IDE Access Credentials for ${hackathonTitle}`);
  console.log(`
Dear ${leaderName},

Congratulations! Your team "${teamName}" has been successfully registered for ${hackathonTitle}.

Your IDE Access Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: ${username}
Passkey:  ${passkey}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Keep these credentials secure and share them only with your team members.

As the team leader, you can:
1. Enter the IDE using these credentials when the hackathon starts
2. Create individual branches for each team member
3. Manage code collaboration within your team
4. All team members will work in the same IDE environment

The IDE will be available once the hackathon officially begins.

Best of luck with your project!

The HackShield Team
  `);
  console.log('=========================');
  
  // In production, send actual email here
  // Example with nodemailer or SendGrid
  return true;
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

    await connectDB();

    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Find the team
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is the team leader
    if (team.leaderId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leader can request credentials' },
        { status: 403 }
      );
    }

    // Check if credentials already exist
    if (team.ideCredentials?.username && team.ideCredentials?.passkey) {
      return NextResponse.json(
        {
          message: 'Credentials already generated',
          credentials: {
            username: team.ideCredentials.username,
            alreadySent: true
          }
        },
        { status: 200 }
      );
    }

    // Generate credentials
    const username = generateUsername(team.name, params.id);
    const passkey = generatePasskey();

    // Update team with credentials
    team.ideCredentials = {
      username,
      passkey,
      mainBranch: 'main',
      branches: [],
      credentialsSentAt: new Date(),
      leaderActivated: false,
      activatedAt: null
    };

    await team.save();

    // Get leader info and hackathon details
    const leaderEmail = session.user.email || '';
    const leaderName = session.user.name || 'Team Leader';
    
    // Send email (you need to implement actual email sending)
    await sendCredentialsEmail(
      leaderEmail,
      leaderName,
      team.name,
      username,
      passkey,
      'Hackathon' // You can fetch actual hackathon title if needed
    );

    return NextResponse.json({
      message: 'Credentials generated and email sent successfully',
      credentials: {
        username,
        emailSentTo: leaderEmail
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating credentials:', error);
    return NextResponse.json(
      { error: 'Failed to generate credentials' },
      { status: 500 }
    );
  }
}
