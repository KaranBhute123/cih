import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Branch Schema for Git-like collaboration
const branchSchema = new mongoose.Schema({
  hackathonId: { type: String, required: true },
  accessId: { type: String, required: true },
  branchName: { type: String, required: true },
  branchType: { type: String, enum: ['main', 'feature'], default: 'feature' },
  createdBy: { type: String, required: true },
  assignedTo: { type: String },
  assignedToEmail: { type: String },
  branchAccessId: { type: String },
  branchAccessPassword: { type: String },
  files: [{
    id: String,
    name: String,
    path: String,
    extension: String,
    language: String,
    content: String,
    lastModified: Date,
    modifiedBy: String,
  }],
  commits: [{
    id: String,
    message: String,
    author: String,
    timestamp: Date,
    filesChanged: [String],
  }],
  pullRequests: [{
    id: String,
    title: String,
    description: String,
    author: String,
    status: { type: String, enum: ['open', 'approved', 'rejected', 'merged'], default: 'open' },
    createdAt: Date,
    mergedAt: Date,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);

// GET - List all branches for a team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessId = searchParams.get('accessId');

    if (!accessId) {
      return NextResponse.json({ error: 'Access ID required' }, { status: 400 });
    }

    await connectDB();

    const branches = await Branch.find({
      hackathonId: params.id,
      accessId,
    }).sort({ createdAt: 1 });

    return NextResponse.json({ branches });
  } catch (error: any) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

// POST - Create a new branch
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, branchName, assignedTo, assignedToEmail, createdBy } = await request.json();

    if (!accessId || !branchName || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if main branch exists
    const mainBranch = await Branch.findOne({
      hackathonId: params.id,
      accessId,
      branchType: 'main',
    });

    if (!mainBranch && branchName !== 'main') {
      // Create main branch first
      const newMainBranch = new Branch({
        hackathonId: params.id,
        accessId,
        branchName: 'main',
        branchType: 'main',
        createdBy,
        files: [],
        commits: [],
        pullRequests: [],
      });
      await newMainBranch.save();
    }

    // Check if branch already exists
    const existingBranch = await Branch.findOne({
      hackathonId: params.id,
      accessId,
      branchName,
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: 'Branch already exists' },
        { status: 400 }
      );
    }

    // Generate branch credentials for feature branches
    let branchAccessId, branchAccessPassword;
    if (branchName !== 'main') {
      const crypto = require('crypto');
      branchAccessId = `${accessId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      branchAccessPassword = crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    // Create new branch
    const newBranch = new Branch({
      hackathonId: params.id,
      accessId,
      branchName,
      branchType: branchName === 'main' ? 'main' : 'feature',
      createdBy,
      assignedTo: assignedTo || null,
      assignedToEmail: assignedToEmail || null,
      branchAccessId,
      branchAccessPassword,
      files: mainBranch ? [...mainBranch.files] : [], // Copy files from main
      commits: [],
      pullRequests: [],
    });

    await newBranch.save();

    return NextResponse.json({
      success: true,
      branch: newBranch,
      credentials: branchName !== 'main' ? {
        branchAccessId,
        branchAccessPassword,
      } : null,
    });
  } catch (error: any) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create branch' },
      { status: 500 }
    );
  }
}

// PUT - Update branch (commit, merge, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, branchName, action, data } = await request.json();

    if (!accessId || !branchName || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const branch = await Branch.findOne({
      hackathonId: params.id,
      accessId,
      branchName,
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    switch (action) {
      case 'commit':
        // Add commit
        branch.commits.push({
          id: Date.now().toString(),
          message: data.message,
          author: data.author,
          timestamp: new Date(),
          filesChanged: data.filesChanged || [],
        });
        branch.updatedAt = new Date();
        break;

      case 'update_files':
        // Update branch files
        branch.files = data.files;
        branch.updatedAt = new Date();
        break;

      case 'create_pr':
        // Create pull request
        branch.pullRequests.push({
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          author: data.author,
          status: 'open',
          createdAt: new Date(),
        });
        break;

      case 'merge':
        // Merge branch to main
        const mainBranch = await Branch.findOne({
          hackathonId: params.id,
          accessId,
          branchType: 'main',
        });

        if (!mainBranch) {
          return NextResponse.json({ error: 'Main branch not found' }, { status: 404 });
        }

        // Merge files from feature branch to main
        mainBranch.files = [...mainBranch.files, ...branch.files];
        mainBranch.commits.push({
          id: Date.now().toString(),
          message: `Merged branch ${branchName}`,
          author: data.author,
          timestamp: new Date(),
          filesChanged: branch.files.map((f: any) => f.name),
        });
        mainBranch.updatedAt = new Date();

        // Update PR status
        const pr = branch.pullRequests.find((p: any) => p.id === data.prId);
        if (pr) {
          pr.status = 'merged';
          pr.mergedAt = new Date();
        }

        await mainBranch.save();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await branch.save();

    return NextResponse.json({
      success: true,
      branch,
    });
  } catch (error: any) {
    console.error('Update branch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update branch' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a branch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessId = searchParams.get('accessId');
    const branchName = searchParams.get('branchName');

    if (!accessId || !branchName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (branchName === 'main') {
      return NextResponse.json(
        { error: 'Cannot delete main branch' },
        { status: 400 }
      );
    }

    await connectDB();

    await Branch.deleteOne({
      hackathonId: params.id,
      accessId,
      branchName,
    });

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete branch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete branch' },
      { status: 500 }
    );
  }
}
