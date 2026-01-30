import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

// POST - Execute code
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, code, language, fileName } = await request.json();

    if (!accessId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temp directory
    const tempDir = join(process.cwd(), 'temp', accessId);
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    let output = '';
    let error = '';

    try {
      switch (language) {
        case 'javascript':
        case 'typescript': {
          const filePath = join(tempDir, fileName || 'code.js');
          await writeFile(filePath, code);
          const { stdout, stderr } = await execAsync(`node "${filePath}"`, { timeout: 5000 });
          output = stdout;
          error = stderr;
          await unlink(filePath);
          break;
        }

        case 'python': {
          const filePath = join(tempDir, fileName || 'code.py');
          await writeFile(filePath, code);
          const { stdout, stderr } = await execAsync(`python "${filePath}"`, { timeout: 5000 });
          output = stdout;
          error = stderr;
          await unlink(filePath);
          break;
        }

        case 'java': {
          const className = fileName?.replace('.java', '') || 'Main';
          const filePath = join(tempDir, `${className}.java`);
          await writeFile(filePath, code);
          
          // Compile
          const { stderr: compileError } = await execAsync(`javac "${filePath}"`, { timeout: 10000 });
          if (compileError) {
            error = compileError;
          } else {
            // Run
            const { stdout, stderr } = await execAsync(`java -cp "${tempDir}" ${className}`, { timeout: 5000 });
            output = stdout;
            error = stderr;
          }
          
          // Cleanup
          await unlink(filePath);
          const classFile = join(tempDir, `${className}.class`);
          if (existsSync(classFile)) {
            await unlink(classFile);
          }
          break;
        }

        case 'cpp': {
          const filePath = join(tempDir, fileName || 'code.cpp');
          const outPath = join(tempDir, 'program');
          await writeFile(filePath, code);
          
          // Compile
          const { stderr: compileError } = await execAsync(`g++ "${filePath}" -o "${outPath}"`, { timeout: 10000 });
          if (compileError) {
            error = compileError;
          } else {
            // Run
            const { stdout, stderr } = await execAsync(`"${outPath}"`, { timeout: 5000 });
            output = stdout;
            error = stderr;
          }
          
          // Cleanup
          await unlink(filePath);
          if (existsSync(outPath)) {
            await unlink(outPath);
          }
          break;
        }

        case 'html': {
          output = 'HTML files cannot be executed. Use Preview instead.';
          break;
        }

        default:
          error = `Language ${language} is not supported for execution`;
      }
    } catch (execError: any) {
      error = execError.message || 'Execution error';
    }

    return NextResponse.json({
      output: output || 'No output',
      error: error || null,
      success: !error,
    });

  } catch (error: any) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
