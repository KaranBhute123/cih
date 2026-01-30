'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Calendar,
  Trophy,
  Play,
  Code,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  hackathon: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  members: {
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }[];
  project?: {
    title: string;
  };
  status: string;
  totalScore?: number;
}

export default function TeamsPage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams/my');
      const data = await res.json();
      if (res.ok && data.teams) {
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode }),
      });

      const data = await res.json();
      if (res.ok && data.team) {
        toast.success('Joined team successfully!');
        setShowJoinModal(false);
        setJoinCode('');
        fetchTeams();
      } else {
        toast.error(data.error || 'Failed to join team');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'badge-success',
      upcoming: 'badge-primary',
      ended: 'badge-gray',
      eliminated: 'badge-danger',
    };
    return styles[status] || 'badge-gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="text-dark-400">Manage your hackathon teams</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Join with Code
          </button>
          <Link href="/dashboard/hackathons" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Find Hackathon
          </Link>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Teams Yet</h2>
          <p className="text-dark-400 mb-6">
            Join a hackathon to create or join a team
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              Join with Invite Code
            </button>
            <Link href="/dashboard/hackathons" className="btn-primary">
              Browse Hackathons
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team._id}
              href={`/dashboard/teams/${team._id}`}
              className="card p-6 hover:border-primary-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-primary-400 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-sm text-dark-400">{team.hackathon.title}</p>
                </div>
                <span className={`${getStatusBadge(team.hackathon.status)}`}>
                  {team.hackathon.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-dark-300">
                  <Users className="w-4 h-4 text-primary-400" />
                  <span>{team.members.length} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-300">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span>
                    {formatDate(team.hackathon.startDate)} - {formatDate(team.hackathon.endDate)}
                  </span>
                </div>
                {team.project?.title && (
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="truncate">{team.project.title}</span>
                  </div>
                )}
                {team.totalScore !== undefined && team.totalScore > 0 && (
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Score: {team.totalScore}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold border-2 border-dark-800"
                    >
                      {member.user.name?.[0] || '?'}
                    </div>
                  ))}
                  {team.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs border-2 border-dark-800">
                      +{team.members.length - 4}
                    </div>
                  )}
                </div>
                
                {team.hackathon.status === 'active' && (
                  <span className="flex items-center gap-1 text-sm text-primary-400">
                    <Play className="w-4 h-4" />
                    Open IDE
                  </span>
                )}
                
                <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Join a Team</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invite Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="input-field font-mono text-center text-lg tracking-wider"
                  maxLength={8}
                />
                <p className="text-sm text-dark-400 mt-2">
                  Ask your team leader for the invite code
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={joining || !joinCode.trim()}
                className="btn-primary flex-1"
              >
                {joining ? 'Joining...' : 'Join Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
