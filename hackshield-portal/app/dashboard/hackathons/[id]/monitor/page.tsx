'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Users, 
  Code2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  MessageSquare,
  RefreshCw,
  Loader2,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';

interface TeamStatus {
  _id: string;
  name: string;
  membersOnline: number;
  totalMembers: number;
  linesOfCode: number;
  commits: number;
  lastActivity: string;
  aiUsage: number;
  warnings: number;
  healthScore: number;
}

interface Alert {
  id: string;
  type: 'high' | 'medium' | 'low';
  team: string;
  message: string;
  timestamp: string;
}

export default function MonitorHackathonPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<TeamStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    teamsOnline: 0,
    totalLinesOfCode: 0,
    avgHealthScore: 0,
  });
  
  useEffect(() => {
    fetchMonitorData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMonitorData, 10000);
    return () => clearInterval(interval);
  }, [hackathonId]);
  
  const fetchMonitorData = async () => {
    try {
      // Mock data for demonstration
      const mockTeams: TeamStatus[] = [
        { _id: '1', name: 'CodeNinjas', membersOnline: 4, totalMembers: 4, linesOfCode: 2341, commits: 47, lastActivity: '2 min ago', aiUsage: 18, warnings: 0, healthScore: 94 },
        { _id: '2', name: 'ByteSquad', membersOnline: 3, totalMembers: 4, linesOfCode: 1892, commits: 35, lastActivity: '5 min ago', aiUsage: 25, warnings: 1, healthScore: 85 },
        { _id: '3', name: 'AlphaDevs', membersOnline: 4, totalMembers: 4, linesOfCode: 3102, commits: 62, lastActivity: '1 min ago', aiUsage: 48, warnings: 0, healthScore: 72 },
        { _id: '4', name: 'TechTitans', membersOnline: 2, totalMembers: 3, linesOfCode: 1456, commits: 28, lastActivity: '8 min ago', aiUsage: 12, warnings: 0, healthScore: 91 },
        { _id: '5', name: 'InnovatorsX', membersOnline: 4, totalMembers: 4, linesOfCode: 2789, commits: 54, lastActivity: '3 min ago', aiUsage: 22, warnings: 0, healthScore: 88 },
      ];
      
      const mockAlerts: Alert[] = [
        { id: '1', type: 'medium', team: 'AlphaDevs', message: 'AI Dependency High (48%)', timestamp: '5 min ago' },
        { id: '2', type: 'low', team: 'ByteSquad', message: 'Tab switched 3 times', timestamp: '12 min ago' },
      ];
      
      setTeams(mockTeams);
      setAlerts(mockAlerts);
      setStats({
        totalTeams: mockTeams.length,
        teamsOnline: mockTeams.filter(t => t.membersOnline > 0).length,
        totalLinesOfCode: mockTeams.reduce((acc, t) => acc + t.linesOfCode, 0),
        avgHealthScore: Math.round(mockTeams.reduce((acc, t) => acc + t.healthScore, 0) / mockTeams.length),
      });
    } catch (error) {
      console.error('Error fetching monitor data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getAIUsageColor = (usage: number) => {
    if (usage <= 20) return 'bg-green-500';
    if (usage <= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/manage"
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400 animate-pulse" />
              Live Monitor
            </h1>
            <p className="text-dark-400">Real-time hackathon command center</p>
          </div>
        </div>
        <button 
          onClick={fetchMonitorData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.teamsOnline}/{stats.totalTeams}</div>
              <div className="text-sm text-dark-400">Teams Online</div>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Code2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalLinesOfCode.toLocaleString()}</div>
              <div className="text-sm text-dark-400">Lines of Code</div>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.avgHealthScore}%</div>
              <div className="text-sm text-dark-400">Avg Health Score</div>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-dark-400">Active Alerts</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Status Table */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" />
            Team Live Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-2 text-dark-400 font-medium">Team</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">Online</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">LOC</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">Commits</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">AI %</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">Health</th>
                  <th className="text-center py-3 px-2 text-dark-400 font-medium">⚠</th>
                  <th className="text-right py-3 px-2 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team._id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-3 px-2 font-medium">{team.name}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={team.membersOnline === team.totalMembers ? 'text-green-400' : 'text-yellow-400'}>
                        {team.membersOnline}/{team.totalMembers}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">{team.linesOfCode.toLocaleString()}</td>
                    <td className="py-3 px-2 text-center">{team.commits}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getAIUsageColor(team.aiUsage)}`}
                            style={{ width: `${team.aiUsage}%` }}
                          />
                        </div>
                        <span className="text-xs">{team.aiUsage}%</span>
                      </div>
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${getHealthColor(team.healthScore)}`}>
                      {team.healthScore}%
                    </td>
                    <td className="py-3 px-2 text-center">
                      {team.warnings > 0 ? (
                        <span className="text-red-400">{team.warnings}/3</span>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 rounded bg-dark-700 hover:bg-dark-600 transition-colors mr-1" title="View IDE">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded bg-dark-700 hover:bg-dark-600 transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Alerts Panel */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            Neural Fairness Alerts
          </h2>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-dark-400">All clear! No alerts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    alert.type === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs font-semibold uppercase ${
                      alert.type === 'high' ? 'text-red-400' :
                      alert.type === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {alert.type} priority
                    </span>
                    <span className="text-xs text-dark-500">{alert.timestamp}</span>
                  </div>
                  <p className="font-medium mb-1">{alert.team}</p>
                  <p className="text-sm text-dark-400">{alert.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600 transition-colors">
                      View Evidence
                    </button>
                    <button className="text-xs px-2 py-1 bg-dark-700 rounded hover:bg-dark-600 transition-colors">
                      Contact Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Timeline */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-400" />
          Activity Heatmap (24 Hours)
        </h2>
        <div className="h-32 flex items-end gap-1">
          {Array.from({ length: 24 }, (_, i) => {
            const height = Math.random() * 100;
            return (
              <div 
                key={i}
                className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:opacity-80"
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${i}:00 - ${Math.round(height)}% activity`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-dark-500">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}
