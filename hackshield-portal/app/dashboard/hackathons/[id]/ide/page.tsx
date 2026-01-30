'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  Code, FileCode, Play, Terminal as TerminalIcon, Globe, 
  Bot, Lock, AlertTriangle, Save, FolderPlus, Users,
  Eye, EyeOff, Settings, RefreshCw
} from 'lucide-react';

export default function HackathonIDE() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const hackathonId = params.id as string;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessId, setAccessId] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for credentials in URL
  useEffect(() => {
    const urlAccessId = searchParams.get('accessId');
    const urlPassword = searchParams.get('password');
    
    if (urlAccessId && urlPassword) {
      setAccessId(urlAccessId);
      setAccessPassword(urlPassword);
      // Auto-authenticate with URL credentials
      setTimeout(() => {
        handleAuthenticate(urlAccessId, urlPassword);
      }, 500);
    }
  }, [searchParams]);

  // Lockdown Mode State
  const [lockdownActive, setLockdownActive] = useState(false);
  const [leaveAttempts, setLeaveAttempts] = useState(0);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [hackathonEndTime, setHackathonEndTime] = useState<Date | null>(null);

  // File System State
  const [files, setFiles] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ Welcome to HackShield Terminal',
    '$ Ready to run commands...',
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Live Preview State
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // AI Assistant State
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Team Storage State
  const [teamFiles, setTeamFiles] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Activity Tracking
  const activityInterval = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Log Activity to Monitor
  const logActivity = async (activityType: string, details: string, metadata?: any) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`/api/hackathons/${hackathonId}/monitor/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: accessId,
          teamName: session?.user?.name || 'Unknown Team',
          participantName: session?.user?.name || 'Unknown User',
          activityType,
          details,
          metadata: metadata || {},
          severity: activityType === 'violation' ? 'critical' : 'info',
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Authenticate with ID and Password
  const handleAuthenticate = async (id?: string, password?: string) => {
    const authAccessId = id || accessId;
    const authPassword = password || accessPassword;
    
    if (!authAccessId || !authPassword) {
      setAuthError('Please enter both Access ID and Password');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/ide-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId: authAccessId, accessPassword: authPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setLockdownActive(true);
        setHackathonEndTime(new Date(data.endTime));
        loadTeamFiles();
        startActivityTracking();
        enableLockdownMode();
      } else {
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enable Lockdown Mode
  const enableLockdownMode = () => {
    // Prevent page navigation
    window.onbeforeunload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      handleLeaveAttempt();
      return '';
    };

    // Detect visibility change (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable certain keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    });
  };

  // Handle Leave Attempt
  const handleLeaveAttempt = () => {
    const newAttempts = leaveAttempts + 1;
    setLeaveAttempts(newAttempts);
    setShowLeaveWarning(true);

    // Log violation activity
    logActivity('violation', `Leave attempt detected (Attempt ${newAttempts}/3)`, {
      attemptNumber: newAttempts,
      severity: newAttempts >= 3 ? 'critical' : 'warning'
    });

    if (newAttempts >= 3) {
      disqualifyParticipant('Multiple attempts to leave the IDE');
    }

    // Record attempt on server
    fetch(`/api/hackathons/${hackathonId}/ide-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessId,
        action: 'leave_attempt',
        attempts: newAttempts,
      }),
    });
  };

  // Handle Visibility Change
  const handleVisibilityChange = () => {
    if (document.hidden && lockdownActive) {
      handleLeaveAttempt();
    }
    updateActivity();
  };

  // Disqualify Participant
  const disqualifyParticipant = async (reason: string) => {
    try {
      await fetch(`/api/hackathons/${hackathonId}/ide-disqualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId, reason }),
      });

      alert(`You have been disqualified: ${reason}`);
      setLockdownActive(false);
      setIsAuthenticated(false);
      router.push(`/dashboard/hackathons/${hackathonId}`);
    } catch (error) {
      console.error('Disqualification error:', error);
    }
  };

  // Update Activity Tracking
  const updateActivity = () => {
    lastActivityRef.current = new Date();
    fetch(`/api/hackathons/${hackathonId}/ide-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessId,
        action: 'activity',
        timestamp: new Date().toISOString(),
      }),
    });
  };

  // Start Activity Tracking
  const startActivityTracking = () => {
    activityInterval.current = setInterval(() => {
      updateActivity();
    }, 30000); // Every 30 seconds
  };

  // Stop Activity Tracking
  const stopActivityTracking = () => {
    if (activityInterval.current) {
      clearInterval(activityInterval.current);
    }
  };

  // Calculate Time Remaining
  useEffect(() => {
    if (!hackathonEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = hackathonEndTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Time Ended');
        setLockdownActive(false);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [hackathonEndTime]);

  // Load Team Files from Centralized Storage
  const loadTeamFiles = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/team-files?accessId=${accessId}`);
      const data = await response.json();
      if (response.ok) {
        setTeamFiles(data.files || []);
      }
    } catch (error) {
      console.error('Load team files error:', error);
    }
  };

  // Create New File
  const createFile = () => {
    if (!newFileName) return;

    const file = {
      id: Date.now().toString(),
      name: newFileName,
      language: newFileLanguage,
      content: '',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setFiles([...files, file]);
    setCurrentFile(file);
    setFileContent('');
    setShowFileModal(false);
    setNewFileName('');
    saveFileToTeamStorage(file);
    
    // Log activity
    logActivity('file_created', `Created file: ${newFileName}`, { fileName: newFileName, language: newFileLanguage });
  };

  // Save File to Team Storage
  const saveFileToTeamStorage = async (file: any) => {
    setSyncStatus('syncing');
    try {
      await fetch(`/api/hackathons/${hackathonId}/team-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessId,
          file: {
            ...file,
            content: fileContent,
          },
        }),
      });
      setSyncStatus('synced');
      loadTeamFiles();
      
      // Log save activity
      logActivity('save', `Saved file: ${file.name}`, { fileName: file.name, size: fileContent.length });
    } catch (error) {
      setSyncStatus('error');
      console.error('Save file error:', error);
    }
  };

  // Save Current File
  const saveCurrentFile = () => {
    if (!currentFile) return;

    const updatedFile = {
      ...currentFile,
      content: fileContent,
      modifiedAt: new Date(),
    };

    setFiles(files.map(f => f.id === currentFile.id ? updatedFile : f));
    setCurrentFile(updatedFile);
    saveFileToTeamStorage(updatedFile);
  };

  // Run Code in Terminal
  const runCode = async () => {
    if (!currentFile) {
      addTerminalOutput('$ Error: No file selected');
      return;
    }

    addTerminalOutput(`$ Running ${currentFile.name}...`);

    // Log code execution activity
    logActivity('execute', `Executed: ${currentFile.name}`, {
      fileName: currentFile.name,
      language: currentFile.language,
      codeLength: fileContent.length
    });

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/execute-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessId,
          code: fileContent,
          language: currentFile.language,
          fileName: currentFile.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addTerminalOutput(data.output || '$ Execution completed');
        if (data.error) {
          addTerminalOutput(`$ Error: ${data.error}`);
        }
      } else {
        addTerminalOutput(`$ Error: ${data.error}`);
      }
    } catch (error) {
      addTerminalOutput('$ Execution failed');
    }
  };

  // Execute Terminal Command
  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    addTerminalOutput(`$ ${command}`);
    setTerminalHistory([...terminalHistory, command]);
    setHistoryIndex(-1);

    // Log terminal activity
    logActivity('terminal_command', `Executed: ${command}`, { command });

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessId,
          command,
        }),
      });

      const data = await response.json();
      addTerminalOutput(data.output || '$ Command executed');
    } catch (error) {
      addTerminalOutput('$ Command failed');
    }
  };

  // Add Terminal Output
  const addTerminalOutput = (output: string) => {
    setTerminalOutput(prev => [...prev, output]);
  };

  // Handle Terminal Key Press
  const handleTerminalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(terminalInput);
      setTerminalInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < terminalHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[terminalHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[terminalHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  // Launch Live Preview
  const launchPreview = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessId,
          files: files.map(f => ({
            name: f.name,
            content: f.id === currentFile?.id ? fileContent : f.content,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPreviewUrl(data.previewUrl);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  // Ask AI Assistant
  const askAI = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          context: {
            currentFile: currentFile?.name,
            code: fileContent,
            language: currentFile?.language,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAiResponse(data.response);
        // Log AI query activity
        logActivity('ai_query', `AI Query: ${aiQuery.substring(0, 100)}${aiQuery.length > 100 ? '...' : ''}`, {
          query: aiQuery,
          currentFile: currentFile?.name,
          responseLength: data.response?.length || 0
        });
      }
    } catch (error) {
      setAiResponse('AI assistant error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopActivityTracking();
      if (lockdownActive) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', (e) => e.preventDefault());
        window.onbeforeunload = null;
      }
    };
  }, [lockdownActive]);

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary-600/20 rounded-full">
              <Lock className="w-12 h-12 text-primary-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Hackathon IDE Access
          </h2>
          <p className="text-dark-300 text-center mb-6">
            Enter your credentials to access the coding environment
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Access ID
              </label>
              <input
                type="text"
                value={accessId}
                onChange={(e) => setAccessId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 uppercase"
                placeholder="XXXXXXXX"
                maxLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Enter password"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={async () => await handleAuthenticate()}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-medium disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Enter IDE'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Lockdown Mode Active</p>
                <p className="text-yellow-300/80">
                  Once you enter, you cannot leave until the hackathon ends. 
                  Attempting to leave will result in disqualification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main IDE Interface
  return (
    <div className="h-screen bg-dark-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-dark-900 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span className="text-white font-semibold">Lockdown Mode Active</span>
          </div>
          {lockdownActive && (
            <div className="px-3 py-1 bg-red-900/30 border border-red-700/50 rounded-full text-red-300 text-sm font-medium">
              Time: {timeRemaining}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-dark-300">
              {syncStatus === 'synced' ? 'Synced' :
               syncStatus === 'syncing' ? 'Syncing...' :
               'Sync Error'}
            </span>
          </div>

          {leaveAttempts > 0 && (
            <div className="px-3 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-300 text-sm">
              ⚠️ Leave Attempts: {leaveAttempts}/3
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
          <div className="p-4 border-b border-dark-700">
            <button
              onClick={() => setShowFileModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New File
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 text-dark-400 text-xs font-semibold uppercase">
                <FileCode className="w-4 h-4" />
                My Files
              </div>
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setCurrentFile(file);
                    setFileContent(file.content);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-dark-800 transition-colors text-left ${
                    currentFile?.id === file.id ? 'bg-dark-800 text-primary-400' : 'text-dark-300'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span className="text-sm truncate">{file.name}</span>
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-dark-400 text-xs font-semibold uppercase">
                <Users className="w-4 h-4" />
                Team Files ({teamFiles.length})
              </div>
              {teamFiles.map((file: any) => (
                <div
                  key={file.id}
                  className="px-3 py-2 text-sm text-dark-400 hover:bg-dark-800 rounded cursor-pointer"
                >
                  <div className="truncate">{file.name}</div>
                  <div className="text-xs text-dark-500">{file.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-dark-900 border-b border-dark-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentFile && (
                <>
                  <FileCode className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">{currentFile.name}</span>
                  <span className="text-dark-500">•</span>
                  <span className="text-dark-400 text-sm">{currentFile.language}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveCurrentFile}
                className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={runCode}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={launchPreview}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setShowAI(!showAI)}
                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  showAI ? 'bg-purple-600 text-white' : 'bg-dark-800 hover:bg-dark-700 text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                AI
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 bg-dark-950 p-4 overflow-auto">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-transparent text-white font-mono text-sm resize-none outline-none"
                placeholder={currentFile ? 'Start coding...' : 'Select or create a file to start coding'}
                spellCheck={false}
              />
            </div>

            {/* AI Assistant Panel */}
            {showAI && (
              <div className="w-96 bg-dark-900 border-l border-dark-700 flex flex-col">
                <div className="p-4 border-b border-dark-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">AI Assistant</h3>
                  </div>
                  <p className="text-xs text-dark-400">
                    Ask for coding help and implementation guidance
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {aiResponse && (
                    <div className="mb-4 p-3 bg-dark-800 border border-dark-700 rounded-lg">
                      <div className="text-sm text-dark-200 whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-dark-700">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm resize-none mb-2"
                    placeholder="Ask AI for help..."
                    rows={3}
                  />
                  <button
                    onClick={askAI}
                    disabled={aiLoading}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? 'Thinking...' : 'Ask AI'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Terminal */}
      <div className="h-64 bg-dark-950 border-t border-dark-700 flex flex-col">
        <div className="px-4 py-2 bg-dark-900 border-b border-dark-700 flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-white font-semibold">Terminal</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
          {terminalOutput.map((line, index) => (
            <div key={index} className="text-green-400 mb-1">
              {line}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 bg-dark-900 border-t border-dark-700 flex items-center gap-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleTerminalKeyPress}
            className="flex-1 bg-transparent text-green-400 outline-none font-mono"
            placeholder="Enter command..."
          />
        </div>
      </div>

      {/* Create File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Create New File</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                  placeholder="example.js"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Language
                </label>
                <select
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFileModal(false)}
                className="flex-1 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFile}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Warning Modal */}
      {showLeaveWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border-2 border-red-600 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-2xl font-bold text-red-500">Warning!</h3>
            </div>

            <p className="text-white mb-4">
              You attempted to leave the IDE. This action is not allowed during the hackathon.
            </p>

            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg mb-4">
              <p className="text-red-300 text-sm">
                <strong>Attempts: {leaveAttempts}/3</strong><br />
                After 3 attempts, you will be automatically disqualified.
              </p>
            </div>

            <button
              onClick={() => setShowLeaveWarning(false)}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Live Preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <EyeOff className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            <div className="flex-1">
              <iframe
                src={previewUrl}
                className="w-full h-full bg-white"
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
