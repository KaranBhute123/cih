import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// POST - Execute terminal command
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { accessId, command } = await request.json();

    if (!accessId || !command) {
      return NextResponse.json(
        { error: 'Access ID and command required' },
        { status: 400 }
      );
    }

    // Security: Whitelist allowed commands
    const allowedCommands = [
      'ls', 'dir', 'pwd', 'cd', 'mkdir', 'echo', 'cat', 'clear',
      'node', 'python', 'npm', 'git', 'java', 'javac', 'g++', 'gcc'
    ];

    const commandName = command.trim().split(' ')[0];
    
    // Check if command is allowed
    if (!allowedCommands.includes(commandName)) {
      return NextResponse.json({
        output: `Command '${commandName}' is not allowed for security reasons.`,
      });
    }

    // Additional security: prevent command injection
    const dangerousPatterns = [';', '&&', '||', '|', '>', '<', '`', '$', '(', ')'];
    const hasDangerousPattern = dangerousPatterns.some(pattern => 
      command.includes(pattern) && !['echo', 'git'].includes(commandName)
    );

    if (hasDangerousPattern) {
      return NextResponse.json({
        output: 'Command contains potentially dangerous characters and cannot be executed.',
      });
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 10000,
        maxBuffer: 1024 * 1024, // 1MB
      });

      return NextResponse.json({
        output: stdout || stderr || 'Command executed successfully',
      });
    } catch (execError: any) {
      return NextResponse.json({
        output: execError.message || 'Command failed',
      });
    }

  } catch (error: any) {
    console.error('Terminal error:', error);
    return NextResponse.json(
      { error: error.message || 'Terminal command failed' },
      { status: 500 }
    );
  }
}
