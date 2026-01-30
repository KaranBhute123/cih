import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';
import nodemailer from 'nodemailer';

// Send IDE credentials to qualified team via email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participantId, teamMemberEmails } = await request.json();

    await connectDB();

    const hackathon = await Hackathon.findById(params.id);
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Find the participant
    const participant = hackathon.participants.find(
      (p: any) => p._id.toString() === participantId
    );

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check if credentials already exist
    if (!participant.ideAccessId || !participant.ideAccessPassword) {
      return NextResponse.json({ error: 'Credentials not generated yet' }, { status: 400 });
    }

    // Send email to team leader
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const teamLeaderEmail = participant.email;
    const credentials = {
      accessId: participant.ideAccessId,
      password: participant.ideAccessPassword,
    };

    // Email to team leader
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@hackshield.com',
      to: teamLeaderEmail,
      subject: `🎉 Congratulations! IDE Credentials for ${hackathon.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #0a0e1a; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1f2e; border-radius: 12px; padding: 30px; border: 2px solid #3b82f6; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #3b82f6; margin: 0; }
            .credentials { background: #0a0e1a; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credential-item { margin: 15px 0; }
            .credential-label { color: #94a3b8; font-size: 14px; }
            .credential-value { color: #3b82f6; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
            .warning { background: #991b1b; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .info { background: #1e3a8a; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
            ul { text-align: left; color: #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 HackShield IDE Access</h1>
              <p style="color: #94a3b8;">Congratulations on qualifying for ${hackathon.title}!</p>
            </div>

            <p>Hello Team Leader,</p>
            <p>Your team has been qualified for the hackathon. Here are your IDE credentials:</p>

            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">Access ID</div>
                <div class="credential-value">${credentials.accessId}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Password</div>
                <div class="credential-value">${credentials.password}</div>
              </div>
            </div>

            <div class="info">
              <h3 style="margin-top: 0;">📋 Team Leader Responsibilities</h3>
              <ul>
                <li>You are the <strong>Main Branch Owner</strong></li>
                <li>Create child branches for your teammates</li>
                <li>Review and approve code pushes from team members</li>
                <li>Manage project structure and deployment</li>
              </ul>
            </div>

            <div class="warning">
              <h3 style="margin-top: 0;">⚠️ Important Rules</h3>
              <ul>
                <li><strong>Timer starts when you login</strong> - Be ready before entering</li>
                <li><strong>Lockdown Mode</strong> - Cannot leave IDE during hackathon</li>
                <li><strong>3 Strike Rule</strong> - 15 seconds warning, 3 strikes = disqualification</li>
                <li><strong>No External Tools</strong> - Everything must be done in the IDE</li>
              </ul>
            </div>

            <div class="info">
              <h3 style="margin-top: 0;">🛠️ IDE Features</h3>
              <ul>
                <li>Multi-language support (Python, JavaScript, TypeScript, Java, C++, HTML, CSS, JSON)</li>
                <li>Create files with any extension</li>
                <li>Local hosting and live preview</li>
                <li>Code execution and terminal access</li>
                <li>AI coding assistant</li>
                <li>Team collaboration with branch management</li>
                <li>One-click deployment</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/hackathons/${params.id}/ide" 
                 style="display: inline-block; background: linear-gradient(to right, #3b82f6, #8b5cf6); 
                        color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                        font-weight: bold;">
                Access IDE Now
              </a>
            </p>

            <div class="footer">
              <p>Good luck with your hackathon! 🎯</p>
              <p>HackShield Platform | ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification emails to other team members
    if (teamMemberEmails && teamMemberEmails.length > 0) {
      for (const memberEmail of teamMemberEmails) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@hackshield.com',
          to: memberEmail,
          subject: `✅ Team Qualified for ${hackathon.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background: #0a0e1a; color: #fff; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #1a1f2e; border-radius: 12px; padding: 30px; border: 2px solid #10b981; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #10b981; margin: 0; }
                .info { background: #1e3a8a; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
                ul { text-align: left; color: #cbd5e1; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Your Team Qualified!</h1>
                  <p style="color: #94a3b8;">${hackathon.title}</p>
                </div>

                <p>Hello Team Member,</p>
                <p>Great news! Your team has qualified for the hackathon.</p>

                <div class="info">
                  <h3 style="margin-top: 0;">📋 What's Next?</h3>
                  <ul>
                    <li>Your team leader has received the IDE credentials</li>
                    <li>Team leader will create a branch for you</li>
                    <li>You'll receive your branch access credentials shortly</li>
                    <li>Work on your assigned branch and push code to main</li>
                  </ul>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard/hackathons/${params.id}" 
                     style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6); 
                            color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                            font-weight: bold;">
                    View Hackathon Details
                  </a>
                </p>

                <div class="footer">
                  <p>Good luck! 🚀</p>
                  <p>HackShield Platform | ${new Date().getFullYear()}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials sent successfully',
    });
  } catch (error: any) {
    console.error('Send credentials error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send credentials' },
      { status: 500 }
    );
  }
}
