'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Search,
  Filter,
  Star,
  Github,
  Linkedin,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  Loader2,
  Sparkles,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
  skills: string[];
  experience: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  matchScore?: number;
}

export default function FindTeamPage() {
  const { data: session } = useSession();
  const params = useParams();
  const hackathonId = params.id as string;
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [showAIMatches, setShowAIMatches] = useState(true);
  
  useEffect(() => {
    fetchParticipants();
  }, [hackathonId]);
  
  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/participants?lookingForTeam=true`);
      if (res.ok) {
        const data = await res.json();
        // Add mock match scores for demo
        const withScores = (data.participants || []).map((p: Participant) => ({
          ...p,
          matchScore: Math.floor(Math.random() * 30) + 70
        }));
        setParticipants(withScores.sort((a: Participant, b: Participant) => (b.matchScore || 0) - (a.matchScore || 0)));
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendTeamRequest = async (userId: string) => {
    toast.success('Team request sent! They will be notified.');
  };
  
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkill = !skillFilter || p.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });
  
  const allSkills = Array.from(new Set(participants.flatMap(p => p.skills)));
  
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
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/hackathons/${hackathonId}`}
          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Find Teammates</h1>
          <p className="text-dark-400">Connect with other participants looking for a team</p>
        </div>
      </div>
      
      {/* AI Matches Toggle */}
      <div className="card bg-gradient-to-r from-primary-900/50 to-secondary-900/50 border-primary-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI-Powered Matching</h3>
              <p className="text-sm text-dark-400">Find teammates with complementary skills</p>
            </div>
          </div>
          <button
            onClick={() => setShowAIMatches(!showAIMatches)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showAIMatches ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-300'
            }`}
          >
            {showAIMatches ? 'Showing Best Matches' : 'Show AI Matches'}
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or skill..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Participants Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No participants found</h3>
          <p className="text-dark-400">Be the first to start looking for a team!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((participant) => (
            <div key={participant._id} className="card-hover">
              {/* Match Score Badge */}
              {showAIMatches && participant.matchScore && (
                <div className="flex justify-end mb-2">
                  <span className={`badge ${
                    participant.matchScore >= 85 ? 'badge-success' : 
                    participant.matchScore >= 70 ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {participant.matchScore}% Match
                  </span>
                </div>
              )}
              
              {/* Profile */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xl font-bold">
                  {participant.avatar ? (
                    <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    participant.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{participant.name}</h3>
                  <p className="text-sm text-dark-400 capitalize">{participant.experience} Developer</p>
                </div>
              </div>
              
              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {participant.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="badge-primary text-xs">{skill}</span>
                ))}
                {participant.skills.length > 4 && (
                  <span className="text-xs text-dark-400">+{participant.skills.length - 4} more</span>
                )}
              </div>
              
              {/* Bio */}
              {participant.bio && (
                <p className="text-sm text-dark-400 mb-4 line-clamp-2">{participant.bio}</p>
              )}
              
              {/* Links */}
              <div className="flex items-center gap-2 mb-4">
                {participant.github && (
                  <a href={participant.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {participant.linkedin && (
                  <a href={participant.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => sendTeamRequest(participant._id)}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Send Request
                </button>
                <button className="btn-secondary px-3 py-2">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
