'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Users, 
  Crown, 
  Settings, 
  Plus, 
  Copy, 
  Check,
  Mail,
  Code,
  Code2,
  MessageSquare,
  Calendar,
  Trophy,
  ExternalLink,
  UserPlus,
  UserMinus,
  Shield,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'leader' | 'member';
  joinedAt: string;
}

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
  members: TeamMember[];
  inviteCode: string;
  project: {
    title: string;
    description: string;
    repoUrl?: string;
    demoUrl?: string;
  };
  securityViolations: {
    type: string;
    timestamp: string;
    description: string;
    severity: string;
  }[];
  scores: {
    criteriaId: string;
    score: number;
    feedback: string;
  }[];
  totalScore: number;
  rank?: number;
  status: string;
}

export default function TeamDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
  });

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      const data = await res.json();
      if (res.ok && data.team) {
        setTeam(data.team);
        setProjectForm({
          title: data.team.project?.title || '',
          description: data.team.project?.description || '',
          repoUrl: data.team.project?.repoUrl || '',
          demoUrl: data.team.project?.demoUrl || '',
        });
      } else {
        toast.error('Team not found');
        router.push('/dashboard/teams');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.inviteCode);
      setInviteCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Invitation sent!');
        setShowInviteModal(false);
        setInviteEmail('');
      } else {
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/project`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Project updated!');
        setEditingProject(false);
        fetchTeam();
      } else {
        toast.error(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      const res = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Left team successfully');
        router.push('/dashboard/teams');
      } else {
        toast.error(data.error || 'Failed to leave team');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    }
  };

  const isLeader = team?.members.some(
    m => m.user._id === session?.user?.id && m.role === 'leader'
  );

  const isMember = team?.members.some(m => m.user._id === session?.user?.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeUntilStart = () => {
    if (!team) return '';
    const now = new Date();
    const start = new Date(team.hackathon.startDate);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h until start`;
    return `${hours}h until start`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Team not found</h2>
        <Link href="/dashboard/teams" className="btn-primary mt-4">
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link href="/dashboard/teams" className="flex items-center gap-2 text-dark-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Teams
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-400" />
            {team.name}
          </h1>
          <Link 
            href={`/dashboard/hackathons/${team.hackathon._id}`}
            className="text-dark-400 hover:text-primary-400 flex items-center gap-2 mt-2"
          >
            Participating in: {team.hackathon.title}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {(team.hackathon.status === 'active' || team.hackathon.status === 'published') && isMember && (
            <Link
              href={`/dashboard/ide?team=${team._id}`}
              className="btn-primary flex items-center gap-2"
            >
              <Code2 className="w-5 h-5" />
              {team.hackathon.status === 'active' ? 'Start Coding' : 'Practice Mode'}
            </Link>
          )}
          
          {isLeader && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Users className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{team.members.length}</div>
              <div className="text-sm text-dark-400">Members</div>
            </div>
            <div className="card p-4 text-center">
              <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold">{getTimeUntilStart()}</div>
              <div className="text-sm text-dark-400">Status</div>
            </div>
            <div className="card p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{team.totalScore || '-'}</div>
              <div className="text-sm text-dark-400">Score</div>
            </div>
            <div className="card p-4 text-center">
              <Shield className={`w-6 h-6 mx-auto mb-2 ${team.securityViolations?.length > 0 ? 'text-red-400' : 'text-green-400'}`} />
              <div className="text-2xl font-bold">{team.securityViolations?.length || 0}</div>
              <div className="text-sm text-dark-400">Violations</div>
            </div>
          </div>

          {/* Project Details */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary-400" />
                Project
              </h2>
              {isLeader && !editingProject && (
                <button
                  onClick={() => setEditingProject(true)}
                  className="btn-secondary text-sm"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingProject ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="Your project name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe your project"
                    className="input-field min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Repository URL</label>
                    <input
                      type="url"
                      value={projectForm.repoUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Demo URL</label>
                    <input
                      type="url"
                      value={projectForm.demoUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdateProject} className="btn-primary">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingProject(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {team.project?.title ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">{team.project.title}</h3>
                    <p className="text-dark-300 mb-4">{team.project.description}</p>
                    <div className="flex gap-4">
                      {team.project.repoUrl && (
                        <a
                          href={team.project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Repository
                        </a>
                      )}
                      {team.project.demoUrl && (
                        <a
                          href={team.project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-dark-400">
                    <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No project details yet</p>
                    {isLeader && (
                      <button
                        onClick={() => setEditingProject(true)}
                        className="btn-primary mt-4"
                      >
                        Add Project Details
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Chat */}
          <div className="card p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary-400" />
              Team Chat
            </h2>
            <div className="bg-dark-800 rounded-lg p-4 min-h-[200px] flex items-center justify-center text-dark-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Team chat is available in the IDE</p>
                {team.hackathon.status === 'active' && (
                  <Link href={`/dashboard/ide?team=${team._id}`} className="btn-primary mt-4">
                    Open IDE to Chat
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Security Violations */}
          {team.securityViolations && team.securityViolations.length > 0 && (
            <div className="card p-6 border border-red-500/30">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-red-400">
                <Shield className="w-5 h-5" />
                Security Violations
              </h2>
              <div className="space-y-3">
                {team.securityViolations.map((violation, index) => (
                  <div key={index} className="p-3 bg-red-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{violation.type.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        violation.severity === 'high' ? 'bg-red-500 text-white' :
                        violation.severity === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-gray-500 text-white'
                      }`}>
                        {violation.severity}
                      </span>
                    </div>
                    <p className="text-sm text-dark-300">{violation.description}</p>
                    <p className="text-xs text-dark-400 mt-1">{formatDate(violation.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-400" />
              Team Members
            </h3>
            <div className="space-y-3">
              {team.members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    {member.user.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.user.name}</span>
                      {member.role === 'leader' && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <span className="text-xs text-dark-400">{member.user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Code */}
          {isLeader && (
            <div className="card p-6">
              <h3 className="font-bold mb-4">Invite Code</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-dark-800 px-4 py-2 rounded font-mono text-sm">
                  {team.inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-2 hover:bg-dark-700 rounded"
                >
                  {inviteCopied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-2">
                Share this code with others to let them join your team
              </p>
            </div>
          )}

          {/* Hackathon Info */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Hackathon</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Status</span>
                <span className={`badge ${
                  team.hackathon.status === 'active' ? 'badge-success' :
                  team.hackathon.status === 'upcoming' ? 'badge-primary' :
                  'badge-gray'
                }`}>
                  {team.hackathon.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Starts</span>
                <span>{formatDate(team.hackathon.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Ends</span>
                <span>{formatDate(team.hackathon.endDate)}</span>
              </div>
            </div>
            <Link
              href={`/dashboard/hackathons/${team.hackathon._id}`}
              className="btn-secondary w-full mt-4 text-center"
            >
              View Hackathon
            </Link>
          </div>

          {/* Leave Team */}
          {isMember && !isLeader && (
            <button
              onClick={handleLeaveTeam}
              className="btn-secondary w-full text-red-400 hover:text-red-300"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Leave Team
            </button>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="input-field"
                />
              </div>

              <div className="text-center py-4">
                <span className="text-dark-400">or share the invite code</span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <code className="bg-dark-800 px-4 py-2 rounded font-mono">
                    {team.inviteCode}
                  </code>
                  <button onClick={copyInviteCode} className="p-2 hover:bg-dark-700 rounded">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="btn-primary flex-1"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
