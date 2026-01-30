import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';

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

    if (!hackathon.participants || hackathon.participants.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 404 });
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

    // For now, return success without sending email
    // Email functionality requires SMTP setup
    // Uncomment the code below after configuring SMTP in .env.local

    /* 
    // Import nodemailer at the top: import nodemailer from 'nodemailer';
    
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
      html: `... email template ...`
    });

    // Send notification emails to other team members
    if (teamMemberEmails && teamMemberEmails.length > 0) {
      for (const memberEmail of teamMemberEmails) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@hackshield.com',
          to: memberEmail,
          subject: `✅ Team Qualified for ${hackathon.title}`,
          html: `... email template ...`
        });
      }
    }
    */

    // Return credentials directly for now
    return NextResponse.json({
      success: true,
      message: 'Credentials retrieved successfully',
      credentials: {
        accessId: participant.ideAccessId,
        password: participant.ideAccessPassword,
        teamLeaderEmail: participant.email,
      },
      note: 'Email sending is disabled. Configure SMTP to enable email notifications.'
    });
  } catch (error: any) {
    console.error('Send credentials error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send credentials' },
      { status: 500 }
    );
  }
}
