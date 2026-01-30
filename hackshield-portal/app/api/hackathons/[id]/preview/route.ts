import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Create live preview
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, files } = await request.json();

    if (!accessId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Access ID and files required' },
        { status: 400 }
      );
    }

    // Create preview directory
    const previewDir = join(process.cwd(), 'public', 'previews', accessId);
    if (!existsSync(previewDir)) {
      await mkdir(previewDir, { recursive: true });
    }

    // Write files
    for (const file of files) {
      const filePath = join(previewDir, file.name);
      await writeFile(filePath, file.content);
    }

    // Find index.html or create a default one
    const hasIndex = files.some(f => f.name === 'index.html');
    if (!hasIndex) {
      const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
</head>
<body>
    <h1>Live Preview</h1>
    <p>Add an index.html file to see your web project.</p>
</body>
</html>`;
      await writeFile(join(previewDir, 'index.html'), defaultHTML);
    }

    const previewUrl = `/previews/${accessId}/index.html`;

    return NextResponse.json({
      previewUrl,
      success: true,
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to create preview' },
      { status: 500 }
    );
  }
}
