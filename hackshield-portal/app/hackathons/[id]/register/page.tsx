'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Users,
  UserPlus,
  Search,
  Star,
  Clock,
  Code,
  Trophy,
  MessageCircle,
  Check,
  X,
  Send,
  Filter,
  MapPin,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Heart,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TeamMember {
  name: string;
  email: string;
  mobile: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: string;
  collegeName: string;
  universityName?: string;
  yearOfStudy: string;
  course?: string;
}

interface IDEAccessSchedule {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  allowedDays: string[]; // ['monday', 'tuesday', etc.]
  lockdownMode: boolean;
  organizationApproved: boolean;
  accessWindows: Array<{
    day: string;
    startTime: string;
    endTime: string;
    maxDuration: number; // in minutes
  }>;
}

interface TeamFormData {
  teamName: string;
  projectIdea?: string;
  previousExperience?: string;
  specialRequirements?: string;
  ideAccessRequirements?: string;
  teamLeader: TeamMember;
  teamMembers: TeamMember[];
  ideSchedule: IDEAccessSchedule;
}

interface SkillMatch {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  hackathonsParticipated: number;
  hackathonsWon: number;
  reputation: number;
  preferredRole?: string;
  availability: 'full-time' | 'part-time';
  location?: string;
  timezone?: string;
  compatibility: number;
  complementarySkills: string[];
  sharedInterests: string[];
  communicationStyle: 'fast' | 'thoughtful';
  pastProjects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

interface LookingForTeamProfile {
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredRole: string;
  availability: 'full-time' | 'part-time';
  bio: string;
  pastHackathons: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

interface OpenInvite {
  _id: string;
  userId: string;
  hackathonId: string;
  title: string;
  description: string;
  skills: string[];
  lookingFor: string[];
  responses: number;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
    experience: string;
    reputation: number;
  };
}

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'invite' | 'system';
}

interface TeamFormationChat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  }>;
  messages: ChatMessage[];
  teamName?: string;
  isLocked: boolean;
}

export default function HackathonRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationPath, setRegistrationPath] = useState<'have-team' | 'need-team' | null>(null);
  
  // Team formation states
  const [teamFormData, setTeamFormData] = useState<TeamFormData>({
    teamName: '',
    projectIdea: '',
    previousExperience: '',
    specialRequirements: '',
    ideAccessRequirements: '',
    teamLeader: {
      name: '',
      email: '',
      mobile: '',
      gender: 'prefer-not-to-say',
      dateOfBirth: '',
      collegeName: '',
      universityName: '',
      yearOfStudy: '',
      course: ''
    },
    teamMembers: [],
    ideSchedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      lockdownMode: true,
      organizationApproved: false,
      accessWindows: [
        {
          day: 'monday',
          startTime: '09:00',
          endTime: '12:00',
          maxDuration: 180
        },
        {
          day: 'monday',
          startTime: '14:00',
          endTime: '17:00',
          maxDuration: 180
        }
      ]
    }
  });

  // Team matching states
  const [lookingForTeamProfile, setLookingForTeamProfile] = useState<LookingForTeamProfile>({
    skills: [],
    experience: 'intermediate',
    preferredRole: '',
    availability: 'full-time',
    bio: '',
    pastHackathons: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });

  const [suggestedMatches, setSuggestedMatches] = useState<SkillMatch[]>([]);
  const [allParticipants, setAllParticipants] = useState<SkillMatch[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<SkillMatch[]>([]);
  const [openInvites, setOpenInvites] = useState<OpenInvite[]>([]);
  const [activeChat, setActiveChat] = useState<TeamFormationChat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  
  // UI states
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [broadcastInvite, setBroadcastInvite] = useState({
    title: '',
    description: '',
    lookingFor: [] as string[]
  });

  const availableSkills = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Mobile Development', 'React Native', 'Flutter',
    'Machine Learning', 'AI', 'Data Science', 'Backend Development', 'DevOps', 'AWS',
    'Blockchain', 'Smart Contracts', 'Product Management', 'Marketing', 'Business Strategy'
  ];

  const availableRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
    'Mobile Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Product Manager',
    'Business Analyst', 'Marketing Specialist', 'Project Manager'
  ];

  useEffect(() => {
    if (params.id) {
      fetchHackathonDetails(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (registrationPath === 'need-team') {
      generateSuggestions();
      fetchAllParticipants();
      fetchOpenInvites();
    }
  }, [registrationPath, lookingForTeamProfile]);

  useEffect(() => {
    filterParticipants();
  }, [searchTerm, skillFilter, experienceFilter, allParticipants]);

  const fetchHackathonDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/hackathons/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setHackathon(data.hackathon);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/team-matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: lookingForTeamProfile,
          limit: 10
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuggestedMatches(data.matches);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const fetchAllParticipants = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/participants-looking-for-team`);
      const data = await response.json();
      
      if (response.ok) {
        setAllParticipants(data.participants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchOpenInvites = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/open-invites`);
      const data = await response.json();
      
      if (response.ok) {
        setOpenInvites(data.invites);
      }
    } catch (error) {
      console.error('Error fetching open invites:', error);
    }
  };

  const filterParticipants = () => {
    let filtered = [...allParticipants];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (skillFilter.length > 0) {
      filtered = filtered.filter(p => 
        p.skills.some(skill => skillFilter.includes(skill))
      );
    }

    if (experienceFilter.length > 0) {
      filtered = filtered.filter(p => 
        experienceFilter.includes(p.experience)
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleTeamMemberAdd = () => {
    if (teamFormData.teamMembers.length < hackathon.maxTeamSize - 1) {
      setTeamFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, {
          name: '',
          email: '',
          mobile: '',
          gender: 'prefer-not-to-say',
          dateOfBirth: '',
          collegeName: '',
          universityName: '',
          yearOfStudy: '',
          course: ''
        }]
      }));
    }
  };

  const handleTeamMemberRemove = (index: number) => {
    setTeamFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleSendInvite = async (participantId: string, message: string) => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: participantId,
          message,
          hackathonId: params.id
        }),
      });

      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setInviteMessage('');
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Error sending invitation');
    }
  };

  const handleBroadcastInvite = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}/broadcast-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...broadcastInvite,
          hackathonId: params.id,
          skills: lookingForTeamProfile.skills
        }),
      });

      if (response.ok) {
        toast.success('Open invite posted successfully!');
        setBroadcastInvite({ title: '', description: '', lookingFor: [] });
        fetchOpenInvites();
      } else {
        toast.error('Failed to post open invite');
      }
    } catch (error) {
      console.error('Error posting broadcast invite:', error);
      toast.error('Error posting open invite');
    }
  };

  const handleRegisterTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hackathons/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationPath,
          teamData: registrationPath === 'have-team' ? teamFormData : null,
          profileData: registrationPath === 'need-team' ? lookingForTeamProfile : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful!');
        router.push(`/dashboard/hackathons/${params.id}`);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const SkillMatchCard = ({ match }: { match: SkillMatch }) => (
    <div className="glass border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {match.avatar ? (
          <Image 
            src={match.avatar} 
            alt={match.name}
            width={60}
            height={60}
            className="rounded-full"
          />
        ) : (
          <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {match.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{match.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs ${
              match.experience === 'expert' ? 'bg-red-500/20 text-red-400' :
              match.experience === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
              match.experience === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {match.experience}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-dark-200">{match.reputation}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{match.compatibility}%</div>
          <div className="text-xs text-dark-300">Match</div>
        </div>
      </div>

      {/* Skills Compatibility */}
      <div className="mb-4">
        <div className="text-sm text-dark-300 mb-2">Complementary Skills:</div>
        <div className="flex flex-wrap gap-1">
          {match.complementarySkills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      {match.bio && (
        <p className="text-dark-200 text-sm mb-4 line-clamp-2">{match.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-white font-semibold">{match.hackathonsParticipated}</div>
          <div className="text-xs text-dark-300">Hackathons</div>
        </div>
        <div>
          <div className="text-white font-semibold">{match.hackathonsWon}</div>
          <div className="text-xs text-dark-300">Wins</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              match.communicationStyle === 'fast' ? 'bg-green-400' : 'bg-blue-400'
            }`} />
            <span className="text-xs text-dark-300 capitalize">{match.communicationStyle}</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-2 mb-4">
        {match.github && (
          <a href={match.github} target="_blank" rel="noopener noreferrer" className="text-dark-300 hover:text-white">
            <Code className="w-4 h-4" />
          </a>
        )}
        {match.linkedin && (
          <a href={match.linkedin} target="_blank" rel="noopener noreferrer" className="text-dark-300 hover:text-white">
            <Users className="w-4 h-4" />
          </a>
        )}
        {match.portfolio && (
          <a href={match.portfolio} target="_blank" rel="noopener noreferrer" className="text-dark-300 hover:text-white">
            <Trophy className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSendInvite(match._id, inviteMessage)}
          className="flex-1 btn-primary py-2 text-sm"
        >
          Send Request
        </button>
        <button className="px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Hackathon Not Found</h1>
          <p className="text-dark-300">The hackathon you're trying to register for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Register for {hackathon.title}</h1>
          <p className="text-dark-200">Join this amazing hackathon and build something incredible!</p>
        </div>

        {/* Registration Path Selection */}
        {!registrationPath && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div 
              onClick={() => setRegistrationPath('have-team')}
              className="glass border border-dark-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50 transition-all duration-300 group"
            >
              <Users className="w-16 h-16 text-primary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-white mb-4">I Have a Team</h2>
              <p className="text-dark-200 mb-6">Register with your existing team members and get ready to compete!</p>
              <div className="flex items-center justify-center gap-2 text-primary-400">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div 
              onClick={() => setRegistrationPath('need-team')}
              className="glass border border-dark-700 rounded-xl p-8 text-center cursor-pointer hover:border-secondary-500/50 transition-all duration-300 group"
            >
              <UserPlus className="w-16 h-16 text-secondary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-white mb-4">I Need a Team</h2>
              <p className="text-dark-200 mb-6">Find compatible teammates using our AI-powered matching system!</p>
              <div className="flex items-center justify-center gap-2 text-secondary-400">
                <span>Find Teammates</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Have Team Flow */}
        {registrationPath === 'have-team' && (
          <div className="glass border border-dark-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Team Registration</h2>
            
            <div className="space-y-8">
              {/* Team Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Team Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Team Name *</label>
                    <input
                      type="text"
                      value={teamFormData.teamName}
                      onChange={(e) => setTeamFormData(prev => ({ ...prev, teamName: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="Enter your team name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Project Idea (Optional)</label>
                    <input
                      type="text"
                      value={teamFormData.projectIdea}
                      onChange={(e) => setTeamFormData(prev => ({ ...prev, projectIdea: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="Brief description of your project idea"
                    />
                  </div>
                </div>
              </div>

              {/* Team Leader Info */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Team Leader Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={teamFormData.teamLeader.name}
                      onChange={(e) => setTeamFormData(prev => ({ 
                        ...prev, 
                        teamLeader: { ...prev.teamLeader, name: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email *</label>
                    <input
                      type="email"
                      value={teamFormData.teamLeader.email}
                      onChange={(e) => setTeamFormData(prev => ({ 
                        ...prev, 
                        teamLeader: { ...prev.teamLeader, email: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Mobile *</label>
                    <input
                      type="tel"
                      value={teamFormData.teamLeader.mobile}
                      onChange={(e) => setTeamFormData(prev => ({ 
                        ...prev, 
                        teamLeader: { ...prev.teamLeader, mobile: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">College Name *</label>
                    <input
                      type="text"
                      value={teamFormData.teamLeader.collegeName}
                      onChange={(e) => setTeamFormData(prev => ({ 
                        ...prev, 
                        teamLeader: { ...prev.teamLeader, collegeName: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* IDE Access Schedule */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  <Shield className="w-5 h-5 inline mr-2 text-primary-400" />
                  IDE Access Schedule
                </h3>
                <div className="glass p-6 rounded-lg bg-primary-500/5 border border-primary-500/20">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Organizational Requirements</h4>
                      <p className="text-dark-200 text-sm">
                        IDE access will be controlled by the organization and activated only during specific time windows.
                        The system will be in lockdown mode with restricted access to ensure fair competition.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Preferred Start Time</label>
                      <input
                        type="time"
                        value={teamFormData.ideSchedule.startTime}
                        onChange={(e) => setTeamFormData(prev => ({
                          ...prev,
                          ideSchedule: { ...prev.ideSchedule, startTime: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                      <p className="text-dark-400 text-xs mt-1">Suggested start time (subject to approval)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Preferred End Time</label>
                      <input
                        type="time"
                        value={teamFormData.ideSchedule.endTime}
                        onChange={(e) => setTeamFormData(prev => ({
                          ...prev,
                          ideSchedule: { ...prev.ideSchedule, endTime: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                      <p className="text-dark-400 text-xs mt-1">Suggested end time (subject to approval)</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">Preferred Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <button
                          key={day}
                          onClick={() => {
                            const updatedDays = teamFormData.ideSchedule.allowedDays.includes(day)
                              ? teamFormData.ideSchedule.allowedDays.filter(d => d !== day)
                              : [...teamFormData.ideSchedule.allowedDays, day];
                            setTeamFormData(prev => ({
                              ...prev,
                              ideSchedule: { ...prev.ideSchedule, allowedDays: updatedDays }
                            }));
                          }}
                          className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                            teamFormData.ideSchedule.allowedDays.includes(day)
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-dark-400 text-xs mt-2">Select your preferred working days (final schedule determined by organization)</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">IDE Access Requirements</label>
                    <textarea
                      value={teamFormData.ideAccessRequirements || ''}
                      onChange={(e) => setTeamFormData(prev => ({ ...prev, ideAccessRequirements: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      rows={3}
                      placeholder="Any specific requirements for IDE access (languages, frameworks, tools needed, etc.)"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="lockdown-agreement"
                      checked={teamFormData.ideSchedule.lockdownMode}
                      onChange={(e) => setTeamFormData(prev => ({
                        ...prev,
                        ideSchedule: { ...prev.ideSchedule, lockdownMode: e.target.checked }
                      }))}
                      className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      required
                    />
                    <label htmlFor="lockdown-agreement" className="text-white text-sm flex-1">
                      I understand and agree to the lockdown mode restrictions. IDE access will only be available during
                      organization-approved time windows, and the system will monitor all activities for fair play.
                    </label>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Automatic Activation</span>
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      IDE access will be automatically activated when the organization opens the development window.
                      You'll receive notifications 15 minutes before each session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Team Members</h3>
                  <button
                    onClick={handleTeamMemberAdd}
                    disabled={teamFormData.teamMembers.length >= hackathon.maxTeamSize - 1}
                    className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                </div>
                
                {teamFormData.teamMembers.map((member, index) => (
                  <div key={index} className="glass p-6 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-white">Member {index + 1}</h4>
                      <button
                        onClick={() => handleTeamMemberRemove(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => {
                          const updatedMembers = [...teamFormData.teamMembers];
                          updatedMembers[index].name = e.target.value;
                          setTeamFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
                        }}
                        className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => {
                          const updatedMembers = [...teamFormData.teamMembers];
                          updatedMembers[index].email = e.target.value;
                          setTeamFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
                        }}
                        className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  onClick={handleRegisterTeam}
                  disabled={!teamFormData.teamName || !teamFormData.teamLeader.name || !teamFormData.teamLeader.email}
                  className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Register Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Need Team Flow */}
        {registrationPath === 'need-team' && (
          <div className="space-y-8">
            {/* Profile Creation */}
            <div className="glass border border-dark-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Create Your Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your Skills</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => {
                          setLookingForTeamProfile(prev => ({
                            ...prev,
                            skills: prev.skills.includes(skill) 
                              ? prev.skills.filter(s => s !== skill)
                              : [...prev.skills, skill]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          lookingForTeamProfile.skills.includes(skill)
                            ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                            : 'bg-dark-800 text-dark-200 border-dark-600 hover:border-primary-500/50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Preferred Role</label>
                  <select
                    value={lookingForTeamProfile.preferredRole}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, preferredRole: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Experience Level</label>
                  <select
                    value={lookingForTeamProfile.experience}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, experience: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Availability</label>
                  <select
                    value={lookingForTeamProfile.availability}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, availability: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="full-time">Full-time (Available entire hackathon)</option>
                    <option value="part-time">Part-time (Limited availability)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">Bio (Tell others about yourself)</label>
                <textarea
                  value={lookingForTeamProfile.bio}
                  onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Describe your experience, what you're passionate about, and what you bring to a team..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">GitHub Profile (Optional)</label>
                  <input
                    type="url"
                    value={lookingForTeamProfile.github}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    value={lookingForTeamProfile.linkedin}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Portfolio (Optional)</label>
                  <input
                    type="url"
                    value={lookingForTeamProfile.portfolio}
                    onChange={(e) => setLookingForTeamProfile(prev => ({ ...prev, portfolio: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {suggestedMatches.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  AI-Suggested Matches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {suggestedMatches.slice(0, 4).map(match => (
                    <SkillMatchCard key={match._id} match={match} />
                  ))}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowAllParticipants(true)}
                    className="btn-secondary"
                  >
                    View All Participants
                  </button>
                </div>
              </div>
            )}

            {/* Browse All Participants */}
            {showAllParticipants && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary-400" />
                  Browse All Participants
                </h2>
                
                {/* Search & Filters */}
                <div className="glass border border-dark-700 rounded-xl p-6 mb-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by name, skills, or bio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select
                        multiple
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(Array.from(e.target.selectedOptions, option => option.value))}
                        className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      >
                        {availableSkills.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredParticipants.map(participant => (
                    <SkillMatchCard key={participant._id} match={participant} />
                  ))}
                </div>
              </div>
            )}

            {/* Open Invites */}
            {openInvites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-400" />
                  Open Invites
                </h2>
                <div className="space-y-4">
                  {openInvites.map(invite => (
                    <div key={invite._id} className="glass border border-dark-700 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {invite.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{invite.title}</h3>
                          <p className="text-dark-200 mb-3">{invite.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {invite.skills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-dark-300">
                            <span>by {invite.user.name}</span>
                            <span>{invite.responses} responses</span>
                            <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button className="btn-primary py-2 px-4">
                          Respond
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcast Invite */}
            <div className="glass border border-dark-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Create Open Invite</h2>
              <p className="text-dark-200 mb-6">Post an open invite that all participants can see and respond to.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={broadcastInvite.title}
                    onChange={(e) => setBroadcastInvite(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., React developer looking for team!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={broadcastInvite.description}
                    onChange={(e) => setBroadcastInvite(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Describe what you bring to a team and what you're looking for..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleBroadcastInvite}
                    disabled={!broadcastInvite.title || !broadcastInvite.description}
                    className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Open Invite
                  </button>
                </div>
              </div>
            </div>

            {/* Finalize Registration */}
            <div className="glass border border-primary-500/30 rounded-xl p-8 bg-primary-500/5">
              <h2 className="text-2xl font-bold text-white mb-4">Complete Registration</h2>
              <p className="text-dark-200 mb-6">
                You can complete your registration now and continue networking. You can join or form a team anytime before the hackathon starts.
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={handleRegisterTeam}
                  className="btn-primary px-8 py-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Complete Registration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}