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
  TrendingUp
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-br from-purple-900/50 to-primary-900/50 border-purple-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Organization Dashboard 🏢
            </h1>
            <p className="text-dark-300">
              Manage your hackathons, monitor teams, and track engagement.
            </p>
          </div>
          <Link href="/dashboard/hackathons/create" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Hackathon
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Hackathons */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            My Hackathons
          </h2>
          <Link href="/dashboard/manage" className="text-primary-400 hover:text-primary-300 text-sm">
            View All →
          </Link>
        </div>

        {myHackathons.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hackathons yet</h3>
            <p className="text-dark-400 mb-6">Create your first hackathon to get started.</p>
            <Link href="/dashboard/hackathons/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Hackathon
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Hackathon</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Teams</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Prize Pool</th>
                  <th className="text-right py-3 px-4 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myHackathons.map((hackathon) => (
                  <tr key={hackathon._id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-4 px-4">
                      <Link 
                        href={`/dashboard/hackathons/${hackathon._id}`}
                        className="font-medium hover:text-primary-400 transition-colors"
                      >
                        {hackathon.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-dark-400" />
                        {hackathon.registeredTeams?.length || 0}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-dark-300">
                      {new Date(hackathon.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-accent-400 font-medium">
                      ${hackathon.totalPrizePool?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/hackathons/${hackathon._id}`}
                          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-dark-400" />
                        </Link>
                        <Link
                          href={`/dashboard/hackathons/${hackathon._id}/analytics`}
                          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4 text-dark-400" />
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

      {/* Quick Actions Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/hackathons/create"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create Hackathon</h3>
          <p className="text-dark-400 text-sm">Set up a new coding competition</p>
        </Link>

        <Link 
          href="/dashboard/monitor"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Eye className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Monitor</h3>
          <p className="text-dark-400 text-sm">Watch teams code in real-time</p>
        </Link>

        <Link 
          href="/dashboard/judging"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Judging Panel</h3>
          <p className="text-dark-400 text-sm">Review and score submissions</p>
        </Link>
      </div>

      {/* Alerts/Notifications Preview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Recent Alerts
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm">No active alerts at this time</p>
              <p className="text-xs text-dark-400">Alerts will appear here when hackathons are active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
