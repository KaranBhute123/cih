import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Team Files Schema
const teamFileSchema = new mongoose.Schema({
  hackathonId: { type: String, required: true },
  teamName: { type: String, required: true },
  accessId: { type: String, required: true },
  files: [{
    id: String,
    name: String,
    language: String,
    content: String,
    author: String,
    authorEmail: String,
    createdAt: Date,
    modifiedAt: Date,
  }],
  lastSync: { type: Date, default: Date.now },
});

const TeamFiles = mongoose.models.TeamFiles || mongoose.model('TeamFiles', teamFileSchema);

// GET - Load team files
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessId = searchParams.get('accessId');

    if (!accessId) {
      return NextResponse.json(
        { error: 'Access ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    const teamFiles = await TeamFiles.findOne({
      hackathonId: params.id,
      accessId,
    });

    return NextResponse.json({
      files: teamFiles?.files || [],
      lastSync: teamFiles?.lastSync,
    });

  } catch (error) {
    console.error('Load team files error:', error);
    return NextResponse.json(
      { error: 'Failed to load files' },
      { status: 500 }
    );
  }
}

// POST - Save file to team storage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, file } = await request.json();

    if (!accessId || !file) {
      return NextResponse.json(
        { error: 'Access ID and file data required' },
        { status: 400 }
      );
    }

    // Validate file object
    if (!file.id || !file.name || !file.language) {
      return NextResponse.json(
        { error: 'File must have id, name, and language' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const fileSize = new Blob([file.content || '']).size;
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Sanitize file name
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (sanitizedFileName !== file.name) {
      file.name = sanitizedFileName;
    }

    await connectDB();

    let teamFiles = await TeamFiles.findOne({
      hackathonId: params.id,
      accessId,
    });

    if (!teamFiles) {
      teamFiles = new TeamFiles({
        hackathonId: params.id,
        accessId,
        teamName: file.teamName || 'Team',
        files: [],
      });
    }

    // Check if file exists
    const existingFileIndex = teamFiles.files.findIndex((f: any) => f.id === file.id);

    if (existingFileIndex >= 0) {
      // Update existing file
      teamFiles.files[existingFileIndex] = {
        ...file,
        modifiedAt: new Date(),
      };
    } else {
      // Add new file
      teamFiles.files.push({
        ...file,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    }

    teamFiles.lastSync = new Date();
    await teamFiles.save();

    return NextResponse.json({
      success: true,
      files: teamFiles.files,
    });

  } catch (error) {
    console.error('Save file error:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}
