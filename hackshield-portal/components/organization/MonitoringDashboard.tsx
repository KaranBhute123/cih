'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, AlertTriangle, Eye, Clock, Code, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ParticipantActivity {
  userId: string;
  userName: string;
  teamName: string;
  status: 'active' | 'idle' | 'suspicious' | 'offline';
  currentFile: string;
  lastActivity: Date;
  linesOfCode: number;
  commits: number;
  violations: number;
  keystrokes: number;
  screenTime: number;
}

interface TeamProgress {
  teamId: string;
  teamName: string;
  members: number;
  totalLinesOfCode: number;
  totalCommits: number;
  filesCreated: number;
  lastActivity: Date;
  healthScore: number;
}

interface ViolationAlert {
  id: string;
  userId: string;
  userName: string;
  teamName: string;
  type: 'navigation' | 'tab_switch' | 'focus_loss' | 'suspicious_activity';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export default function OrganizationMonitoring({ hackathonId }: { hackathonId: string }) {
  const [participants, setParticipants] = useState<ParticipantActivity[]>([]);
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [violations, setViolations] = useState<ViolationAlert[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'participants' | 'teams' | 'violations'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const fetchData = () => {
      // Mock participants data
      setParticipants([
        {
          userId: '1',
          userName: 'Alice Johnson',
          teamName: 'Team Alpha',
          status: 'active',
          currentFile: '/src/components/Dashboard.tsx',
          lastActivity: new Date(),
          linesOfCode: 342,
          commits: 12,
          violations: 0,
          keystrokes: 1250,
          screenTime: 95
        },
        {
          userId: '2',
          userName: 'Bob Smith',
          teamName: 'Team Alpha',
          status: 'active',
          currentFile: '/src/utils/api.ts',
          lastActivity: new Date(Date.now() - 30000),
          linesOfCode: 198,
          commits: 8,
          violations: 0,
          keystrokes: 890,
          screenTime: 92
        },
        {
          userId: '3',
          userName: 'Charlie Brown',
          teamName: 'Team Beta',
          status: 'idle',
          currentFile: '/src/App.tsx',
          lastActivity: new Date(Date.now() - 300000),
          linesOfCode: 156,
          commits: 5,
          violations: 1,
          keystrokes: 650,
          screenTime: 78
        },
        {
          userId: '4',
          userName: 'Diana Prince',
          teamName: 'Team Beta',
          status: 'suspicious',
          currentFile: '/src/index.tsx',
          lastActivity: new Date(Date.now() - 120000),
          linesOfCode: 89,
          commits: 3,
          violations: 3,
          keystrokes: 320,
          screenTime: 45
        }
      ]);

      // Mock teams data
      setTeams([
        {
          teamId: '1',
          teamName: 'Team Alpha',
          members: 4,
          totalLinesOfCode: 1245,
          totalCommits: 34,
          filesCreated: 18,
          lastActivity: new Date(),
          healthScore: 95
        },
        {
          teamId: '2',
          teamName: 'Team Beta',
          members: 3,
          totalLinesOfCode: 876,
          totalCommits: 22,
          filesCreated: 14,
          lastActivity: new Date(Date.now() - 180000),
          healthScore: 72
        },
        {
          teamId: '3',
          teamName: 'Team Gamma',
          members: 4,
          totalLinesOfCode: 1543,
          totalCommits: 45,
          filesCreated: 22,
          lastActivity: new Date(Date.now() - 60000),
          healthScore: 88
        }
      ]);

      // Mock violations
      setViolations([
        {
          id: '1',
          userId: '4',
          userName: 'Diana Prince',
          teamName: 'Team Beta',
          type: 'tab_switch',
          timestamp: new Date(Date.now() - 120000),
          severity: 'high'
        },
        {
          id: '2',
          userId: '3',
          userName: 'Charlie Brown',
          teamName: 'Team Beta',
          type: 'focus_loss',
          timestamp: new Date(Date.now() - 300000),
          severity: 'medium'
        }
      ]);
    };

    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, hackathonId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'suspicious': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'suspicious': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-900/30 border-red-500 text-red-400';
      case 'medium': return 'bg-yellow-900/30 border-yellow-500 text-yellow-400';
      case 'low': return 'bg-blue-900/30 border-blue-500 text-blue-400';
      default: return 'bg-gray-900/30 border-gray-500 text-gray-400';
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold">Live Monitoring Dashboard</h2>
            <p className="text-xs text-gray-400">Real-time participant tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {autoRefresh ? '● Auto-Refresh ON' : '○ Auto-Refresh OFF'}
          </button>
          
          <div className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm">
            <Clock className="w-4 h-4 inline mr-1" />
            Updated {getRelativeTime(new Date())}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-700 bg-gray-800/50">
        {(['overview', 'participants', 'teams', 'violations'] as const).map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedView === view
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedView === 'overview' && (
          <div className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold">{participants.length}</span>
                </div>
                <div className="text-sm text-gray-400">Active Participants</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold">{teams.length}</span>
                </div>
                <div className="text-sm text-gray-400">Active Teams</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  <span className="text-2xl font-bold">
                    {teams.reduce((sum, team) => sum + team.totalLinesOfCode, 0)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Total Lines of Code</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-2xl font-bold">{violations.length}</span>
                </div>
                <div className="text-sm text-gray-400">Active Violations</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {participants.slice(0, 5).map(participant => (
                  <div key={participant.userId} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(participant.status)}>
                        {getStatusIcon(participant.status)}
                      </div>
                      <div>
                        <div className="font-medium">{participant.userName}</div>
                        <div className="text-xs text-gray-400">{participant.teamName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{participant.currentFile}</div>
                      <div className="text-xs text-gray-500">{getRelativeTime(participant.lastActivity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'participants' && (
          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.userId} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${getStatusColor(participant.status)} flex items-center gap-2`}>
                      {getStatusIcon(participant.status)}
                      <span className="font-semibold">{participant.userName}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{participant.teamName}</span>
                  </div>
                  <div className="text-sm text-gray-400">{getRelativeTime(participant.lastActivity)}</div>
                </div>

                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-400">Lines of Code</div>
                    <div className="text-lg font-bold text-blue-400">{participant.linesOfCode}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Commits</div>
                    <div className="text-lg font-bold text-green-400">{participant.commits}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Keystrokes</div>
                    <div className="text-lg font-bold text-purple-400">{participant.keystrokes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Screen Time</div>
                    <div className="text-lg font-bold text-yellow-400">{participant.screenTime}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Violations</div>
                    <div className={`text-lg font-bold ${participant.violations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {participant.violations}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-400">
                  <Code className="w-4 h-4 inline mr-1" />
                  Currently editing: <span className="text-gray-200">{participant.currentFile}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'teams' && (
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.teamId} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{team.teamName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                      {team.members} members
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      team.healthScore >= 80 ? 'bg-green-900/30 text-green-400' :
                      team.healthScore >= 60 ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {team.healthScore}% Health
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{team.totalLinesOfCode}</div>
                    <div className="text-xs text-gray-400">Lines of Code</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{team.totalCommits}</div>
                    <div className="text-xs text-gray-400">Total Commits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{team.filesCreated}</div>
                    <div className="text-xs text-gray-400">Files Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-300">{getRelativeTime(team.lastActivity)}</div>
                    <div className="text-xs text-gray-400">Last Activity</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'violations' && (
          <div className="space-y-2">
            {violations.length === 0 ? (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-400">No Violations Detected</div>
                <div className="text-sm text-gray-400 mt-1">All participants are following the rules</div>
              </div>
            ) : (
              violations.map(violation => (
                <div key={violation.id} className={`rounded-lg border p-4 ${getSeverityColor(violation.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">{violation.userName}</span>
                        <span className="px-2 py-0.5 bg-gray-900/50 rounded text-xs">{violation.teamName}</span>
                      </div>
                      <div className="text-sm opacity-75">
                        {violation.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase font-semibold">{violation.severity} Severity</div>
                      <div className="text-xs opacity-75 mt-1">{getRelativeTime(violation.timestamp)}</div>
                    </div>
                  </div>
                  <div className="text-sm mt-2 bg-gray-900/30 rounded p-2">
                    Participant attempted to {violation.type.replace('_', ' ')} during lockdown period
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
