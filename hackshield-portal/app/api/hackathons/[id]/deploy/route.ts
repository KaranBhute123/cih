import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Deploy project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, files, projectName, deploymentType } = await request.json();

    if (!accessId || !files || !projectName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create deployment directory
    const deployDir = join(process.cwd(), 'public', 'deployments', accessId);
    if (!existsSync(deployDir)) {
      await mkdir(deployDir, { recursive: true });
    }

    // Write all files to deployment directory
    for (const file of files) {
      const filePath = join(deployDir, file.name);
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/') || filePath.lastIndexOf('\\'));
      
      if (!existsSync(fileDir)) {
        await mkdir(fileDir, { recursive: true });
      }

      await writeFile(filePath, file.content || '');
    }

    // Generate deployment URL
    const deploymentUrl = `${process.env.NEXTAUTH_URL}/deployments/${accessId}/index.html`;

    // Create deployment record
    const deployment = {
      id: Date.now().toString(),
      projectName,
      accessId,
      deploymentType: deploymentType || 'static',
      url: deploymentUrl,
      status: 'deployed',
      files: files.map((f: any) => f.name),
      deployedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      deployment,
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Deployment failed' },
      { status: 500 }
    );
  }
}

// GET - Get deployment status
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

    const deployDir = join(process.cwd(), 'public', 'deployments', accessId);
    const exists = existsSync(deployDir);

    if (!exists) {
      return NextResponse.json({
        deployed: false,
        message: 'No deployment found',
      });
    }

    return NextResponse.json({
      deployed: true,
      url: `${process.env.NEXTAUTH_URL}/deployments/${accessId}/index.html`,
      status: 'active',
    });
  } catch (error: any) {
    console.error('Get deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get deployment status' },
      { status: 500 }
    );
  }
}
