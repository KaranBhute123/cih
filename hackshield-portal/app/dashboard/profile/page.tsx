'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Github, 
  Linkedin,
  Globe,
  Trophy,
  Users,
  Code2,
  Award,
  Star,
  Edit,
  Shield,
  Briefcase,
  Building,
  FolderGit2
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  stats: {
    hackathonsParticipated: number;
    hackathonsWon: number;
    projectsCompleted: number;
    teamsJoined: number;
    totalPrizeWon?: number;
    eventsOrganized?: number;
    investmentsMade?: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    date: string;
  }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  useEffect(() => {
    // Demo data
    setTimeout(() => {
      setProfile({
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com',
        role: session?.user?.role || 'participant',
        bio: 'Passionate full-stack developer with 5+ years of experience. Love participating in hackathons and building innovative solutions.',
        location: 'San Francisco, CA',
        joinedAt: '2023-06-15',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'MongoDB', 'Machine Learning'],
        socialLinks: {
          github: 'https://github.com/username',
          linkedin: 'https://linkedin.com/in/username',
          portfolio: 'https://portfolio.com'
        },
        stats: {
          hackathonsParticipated: 12,
          hackathonsWon: 4,
          projectsCompleted: 18,
          teamsJoined: 8,
          totalPrizeWon: 15000,
          eventsOrganized: 3,
          investmentsMade: 5
        },
        achievements: [
          { id: '1', title: 'First Win', description: 'Won your first hackathon', icon: '🏆', earnedAt: '2023-08-20' },
          { id: '2', title: 'Team Player', description: 'Participated in 5 team hackathons', icon: '👥', earnedAt: '2023-10-15' },
          { id: '3', title: 'Code Warrior', description: 'Wrote 10,000 lines of code', icon: '⚔️', earnedAt: '2023-11-01' },
          { id: '4', title: 'Serial Winner', description: 'Won 3 hackathons in a row', icon: '🔥', earnedAt: '2024-01-10' },
          { id: '5', title: 'Early Bird', description: 'Joined HackShield in the first month', icon: '🐦', earnedAt: '2023-06-15' },
          { id: '6', title: 'Mentor', description: 'Helped 10+ participants', icon: '🎓', earnedAt: '2024-01-20' }
        ],
        recentActivity: [
          { id: '1', type: 'hackathon', title: 'Registered for AI Innovation Summit', date: '2024-01-25' },
          { id: '2', type: 'project', title: 'Submitted EcoTrack project', date: '2024-01-20' },
          { id: '3', type: 'team', title: 'Joined Code Ninjas team', date: '2024-01-18' },
          { id: '4', type: 'achievement', title: 'Earned "Serial Winner" badge', date: '2024-01-10' },
          { id: '5', type: 'hackathon', title: 'Won GreenTech Innovation 2024', date: '2024-01-08' }
        ]
      });
      setLoading(false);
    }, 800);
  }, [session]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'participant': return User;
      case 'organization': return Building;
      case 'contributor': return Briefcase;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'participant': return 'bg-blue-500/20 text-blue-400';
      case 'organization': return 'bg-purple-500/20 text-purple-400';
      case 'contributor': return 'bg-green-500/20 text-green-400';
      default: return 'bg-primary-500/20 text-primary-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return Trophy;
      case 'project': return FolderGit2;
      case 'team': return Users;
      case 'achievement': return Award;
      default: return Star;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-dark-400">Unable to load profile data.</p>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profile.role);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold">
              {profile.name[0].toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getRoleColor(profile.role)}`}>
                    <RoleIcon className="w-4 h-4" />
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-dark-400 text-sm">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                </div>
              </div>
              <Link href="/dashboard/settings" className="btn-secondary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            {profile.bio && (
              <p className="text-dark-300 mt-4">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-dark-400">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {profile.socialLinks.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                   className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                   className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.socialLinks.portfolio && (
                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                   className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Trophy className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{profile.stats.hackathonsParticipated}</div>
          <div className="text-sm text-dark-400">Hackathons</div>
        </div>
        <div className="card text-center">
          <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{profile.stats.hackathonsWon}</div>
          <div className="text-sm text-dark-400">Wins</div>
        </div>
        <div className="card text-center">
          <FolderGit2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{profile.stats.projectsCompleted}</div>
          <div className="text-sm text-dark-400">Projects</div>
        </div>
        <div className="card text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{profile.stats.teamsJoined}</div>
          <div className="text-sm text-dark-400">Teams</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-800">
        {(['overview', 'achievements', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary-400" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-dark-800 rounded-lg text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-400" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.achievements.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className="text-center p-3 bg-dark-800 rounded-lg">
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="text-xs font-medium">{achievement.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.achievements.map((achievement) => (
            <div key={achievement.id} className="card flex items-start gap-4">
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <h4 className="font-semibold">{achievement.title}</h4>
                <p className="text-sm text-dark-400 mb-2">{achievement.description}</p>
                <span className="text-xs text-dark-500">
                  Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <div className="space-y-4">
            {profile.recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-lg">
                  <div className="p-2 bg-dark-700 rounded-lg">
                    <ActivityIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-dark-400">
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
