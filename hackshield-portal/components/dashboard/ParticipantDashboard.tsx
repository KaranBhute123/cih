'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Users, 
  Clock, 
  Code2, 
  Star, 
  TrendingUp,
  Calendar,
  Zap,
  Target,
  Medal
} from 'lucide-react';

interface Hackathon {
  _id: string;
  title: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrizePool: number;
}

interface Team {
  _id: string;
  name: string;
  hackathon: {
    title: string;
  };
  members: any[];
  status: string;
}

export default function ParticipantDashboard() {
  const [upcomingHackathons, setUpcomingHackathons] = useState<Hackathon[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState({
    hackathonsJoined: 0,
    projectsCreated: 0,
    totalXP: 50,
    level: 1,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch upcoming hackathons
      const hackathonsRes = await fetch('/api/hackathons?status=published&limit=5');
      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json();
        setUpcomingHackathons(data.hackathons || []);
      }

      // Fetch user stats
      const statsRes = await fetch('/api/user/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      // Fetch my teams
      const teamsRes = await fetch('/api/teams/my');
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setMyTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickStats = [
    { 
      label: 'Hackathons Joined', 
      value: stats.hackathonsJoined, 
      icon: Trophy, 
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
    },
    { 
      label: 'Projects Created', 
      value: stats.projectsCreated, 
      icon: Code2, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    { 
      label: 'Total XP', 
      value: stats.totalXP, 
      icon: Star, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    { 
      label: 'Current Level', 
      value: stats.level, 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-br from-primary-900/50 to-secondary-900/50 border-primary-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-dark-300">
              Ready to build something amazing? Browse hackathons or continue working on your projects.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/hackathons" className="btn-primary">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Hackathons
            </Link>
            <Link href="/dashboard/teams" className="btn-secondary">
              <Users className="w-4 h-4 mr-2" />
              My Teams
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} 
                  style={{ color: stat.color.includes('yellow') ? '#f59e0b' : 
                           stat.color.includes('blue') ? '#3b82f6' :
                           stat.color.includes('purple') ? '#a855f7' : '#22c55e' }} 
                />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Hackathons */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Upcoming Hackathons
            </h2>
            <Link href="/dashboard/hackathons" className="text-primary-400 hover:text-primary-300 text-sm">
              View All →
            </Link>
          </div>
          
          {upcomingHackathons.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400">No upcoming hackathons found.</p>
              <Link href="/dashboard/hackathons" className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block">
                Browse all hackathons →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingHackathons.slice(0, 4).map((hackathon) => (
                <Link
                  key={hackathon._id}
                  href={`/dashboard/hackathons/${hackathon._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors">
                      {hackathon.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-dark-400">
                      <span className="badge-primary">{hackathon.theme}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent-400 font-medium">
                      ${hackathon.totalPrizePool?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-dark-400">Prize Pool</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Teams */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              My Teams
            </h2>
            <Link href="/dashboard/teams" className="text-primary-400 hover:text-primary-300 text-sm">
              View All →
            </Link>
          </div>

          {myTeams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400">You haven't joined any teams yet.</p>
              <Link href="/dashboard/hackathons" className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block">
                Find a hackathon to join →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myTeams.slice(0, 4).map((team) => (
                <Link
                  key={team._id}
                  href={`/dashboard/teams/${team._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-sm text-dark-400 truncate">
                      {team.hackathon?.title || 'Unknown Hackathon'}
                    </p>
                  </div>
                  <div>
                    <span className={`badge ${
                      team.status === 'active' ? 'badge-success' :
                      team.status === 'submitted' ? 'badge-primary' :
                      'badge-warning'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/hackathons"
            className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
          >
            <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="font-medium group-hover:text-primary-400 transition-colors">
              Join Hackathon
            </h3>
            <p className="text-sm text-dark-400 mt-1">Browse and register for events</p>
          </Link>
          <Link
            href="/dashboard/teams/create"
            className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-medium group-hover:text-primary-400 transition-colors">
              Create Team
            </h3>
            <p className="text-sm text-dark-400 mt-1">Form a new team for hackathons</p>
          </Link>
          <Link
            href="/dashboard/match"
            className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
          >
            <Target className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-medium group-hover:text-primary-400 transition-colors">
              Find Teammates
            </h3>
            <p className="text-sm text-dark-400 mt-1">Smart matching with other devs</p>
          </Link>
          <Link
            href="/dashboard/profile"
            className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
          >
            <Medal className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-medium group-hover:text-primary-400 transition-colors">
              View Profile
            </h3>
            <p className="text-sm text-dark-400 mt-1">Update skills and portfolio</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
