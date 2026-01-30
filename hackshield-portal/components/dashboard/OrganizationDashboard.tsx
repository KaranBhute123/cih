'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Users, 
  Clock, 
  Plus,
  BarChart3,
  Eye,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Award,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface Hackathon {
  _id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  registeredTeams: string[];
  totalPrizePool: number;
}

export default function OrganizationDashboard() {
  const [myHackathons, setMyHackathons] = useState<Hackathon[]>([]);
  const [stats, setStats] = useState({
    totalHackathons: 0,
    totalParticipants: 0,
    activeEvents: 0,
    totalPrizeDistributed: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/hackathons/my');
      if (res.ok) {
        const data = await res.json();
        setMyHackathons(data.hackathons || []);
        
        // Calculate stats
        const hackathons = data.hackathons || [];
        setStats({
          totalHackathons: hackathons.length,
          totalParticipants: hackathons.reduce((acc: number, h: Hackathon) => acc + (h.registeredTeams?.length || 0), 0),
          activeEvents: hackathons.filter((h: Hackathon) => h.status === 'active').length,
          totalPrizeDistributed: hackathons
            .filter((h: Hackathon) => h.status === 'completed')
            .reduce((acc: number, h: Hackathon) => acc + (h.totalPrizePool || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickStats = [
    { 
      label: 'Total Hackathons', 
      value: stats.totalHackathons, 
      icon: Trophy, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    { 
      label: 'Total Participants', 
      value: stats.totalParticipants * 3, // Approximate team members
      icon: Users, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    { 
      label: 'Active Events', 
      value: stats.activeEvents, 
      icon: Clock, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    { 
      label: 'Prizes Distributed', 
      value: `$${stats.totalPrizeDistributed.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'published': return 'badge-primary';
      case 'judging': return 'badge-warning';
      case 'completed': return 'bg-dark-600 text-dark-300';
      default: return 'bg-dark-700 text-dark-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-primary-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/20 p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg backdrop-blur-sm">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Industry Portal
              </h1>
            </div>
            <p className="text-dark-300 text-lg">
              Manage your events and discover talent.
            </p>
          </div>
          <Link 
            href="/dashboard/hackathons/create" 
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-primary-600 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Host Hackathon
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-primary-400 opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
          </Link>
        </div>
      </div>

      {/* Stats Grid with Glass Effect */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden rounded-xl bg-dark-900/50 backdrop-blur-xl border border-dark-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-dark-400 font-medium">{stat.label}</div>
                <div className="text-3xl font-bold bg-gradient-to-br from-white to-dark-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Hackathons Table */}
      <div className="rounded-xl bg-dark-900/50 backdrop-blur-xl border border-dark-700/50 overflow-hidden">
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">Your Active Events</h2>
            </div>
            <Link href="/dashboard/manage" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 group">
              View All 
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {myHackathons.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
              <div className="relative p-6 bg-dark-800/50 rounded-full">
                <Trophy className="w-16 h-16 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No events created yet.</h3>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Start by creating your first hackathon to manage events and discover amazing talent.
            </p>
            <Link 
              href="/dashboard/hackathons/create" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-primary-600 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left py-4 px-6 text-dark-400 font-semibold text-sm uppercase tracking-wider">Event Name</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-semibold text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-semibold text-sm uppercase tracking-wider">Participants</th>
                  <th className="text-right py-4 px-6 text-dark-400 font-semibold text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {myHackathons.map((hackathon, index) => (
                  <tr 
                    key={hackathon._id} 
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-5 px-6">
                      <Link 
                        href={`/dashboard/hackathons/${hackathon._id}`}
                        className="font-semibold hover:text-purple-400 transition-colors flex items-center gap-2 group/link"
                      >
                        {hackathon.title}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                      <div className="text-sm text-dark-400 mt-1">
                        {new Date(hackathon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(hackathon.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        {hackathon.status}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, hackathon.registeredTeams?.length || 0))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-primary-500 border-2 border-dark-900 flex items-center justify-center text-xs font-semibold">
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {hackathon.registeredTeams?.length || 0} teams
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/hackathons/${hackathon._id}`}
                          className="p-2.5 hover:bg-dark-700 rounded-lg transition-all hover:scale-110 group/btn"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-dark-400 group-hover/btn:text-primary-400" />
                        </Link>
                        <Link
                          href={`/dashboard/organization/hackathons/${hackathon._id}/monitor`}
                          className="p-2.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-all hover:scale-110 group/btn"
                          title="Live Monitor"
                        >
                          <Eye className="w-4 h-4 text-green-400" />
                        </Link>
                        <Link
                          href={`/dashboard/hackathons/${hackathon._id}/analytics`}
                          className="p-2.5 hover:bg-dark-700 rounded-lg transition-all hover:scale-110 group/btn"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4 text-dark-400 group-hover/btn:text-purple-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions with Hover Effects */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            href: '/dashboard/hackathons/create',
            icon: Plus,
            title: 'Create Hackathon',
            desc: 'Set up a new coding competition',
            gradient: 'from-purple-500/10 to-primary-500/10',
            hoverGradient: 'from-purple-500/20 to-primary-500/20',
            iconColor: 'text-purple-400',
          },
          {
            href: '/dashboard/monitor',
            icon: Eye,
            title: 'Live Monitor',
            desc: 'Watch teams code in real-time',
            gradient: 'from-green-500/10 to-emerald-500/10',
            hoverGradient: 'from-green-500/20 to-emerald-500/20',
            iconColor: 'text-green-400',
          },
          {
            href: '/dashboard/judging',
            icon: Award,
            title: 'Judging Panel',
            desc: 'Review and score submissions',
            gradient: 'from-yellow-500/10 to-orange-500/10',
            hoverGradient: 'from-yellow-500/20 to-orange-500/20',
            iconColor: 'text-yellow-400',
          },
        ].map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group relative overflow-hidden rounded-xl bg-dark-900/50 backdrop-blur-xl border border-dark-700/50 p-8 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} group-hover:${action.hoverGradient} transition-all duration-300`}></div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <action.icon className={`w-8 h-8 ${action.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">{action.title}</h3>
              <p className="text-dark-400 text-sm">{action.desc}</p>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Top Talent Section */}
      <div className="rounded-xl bg-dark-900/50 backdrop-blur-xl border border-dark-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-primary-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold">Top Talent Found</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Sarah Jenks', role: 'Full Stack Dev', score: 98, color: 'from-purple-500 to-pink-500' },
            { name: 'Mike Chen', role: 'AI Researcher', score: 95, color: 'from-blue-500 to-cyan-500' },
            { name: 'Priya Patel', role: 'UI/UX Designer', score: 92, color: 'from-green-500 to-emerald-500' },
          ].map((talent, index) => (
            <div 
              key={index}
              className="group flex items-center gap-4 p-4 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 border border-dark-700/30 hover:border-purple-500/30 transition-all duration-300 hover:-translate-x-1"
            >
              <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${talent.color} flex items-center justify-center font-bold text-lg shadow-lg`}>
                {talent.name.charAt(0)}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
              
              <div className="flex-1">
                <div className="font-semibold group-hover:text-purple-400 transition-colors">{talent.name}</div>
                <div className="text-sm text-dark-400">{talent.role}</div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {talent.score}%
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-dark-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="rounded-xl bg-dark-900/50 backdrop-blur-xl border border-dark-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold">Recent Alerts</h2>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">No active alerts at this time</p>
            <p className="text-xs text-dark-400 mt-1">Alerts will appear here when hackathons are active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

