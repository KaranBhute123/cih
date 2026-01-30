'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Eye,
  Activity,
  Code,
  Terminal as TerminalIcon,
  FileCode,
  AlertTriangle,
  Users,
  Clock,
  Cpu,
  RefreshCw,
  Filter,
  Download,
  Play,
  Pause,
  ChevronLeft,
  Zap,
  Shield,
  Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamActivity {
  _id: string;
  teamId: string;
  teamName: string;
  participantName: string;
  activityType: 'code_change' | 'file_created' | 'file_deleted' | 'terminal_command' | 'ai_query' | 'violation' | 'save' | 'execute';
  details: string;
  timestamp: Date;
  severity?: 'info' | 'warning' | 'critical';
}

interface TeamStatus {
  teamId: string;
  teamName: string;
  teamLeader: string;
  isActive: boolean;
  lastActivity: Date;
  filesCount: number;
  violations: number;
  strikeCount: number;
  sessionDuration: string;
}

export default function LiveMonitorPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<any>(null);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const activitiesRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchHackathonDetails();
    fetchTeamStatuses();
    startPolling();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [params.id]);

  useEffect(() => {
    if (autoScroll && activitiesRef.current) {
      activitiesRef.current.scrollTop = activitiesRef.current.scrollHeight;
    }
  }, [activities, autoScroll]);

  const fetchHackathonDetails = async () => {
    try {
      const res = await fetch(`/api/hackathons/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setHackathon(data.hackathon || data);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    }
  };

  const fetchTeamStatuses = async () => {
    try {
      const res = await fetch(`/api/hackathons/${params.id}/monitor/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeamStatuses(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching team statuses:', error);
    }
  };

  const fetchActivities = async () => {
    if (isPaused) return;

    try {
      const url = new URL(`${window.location.origin}/api/hackathons/${params.id}/monitor/activities`);
      if (selectedTeam !== 'all') {
        url.searchParams.append('teamId', selectedTeam);
      }
      if (activityFilter !== 'all') {
        url.searchParams.append('type', activityFilter);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const startPolling = () => {
    fetchActivities();
    pollInterval.current = setInterval(() => {
      fetchActivities();
      fetchTeamStatuses();
    }, 3000); // Poll every 3 seconds
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'code_change':
        return <Code className="w-4 h-4" />;
      case 'file_created':
        return <FileCode className="w-4 h-4" />;
      case 'file_deleted':
        return <FileCode className="w-4 h-4 text-red-400" />;
      case 'terminal_command':
        return <TerminalIcon className="w-4 h-4" />;
      case 'ai_query':
        return <Bot className="w-4 h-4" />;
      case 'violation':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'execute':
        return <Play className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'violation':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'ai_query':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'execute':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'terminal_command':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const exportActivities = () => {
    const csvContent = [
      ['Timestamp', 'Team', 'Participant', 'Activity Type', 'Details'],
      ...activities.map(a => [
        new Date(a.timestamp).toLocaleString(),
        a.teamName,
        a.participantName,
        a.activityType,
        a.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon?.title || 'hackathon'}_activities_${Date.now()}.csv`;
    a.click();
    toast.success('Activities exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Live Monitoring</h1>
                  <p className="text-dark-300">{hackathon?.title || 'Loading...'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isPaused
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </button>

                <button
                  onClick={exportActivities}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Team Status */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-white">Active Teams</h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTeam('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTeam === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  All Teams ({teamStatuses.length})
                </button>

                {teamStatuses.map((team) => (
                  <button
                    key={team.teamId}
                    onClick={() => setSelectedTeam(team.teamId)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTeam === team.teamId
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          team.isActive ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium truncate">{team.teamName}</span>
                      </div>
                      {team.violations > 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                          {team.violations}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-dark-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {team.sessionDuration}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-white">Activity Filter</h3>
              </div>

              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Activities</option>
                <option value="code_change">Code Changes</option>
                <option value="file_created">File Created</option>
                <option value="terminal_command">Terminal</option>
                <option value="ai_query">AI Usage</option>
                <option value="violation">Violations</option>
                <option value="execute">Code Execution</option>
              </select>

              <label className="flex items-center gap-2 mt-3 text-sm text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                />
                Auto-scroll
              </label>
            </div>
          </div>

          {/* Main Content - Activity Feed */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-400" />
                  <h3 className="font-semibold text-white">Live Activity Feed</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    {isPaused ? 'PAUSED' : 'LIVE'}
                  </span>
                </div>

                <button
                  onClick={fetchActivities}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div
                ref={activitiesRef}
                className="space-y-2 h-[600px] overflow-y-auto custom-scrollbar"
              >
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-dark-400">
                    <Activity className="w-12 h-12 mb-2" />
                    <p>No activities yet. Waiting for team actions...</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity._id}
                      className={`border rounded-lg p-4 transition-all hover:scale-[1.01] ${getActivityColor(
                        activity.activityType
                      )}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.activityType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-sm">
                                {activity.teamName}
                              </span>
                              <span className="text-xs text-dark-400">•</span>
                              <span className="text-xs text-dark-400">
                                {activity.participantName}
                              </span>
                            </div>
                            <span className="text-xs text-dark-400">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-sm break-words">{activity.details}</p>

                          {activity.activityType === 'violation' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                              <Shield className="w-3 h-3" />
                              <span>Security Alert - Immediate attention required</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Code className="w-4 h-4" />
                  <span className="text-xs">Code Changes</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {activities.filter(a => a.activityType === 'code_change').length}
                </p>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <TerminalIcon className="w-4 h-4" />
                  <span className="text-xs">Commands</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {activities.filter(a => a.activityType === 'terminal_command').length}
                </p>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs">AI Queries</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {activities.filter(a => a.activityType === 'ai_query').length}
                </p>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Violations</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {activities.filter(a => a.activityType === 'violation').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
