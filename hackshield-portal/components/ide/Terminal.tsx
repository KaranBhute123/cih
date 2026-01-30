'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function Terminal({ onClose, isMinimized, onToggleMinimize }: TerminalProps) {
  const [history, setHistory] = useState<string[]>([
    '\x1b[32m$\x1b[0m Welcome to HackShield Terminal',
    '\x1b[32m$\x1b[0m Type "help" for available commands',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('/home/hackshield/project');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    // Focus input when terminal is clicked
    const handleClick = () => inputRef.current?.focus();
    terminalRef.current?.addEventListener('click', handleClick);
    return () => terminalRef.current?.removeEventListener('click', handleClick);
  }, []);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Parse command
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string[] = [];

    switch (command) {
      case 'help':
        output = [
          '',
          '\x1b[36mAvailable Commands:\x1b[0m',
          '  help          - Show this help message',
          '  ls            - List directory contents',
          '  cd <dir>      - Change directory',
          '  pwd           - Print working directory',
          '  cat <file>    - Display file contents',
          '  mkdir <dir>   - Create directory',
          '  touch <file>  - Create empty file',
          '  rm <file>     - Remove file',
          '  echo <text>   - Print text',
          '  clear         - Clear terminal',
          '  npm <cmd>     - Run npm commands',
          '  node <file>   - Run Node.js file',
          '  git <cmd>     - Git commands',
          '  python <file> - Run Python file',
          ''
        ];
        break;

      case 'ls':
        output = [
          '',
          '\x1b[34msrc/\x1b[0m  \x1b[34mpublic/\x1b[0m  package.json  README.md  tsconfig.json  node_modules/',
          ''
        ];
        break;

      case 'pwd':
        output = ['', currentDir, ''];
        break;

      case 'cd':
        if (args[0]) {
          if (args[0] === '..') {
            const parts = currentDir.split('/');
            parts.pop();
            setCurrentDir(parts.join('/') || '/');
          } else if (args[0].startsWith('/')) {
            setCurrentDir(args[0]);
          } else {
            setCurrentDir(`${currentDir}/${args[0]}`);
          }
          output = [''];
        } else {
          setCurrentDir('/home/hackshield');
          output = [''];
        }
        break;

      case 'cat':
        if (args[0]) {
          if (args[0] === 'package.json') {
            output = [
              '',
              '\x1b[33m{\x1b[0m',
              '  "name": "hackshield-project",',
              '  "version": "1.0.0",',
              '  "scripts": {',
              '    "dev": "next dev",',
              '    "build": "next build",',
              '    "start": "next start"',
              '  },',
              '  "dependencies": {',
              '    "react": "^18.2.0",',
              '    "next": "^14.0.0"',
              '  }',
              '\x1b[33m}\x1b[0m',
              ''
            ];
          } else if (args[0] === 'README.md') {
            output = [
              '',
              '\x1b[36m# HackShield Project\x1b[0m',
              '',
              'A hackathon project built with Next.js and React.',
              '',
              '## Getting Started',
              '',
              '```bash',
              'npm install',
              'npm run dev',
              '```',
              ''
            ];
          } else {
            output = ['', `\x1b[31mcat: ${args[0]}: No such file or directory\x1b[0m`, ''];
          }
        } else {
          output = ['', '\x1b[31mcat: missing file operand\x1b[0m', ''];
        }
        break;

      case 'mkdir':
        if (args[0]) {
          output = ['', `\x1b[32mCreated directory: ${args[0]}\x1b[0m`, ''];
        } else {
          output = ['', '\x1b[31mmkdir: missing operand\x1b[0m', ''];
        }
        break;

      case 'touch':
        if (args[0]) {
          output = ['', `\x1b[32mCreated file: ${args[0]}\x1b[0m`, ''];
        } else {
          output = ['', '\x1b[31mtouch: missing file operand\x1b[0m', ''];
        }
        break;

      case 'rm':
        if (args[0]) {
          output = ['', `\x1b[33mRemoved: ${args[0]}\x1b[0m`, ''];
        } else {
          output = ['', '\x1b[31mrm: missing operand\x1b[0m', ''];
        }
        break;

      case 'echo':
        output = ['', args.join(' '), ''];
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'npm':
        if (args[0] === 'start' || args[0] === 'run' && args[1] === 'dev') {
          output = [
            '',
            '\x1b[36m> hackshield-project@1.0.0 dev\x1b[0m',
            '\x1b[36m> next dev\x1b[0m',
            '',
            '\x1b[32m✓\x1b[0m Ready in 1.2s',
            '\x1b[32m✓\x1b[0m Local:        http://localhost:3000',
            ''
          ];
        } else if (args[0] === 'install') {
          output = [
            '',
            '\x1b[36mInstalling dependencies...\x1b[0m',
            '',
            'added 245 packages in 8s',
            '',
            '\x1b[32m✓\x1b[0m All packages installed successfully',
            ''
          ];
        } else if (args[0] === 'build') {
          output = [
            '',
            '\x1b[36m> hackshield-project@1.0.0 build\x1b[0m',
            '\x1b[36m> next build\x1b[0m',
            '',
            '\x1b[32m✓\x1b[0m Creating an optimized production build...',
            '\x1b[32m✓\x1b[0m Compiled successfully',
            '\x1b[32m✓\x1b[0m Collecting page data',
            '\x1b[32m✓\x1b[0m Generating static pages',
            '\x1b[32m✓\x1b[0m Build completed!',
            ''
          ];
        } else if (args[0] === 'test') {
          output = [
            '',
            '\x1b[36m> hackshield-project@1.0.0 test\x1b[0m',
            '',
            '\x1b[32m PASS \x1b[0m src/App.test.js',
            '  ✓ renders learn react link (23 ms)',
            '  ✓ increments counter (15 ms)',
            '',
            '\x1b[32mTest Suites: 1 passed, 1 total\x1b[0m',
            '\x1b[32mTests:       2 passed, 2 total\x1b[0m',
            ''
          ];
        } else {
          output = ['', `\x1b[36mnpm ${args.join(' ')}\x1b[0m`, '\x1b[32m✓\x1b[0m Command executed', ''];
        }
        break;

      case 'node':
        if (args[0]) {
          output = [
            '',
            `\x1b[36mRunning ${args[0]}...\x1b[0m`,
            '',
            'Hello from HackShield!',
            '',
            '\x1b[32m✓\x1b[0m Process exited with code 0',
            ''
          ];
        } else {
          output = [
            '',
            '\x1b[36mNode.js v18.17.0\x1b[0m',
            'Type ".exit" to exit the REPL',
            '> '
          ];
        }
        break;

      case 'git':
        if (args[0] === 'status') {
          output = [
            '',
            'On branch main',
            'Your branch is up to date with \'origin/main\'.',
            '',
            'Changes not staged for commit:',
            '  (use "git add <file>..." to update what will be committed)',
            '',
            '\x1b[31m        modified:   src/App.js\x1b[0m',
            '\x1b[31m        modified:   src/App.css\x1b[0m',
            '',
            'no changes added to commit',
            ''
          ];
        } else if (args[0] === 'add') {
          output = ['', `\x1b[32mAdded ${args[1] || '.'} to staging\x1b[0m`, ''];
        } else if (args[0] === 'commit') {
          output = [
            '',
            '\x1b[33m[main abc1234]\x1b[0m Your commit message',
            ' 2 files changed, 15 insertions(+), 3 deletions(-)',
            ''
          ];
        } else if (args[0] === 'push') {
          output = [
            '',
            'Enumerating objects: 5, done.',
            'Counting objects: 100% (5/5), done.',
            'Writing objects: 100% (3/3), 285 bytes | 285.00 KiB/s, done.',
            '',
            '\x1b[32m✓\x1b[0m Pushed to origin/main',
            ''
          ];
        } else if (args[0] === 'log') {
          output = [
            '',
            '\x1b[33mcommit abc1234567890\x1b[0m',
            'Author: Team HackShield <team@hackshield.io>',
            'Date:   Today',
            '',
            '    Initial commit',
            ''
          ];
        } else {
          output = ['', `\x1b[36mgit ${args.join(' ')}\x1b[0m`, '\x1b[32m✓\x1b[0m Command executed', ''];
        }
        break;

      case 'python':
      case 'python3':
        if (args[0]) {
          output = [
            '',
            `\x1b[36mPython 3.11.0\x1b[0m`,
            `Running ${args[0]}...`,
            '',
            'Hello from Python!',
            '',
            '\x1b[32m✓\x1b[0m Process finished',
            ''
          ];
        } else {
          output = [
            '',
            '\x1b[36mPython 3.11.0 (default, Oct 24 2023)\x1b[0m',
            '>>> '
          ];
        }
        break;

      case 'whoami':
        output = ['', 'hackshield-user', ''];
        break;

      case 'date':
        output = ['', new Date().toString(), ''];
        break;

      case 'uptime':
        output = ['', ' 12:34:56 up 2 days, 3:45, 1 user, load average: 0.15, 0.10, 0.05', ''];
        break;

      default:
        output = ['', `\x1b[31mCommand not found: ${command}\x1b[0m`, 'Type "help" for available commands', ''];
    }

    setHistory(prev => [
      ...prev,
      `\x1b[32m${currentDir}$\x1b[0m ${trimmedCmd}`,
      ...output
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const commands = ['help', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'echo', 'clear', 'npm', 'node', 'git', 'python'];
      const matching = commands.filter(c => c.startsWith(currentInput));
      if (matching.length === 1) {
        setCurrentInput(matching[0] + ' ');
      }
    } else if (e.ctrlKey && e.key === 'c') {
      setHistory(prev => [...prev, `\x1b[32m${currentDir}$\x1b[0m ${currentInput}^C`, '']);
      setCurrentInput('');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  // Parse ANSI codes for display
  const parseAnsi = (text: string) => {
    const parts = text.split(/(\x1b\[\d+m)/g);
    let currentColor = '';
    
    return parts.map((part, i) => {
      if (part === '\x1b[0m') {
        currentColor = '';
        return null;
      }
      if (part === '\x1b[31m') { currentColor = 'text-red-400'; return null; }
      if (part === '\x1b[32m') { currentColor = 'text-green-400'; return null; }
      if (part === '\x1b[33m') { currentColor = 'text-yellow-400'; return null; }
      if (part === '\x1b[34m') { currentColor = 'text-blue-400'; return null; }
      if (part === '\x1b[36m') { currentColor = 'text-cyan-400'; return null; }
      
      if (part && !part.startsWith('\x1b')) {
        return <span key={i} className={currentColor}>{part}</span>;
      }
      return null;
    });
  };

  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <TerminalIcon className="w-4 h-4 text-green-400" />
        <span className="text-sm">Terminal</span>
        <Maximize2 className="w-4 h-4 text-dark-400" />
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-950 rounded-lg border border-dark-800 font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-dark-900 border-b border-dark-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-dark-300">Terminal</span>
          <span className="text-dark-500 text-xs">{currentDir}</span>
        </div>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 rounded hover:bg-dark-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-dark-400" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-dark-800 transition-colors"
            >
              <X className="w-4 h-4 text-dark-400" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{parseAnsi(line)}</div>
        ))}
        
        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-green-400">{currentDir}$</span>
          <span className="ml-1">&nbsp;</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
