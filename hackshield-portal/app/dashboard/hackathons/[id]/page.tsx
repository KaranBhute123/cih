'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  MapPin, 
  Globe, 
  Tag,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Star,
  Share2,
  Heart,
  ExternalLink,
  Shield,
  Code,
  Briefcase,
  Award,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  organization: {
    _id: string;
    name: string;
    organization?: {
      name: string;
      logo?: string;
    };
  };
  coverImage?: string;
  theme: string;
  mode: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeamSize: number;
  minTeamSize: number;
  prizes: {
    position: string;
    amount: number;
    description: string;
  }[];
  judgingCriteria: {
    name: string;
    weight: number;
    description: string;
  }[];
  rules: string[];
  allowedTechnologies: string[];
  sponsorTiers: {
    name: string;
    sponsors: {
      name: string;
      logo?: string;
      website?: string;
    }[];
  }[];
  timeline: {
    event: string;
    date: string;
    description: string;
  }[];
  status: string;
  currentParticipants: number;
  maxParticipants?: number;
  securitySettings: {
    lockdownMode: boolean;
    tabSwitchLimit: number;
    fullscreenRequired: boolean;
    codeRecording: boolean;
    aiProctoring: boolean;
    plagiarismCheck: boolean;
  };
}

interface Team {
  _id: string;
  name: string;
  members: {
    user: string;
    role: string;
  }[];
  ideCredentials?: {
    username: string;
    passkey: string;
    mainBranch: string;
    branches: Array<{
      name: string;
      createdBy: string;
      createdAt: Date;
    }>;
    credentialsSentAt?: Date;
    leaderActivated: boolean;
  };
}

export default function HackathonDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('new');
  const [isLiked, setIsLiked] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetchHackathon();
    if (session) {
      fetchMyTeams();
      checkUserRegistration();
    }
  }, [hackathonId, session]);

  const checkUserRegistration = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/team`);
      const data = await res.json();
      console.log('✅ Team check response:', data);
      if (res.ok && data.team) {
        setUserTeam(data.team);
        console.log('✅ User team FOUND:', data.team.name);
      } else {
        console.log('❌ No team found for user');
        setUserTeam(null);
      }
    } catch (error) {
      console.error('❌ Error checking registration:', error);
      setUserTeam(null);
    }
  };

  const fetchHackathon = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}`);
      const data = await res.json();
      if (res.ok && data.hackathon) {
        setHackathon(data.hackathon);
      } else {
        toast.error('Hackathon not found');
        router.push('/dashboard/hackathons');
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      toast.error('Failed to load hackathon');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      const res = await fetch('/api/teams/my');
      const data = await res.json();
      if (res.ok && data.teams) {
        setMyTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleRegister = async () => {
    if (!session) {
      toast.error('Please login to register');
      router.push('/auth/login');
      return;
    }

    if (session.user.role !== 'participant') {
      toast.error('Only participants can register for hackathons');
      return;
    }

    setRegistering(true);

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTeam === 'new' ? teamName : undefined,
          hackathonId,
          existingTeamId: selectedTeam !== 'new' ? selectedTeam : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.team) {
        toast.success('Successfully registered for hackathon!');
        setShowJoinModal(false);
        router.push(`/dashboard/teams/${data.team._id}`);
      } else {
        toast.error(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Failed to register for hackathon');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'Already started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours`;
  };

  const getTotalPrize = () => {
    if (!hackathon) return 0;
    return hackathon.prizes.reduce((sum, prize) => sum + prize.amount, 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'badge-primary',
      active: 'badge-success',
      ended: 'badge-gray',
      draft: 'badge-warning',
    };
    return styles[status] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Hackathon not found</h2>
        <Link href="/dashboard/hackathons" className="btn-primary mt-4">
          Back to Hackathons
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link href="/dashboard/hackathons" className="flex items-center gap-2 text-dark-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Hackathons
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div 
          className="h-64 bg-cover bg-center"
          style={{ 
            backgroundImage: hackathon.coverImage 
              ? `url(${hackathon.coverImage})` 
              : 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className={`${getStatusBadge(hackathon.status)} mb-2`}>
                {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
              </span>
              <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
              <p className="text-dark-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Organized by {hackathon.organization?.organization?.name || hackathon.organization?.name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-lg border ${isLiked ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-dark-700 hover:bg-dark-800'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-lg border border-dark-700 hover:bg-dark-800">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">${getTotalPrize().toLocaleString()}</div>
              <div className="text-sm text-dark-400">Total Prize</div>
            </div>
            <div className="card p-4 text-center">
              <Users className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{hackathon.currentParticipants}</div>
              <div className="text-sm text-dark-400">Participants</div>
            </div>
            <div className="card p-4 text-center">
              <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold">{getTimeUntil(hackathon.startDate)}</div>
              <div className="text-sm text-dark-400">Until Start</div>
            </div>
            <div className="card p-4 text-center">
              {hackathon.mode === 'online' ? (
                <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              ) : (
                <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              )}
              <div className="text-lg font-bold capitalize">{hackathon.mode}</div>
              <div className="text-sm text-dark-400">Mode</div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">About This Hackathon</h2>
            <p className="text-dark-300 whitespace-pre-line">{hackathon.description}</p>
          </div>

          {/* Prizes */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Prizes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hackathon.prizes.map((prize, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border text-center ${
                    index === 0 
                      ? 'border-yellow-500/30 bg-yellow-500/10' 
                      : index === 1
                      ? 'border-gray-400/30 bg-gray-400/10'
                      : 'border-orange-500/30 bg-orange-500/10'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="font-bold text-lg">{prize.position}</div>
                  <div className="text-2xl font-bold text-primary-400">
                    ${prize.amount.toLocaleString()}
                  </div>
                  {prize.description && (
                    <p className="text-sm text-dark-400 mt-2">{prize.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Judging Criteria */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary-400" />
              Judging Criteria
            </h2>
            <div className="space-y-4">
              {hackathon.judgingCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{criteria.name}</span>
                      <span className="text-primary-400">{criteria.weight}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${criteria.weight}%` }}
                      />
                    </div>
                    {criteria.description && (
                      <p className="text-sm text-dark-400 mt-1">{criteria.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {hackathon.timeline && hackathon.timeline.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Timeline
              </h2>
              <div className="space-y-4">
                {hackathon.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-500" />
                      {index < hackathon.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-dark-700" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="font-medium">{event.event}</div>
                      <div className="text-sm text-primary-400">{formatDate(event.date)}</div>
                      {event.description && (
                        <p className="text-sm text-dark-400 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {hackathon.rules && hackathon.rules.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Rules & Guidelines
              </h2>
              <ul className="space-y-2">
                {hackathon.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-dark-300">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Security Settings */}
          {hackathon.securitySettings && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Security & Proctoring
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hackathon.securitySettings.lockdownMode && (
                  <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 text-red-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Lockdown Mode</span>
                  </div>
                )}
                {hackathon.securitySettings.fullscreenRequired && (
                  <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 text-yellow-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Fullscreen Required</span>
                  </div>
                )}
                {hackathon.securitySettings.codeRecording && (
                  <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 text-blue-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Code Recording</span>
                  </div>
                )}
                {hackathon.securitySettings.aiProctoring && (
                  <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10 text-purple-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">AI Proctoring</span>
                  </div>
                )}
                {hackathon.securitySettings.plagiarismCheck && (
                  <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 text-green-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Plagiarism Check</span>
                  </div>
                )}
                {hackathon.securitySettings.tabSwitchLimit && (
                  <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10 text-orange-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Tab Limit: {hackathon.securitySettings.tabSwitchLimit}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <div className="card p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-400 mb-1">
                ${getTotalPrize().toLocaleString()}
              </div>
              <div className="text-dark-400">Total Prize Pool</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">Registration Deadline</span>
                <span className="font-medium text-sm">{formatDate(hackathon.registrationDeadline)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">Start Date</span>
                <span className="font-medium text-sm">{formatDate(hackathon.startDate)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">End Date</span>
                <span className="font-medium text-sm">{formatDate(hackathon.endDate)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">Team Size</span>
                <span className="font-medium">{hackathon.minTeamSize}-{hackathon.maxTeamSize} members</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">Theme</span>
                <span className="badge-primary">{hackathon.theme}</span>
              </div>
            </div>

            {/* DEBUG INFO - Remove after testing */}
            {session?.user?.role === 'participant' && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                <div>Session Role: {session?.user?.role}</div>
                <div>User Team: {userTeam ? userTeam.name : 'NULL'}</div>
                <div>Team ID: {userTeam?._id || 'NULL'}</div>
              </div>
            )}

            {/* Participant View - Team Registered - IDE Available Immediately */}
            {session?.user?.role === 'participant' && userTeam && (
              <div className="space-y-3">
                <Link 
                  href={`/dashboard/hackathons/${hackathonId}/ide`}
                  className="btn-primary w-full text-lg py-3 text-center flex items-center justify-center gap-2"
                >
                  <Code className="w-5 h-5" />
                  Enter IDE
                </Link>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 text-xs font-medium">Team: {userTeam.name}</p>
                  <p className="text-dark-400 text-xs mt-1">IDE Ready - Demo Mode</p>
                </div>
              </div>
            )}
            
            {/* Participant View - No Team Created Yet */}
            {session?.user?.role === 'participant' && !userTeam && (
              <div className="space-y-3">
                <div className="p-4 bg-dark-700 border border-dark-600 rounded-lg text-center">
                  <Users className="w-6 h-6 text-dark-400 mx-auto mb-2" />
                  <p className="text-dark-300 text-sm">No team found</p>
                  <p className="text-dark-400 text-xs mt-2">Create a team in "My Teams" section first</p>
                </div>
                <Link 
                  href="/dashboard/teams"
                  className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Go to My Teams
                </Link>
              </div>
            )}
            
            {session?.user?.role === 'organization' && (
              <div className="space-y-3">
                <Link href={`/dashboard/hackathons/${hackathonId}/manage`} className="btn-primary w-full text-center block">
                  Manage Hackathon
                </Link>
                <Link href={`/dashboard/hackathons/${hackathonId}/monitor`} className="btn-secondary w-full text-center block flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Monitoring
                </Link>
                <Link href={`/dashboard/organization/registrations`} className="btn-secondary w-full text-center block flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  View Registrations
                </Link>
              </div>
            )}

            {!session && (
              <Link href="/auth/login" className="btn-primary w-full text-center">
                Login to Register
              </Link>
            )}
          </div>

          {/* Allowed Technologies */}
          {hackathon.allowedTechnologies && hackathon.allowedTechnologies.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-primary-400" />
                Allowed Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.allowedTechnologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-dark-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {hackathon.sponsorTiers && hackathon.sponsorTiers.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Sponsors
              </h3>
              {hackathon.sponsorTiers.map((tier, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="text-sm text-dark-400 mb-2">{tier.name}</div>
                  <div className="flex flex-wrap gap-3">
                    {tier.sponsors.map((sponsor, sIndex) => (
                      <a
                        key={sIndex}
                        href={sponsor.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-dark-700 rounded hover:bg-dark-600 flex items-center gap-2"
                      >
                        {sponsor.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Register for {hackathon.title}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team Option</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="input-field"
                >
                  <option value="new">Create New Team</option>
                  {myTeams.map((team) => (
                    <option key={team._id} value={team._id}>
                      Join with: {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam === 'new' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className="input-field"
                  />
                </div>
              )}

              <div className="p-4 bg-dark-800 rounded-lg">
                <h4 className="font-medium mb-2">By registering, you agree to:</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• Follow all hackathon rules and guidelines</li>
                  <li>• Submit original work only</li>
                  <li>• Respect the security protocols</li>
                  <li>• Complete the project within the deadline</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registering || (selectedTeam === 'new' && !teamName.trim())}
                className="btn-primary flex-1"
              >
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
