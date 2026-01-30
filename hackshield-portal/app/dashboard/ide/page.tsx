'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Maximize, 
  Minimize, 
  Play, 
  Save, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  Clock,
  FolderTree,
  Terminal as TerminalIcon,
  Eye,
  Bot,
  Settings,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  X,
  Plus,
  Send,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Mic,
  MicOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIAssistant from '@/components/ide/AIAssistant';
import IDELockdown from '@/components/ide/IDELockdown';
import CollaborativeFiles from '@/components/ide/CollaborativeFiles';
import LivePreview from '@/components/ide/LivePreview';
import SettingsPanel from '@/components/ide/SettingsPanel';

// Dynamic import Monaco Editor (client-side only)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div> }
);

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'code' | 'system';
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
}

// Sample file structure
const initialFiles: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        name: 'index.js',
        type: 'file',
        path: '/src/index.js',
        language: 'javascript',
        content: `// Welcome to HackShield IDE!
// Your hackathon project starts here.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`,
      },
      {
        name: 'App.js',
        type: 'file',
        path: '/src/App.js',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>🚀 HackShield Project</h1>
      <p>Build something amazing!</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
`,
      },
      {
        name: 'App.css',
        type: 'file',
        path: '/src/App.css',
        language: 'css',
        content: `.App {
  text-align: center;
  padding: 2rem;
  font-family: sans-serif;
}

h1 {
  color: #0ea5e9;
}

button {
  background: linear-gradient(to right, #0ea5e9, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}
`,
      },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    path: '/public',
    children: [
      {
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HackShield Project</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`,
      },
    ],
  },
  {
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "hackshield-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
`,
  },
  {
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    language: 'markdown',
    content: `# 🚀 HackShield Project

## Project Name
Your amazing hackathon project

## Description
Describe your project here...

## Tech Stack
- React
- Node.js
- More...

## Team Members
- Member 1
- Member 2
- Member 3

## How to Run
\`\`\`bash
npm install
npm start
\`\`\`
`,
  },
];

export default function IDEPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team');
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<string[]>(['/src/App.js']);
  const [activeFile, setActiveFile] = useState<string>('/src/App.js');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/public']));
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ Welcome to HackShield Terminal', '$ Ready to run commands...']);
  const [terminalInput, setTerminalInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'System', senderId: 'system', message: 'Welcome to the team chat! Good luck with your hackathon.', timestamp: new Date(), type: 'system' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isLockdownActive, setIsLockdownActive] = useState(true); // Lockdown enabled during hackathon
  const [hackathonStartTime] = useState(new Date()); // Simulated hackathon start
  const [hackathonEndTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours from now
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'You', isOnline: true, currentFile: '/src/App.js' },
    { id: '2', name: 'Teammate', isOnline: true, currentFile: '/src/index.js' },
  ]);
  
  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            toast.error('⚠️ FINAL WARNING: One more violation will disqualify you!');
          } else {
            toast.error(`⚠️ Strike ${newCount}/3: Tab switching detected!`);
          }
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          toast.error('⏰ Time is up! IDE is now locked.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 6 * 3600) return 'text-green-400';
    if (timeRemaining > 1 * 3600) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  const findFile = (path: string, nodes: FileNode[] = files): FileNode | undefined => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFile(path, node.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const getActiveFileContent = () => {
    const file = findFile(activeFile);
    return file?.content || '';
  };

  const getActiveFileLanguage = () => {
    const file = findFile(activeFile);
    return file?.language || 'javascript';
  };

  const findFileContent = (path: string): string => {
    const file = findFile(path);
    return file?.content || '';
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    const updateFileContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === activeFile) {
          return { ...node, content: value };
        }
        if (node.children) {
          return { ...node, children: updateFileContent(node.children) };
        }
        return node;
      });
    };
    
    setFiles(updateFileContent(files));
  };

  const handleOpenFile = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setActiveFile(path);
  };

  const handleCloseFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter((f) => f !== path);
    setOpenFiles(newOpenFiles);
    if (activeFile === path && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    
    const command = terminalInput.trim();
    setTerminalOutput((prev) => [...prev, `$ ${command}`]);
    
    // Simulate command execution
    if (command === 'npm start') {
      setTerminalOutput((prev) => [...prev, 'Starting development server...', '✅ Server running on http://localhost:3000']);
    } else if (command === 'npm install') {
      setTerminalOutput((prev) => [...prev, 'Installing dependencies...', '✅ Installed 42 packages']);
    } else if (command === 'clear') {
      setTerminalOutput(['$ Terminal cleared']);
    } else if (command.startsWith('echo ')) {
      setTerminalOutput((prev) => [...prev, command.slice(5)]);
    } else {
      setTerminalOutput((prev) => [...prev, `Command executed: ${command}`]);
    }
    
    setTerminalInput('');
    
    // Scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: session?.user?.name || 'You',
      senderId: session?.user?.id || 'you',
      message: chatInput,
      timestamp: new Date(),
      type: 'text',
    };
    
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
  };

  const handleAIQuery = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput;
    setAiMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you debug that! The error is likely due to a missing dependency. Try running `npm install` first.",
        "Looking at your code, I suggest adding error handling to the async function. Would you like me to explain how?",
        "That's a great approach! You might also consider using React.memo for performance optimization.",
        "I can see you're working on a form component. Remember to validate user input before submitting!",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiMessages((prev) => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-dark-700 rounded ${
            activeFile === node.path ? 'bg-primary-500/20 text-primary-400' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : handleOpenFile(node.path)}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-dark-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-dark-400" />
              )}
              <Folder className="w-4 h-4 text-yellow-400" />
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-blue-400" />
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          renderFileTree(node.children, depth + 1)
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-12 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-primary-400">HackShield IDE</span>
          <span className="text-dark-400">|</span>
          <span className="text-sm text-dark-300">Team: ByteNinjas</span>
        </div>
        
        {/* Countdown Timer */}
        <div className={`flex items-center gap-2 text-xl font-mono ${getTimeColor()}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeRemaining)}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Team Members Online */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-dark-400" />
            <span className="text-sm">
              {teamMembers.filter(m => m.isOnline).length}/{teamMembers.length} online
            </span>
          </div>
          
          {/* Warning Strikes */}
          {warningCount > 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{warningCount}/3</span>
            </div>
          )}
          
          {/* Tool Buttons */}
          <button 
            onClick={() => setShowAI(!showAI)} 
            className={`p-2 hover:bg-dark-800 rounded ${showAI ? 'bg-dark-800 text-primary-400' : ''}`}
            title="AI Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className={`p-2 hover:bg-dark-800 rounded ${showPreview ? 'bg-dark-800 text-primary-400' : ''}`}
            title="Live Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 hover:bg-dark-800 rounded ${showSettings ? 'bg-dark-800 text-primary-400' : ''}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Fullscreen Toggle */}
          <button onClick={toggleFullscreen} className="p-2 hover:bg-dark-800 rounded">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collaborative File Explorer */}
        <div className="w-64 bg-dark-900 border-r border-dark-800">
          <CollaborativeFiles
            teamId={teamId || 'demo-team'}
            currentUserId={session?.user?.id || '1'}
            onFileSelect={(file) => handleOpenFile(file.path)}
          />
        </div>

        {/* Editor & Panels */}
        <div className="flex-1 flex flex-col">
          {/* Open File Tabs */}
          <div className="h-10 bg-dark-900 border-b border-dark-800 flex items-center gap-1 px-2 overflow-x-auto">
            {openFiles.map((path) => {
              const file = findFile(path);
              return (
                <div
                  key={path}
                  onClick={() => setActiveFile(path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer group ${
                    activeFile === path
                      ? 'bg-dark-800 text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <File className="w-3 h-3" />
                  <span className="text-sm">{file?.name}</span>
                  <button
                    onClick={(e) => handleCloseFile(path, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex-1 flex">
            {/* Monaco Editor */}
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={getActiveFileLanguage()}
                value={getActiveFileContent()}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 10 },
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>

            {/* Right Panel (Terminal & Preview) */}
            <div className="w-96 border-l border-dark-800 flex flex-col">
              {/* Terminal */}
              {showTerminal && (
                <div className="h-1/2 flex flex-col border-b border-dark-800">
                  <div className="h-8 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-3">
                    <span className="text-sm flex items-center gap-2">
                      <TerminalIcon className="w-4 h-4" />
                      Terminal
                    </span>
                    <button onClick={() => setShowTerminal(false)} className="hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    ref={terminalRef}
                    className="flex-1 bg-dark-950 p-3 font-mono text-sm overflow-y-auto"
                  >
                    {terminalOutput.map((line, i) => (
                      <div key={i} className={line.startsWith('$') ? 'text-green-400' : line.startsWith('✅') ? 'text-green-400' : 'text-dark-300'}>
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center bg-dark-900 border-t border-dark-800">
                    <span className="px-2 text-green-400">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommand()}
                      className="flex-1 bg-transparent border-none outline-none py-2 text-sm"
                      placeholder="Enter command..."
                    />
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div className="flex-1 flex flex-col">
                <div className="h-8 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-3">
                  <span className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </span>
                </div>
                <div className="flex-1 bg-white">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>
                            body { font-family: sans-serif; text-align: center; padding: 2rem; background: linear-gradient(135deg, #0f172a, #1e293b); min-height: 100vh; color: white; }
                            h1 { color: #0ea5e9; }
                            button { background: linear-gradient(to right, #0ea5e9, #8b5cf6); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
                          </style>
                        </head>
                        <body>
                          <h1>🚀 HackShield Project</h1>
                          <p>Build something amazing!</p>
                          <button onclick="alert('Hello from HackShield!')">Click Me</button>
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-none"
                    title="Live Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Team Chat */}
      {showChat && (
        <div className="h-48 bg-dark-900 border-t border-dark-800 flex">
          {/* Team Video/Audio */}
          <div className="w-64 border-r border-dark-800 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Team</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className={`p-1 rounded ${isMuted ? 'bg-red-500/20 text-red-400' : 'hover:bg-dark-700'}`}>
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-1 rounded ${isVideoOn ? 'bg-green-500/20 text-green-400' : 'hover:bg-dark-700'}`}>
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-dark-800 rounded p-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-1">
                    {member.name[0]}
                  </div>
                  <div className="text-xs truncate">{member.name}</div>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${member.isOnline ? 'bg-green-400' : 'bg-dark-600'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-dark-800">
              <span className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Team Chat
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={`p-1 rounded ${showAI ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-dark-700'}`}
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button onClick={() => setShowChat(false)} className="hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-dark-400 italic' : ''}`}>
                  <span className="font-medium text-primary-400">{msg.sender}: </span>
                  <span className="text-dark-200">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-2 border-t border-dark-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="flex-1 bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm"
              />
              <button onClick={handleSendChat} className="btn-primary p-2">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Assistant */}
          {showAI && (
            <div className="w-80 border-l border-dark-800 flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-dark-800">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary-400" />
                  AI Assistant
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`text-sm p-2 rounded ${msg.role === 'user' ? 'bg-primary-500/10 text-primary-300' : 'bg-dark-800 text-dark-200'}`}>
                    {msg.content}
                  </div>
                ))}
                {aiMessages.length === 0 && (
                  <div className="text-sm text-dark-400 text-center py-4">
                    Ask me about your code!
                    <br />
                    <span className="text-xs">"How do I fix this error?"</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 border-t border-dark-800">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                  placeholder="Ask AI..."
                  className="flex-1 bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm"
                />
                <button onClick={handleAIQuery} className="btn-primary p-2">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Panels */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {!showTerminal && (
          <button onClick={() => setShowTerminal(true)} className="btn-secondary text-xs">
            <TerminalIcon className="w-3 h-3 mr-1" />
            Terminal
          </button>
        )}
        {!showChat && (
          <button onClick={() => setShowChat(true)} className="btn-secondary text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            Chat
          </button>
        )}
      </div>

      {/* AI Assistant Panel (Slide-in from right) */}
      {showAI && (
        <div className="fixed top-12 right-0 bottom-0 w-96 z-40 shadow-2xl">
          <AIAssistant
            currentFile={activeFile}
            currentCode={getActiveFileContent()}
            onClose={() => setShowAI(false)}
          />
        </div>
      )}

      {/* Live Preview Panel (Modal) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-dark-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-dark-800">
              <h3 className="font-semibold">Live Preview</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-dark-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              <LivePreview
                code={getActiveFileContent()}
                language={getActiveFileLanguage()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel (Slide-in from right) */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* IDE Lockdown Component */}
      {isLockdownActive && (
        <IDELockdown
          hackathonId={teamId || 'demo-hackathon'}
          startTime={hackathonStartTime}
          endTime={hackathonEndTime}
          isLocked={isLockdownActive}
          onLockdownActive={setIsLockdownActive}
        />
      )}
    </div>
  );
}
