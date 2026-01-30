'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Github, Linkedin, Mail, MessageCircle, UserPlus, X } from 'lucide-react';
import Image from 'next/image';

interface Participant {
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
  availability: 'full' | 'partial';
  preferredRole: string;
  lookingForTeam: boolean;
}

interface BrowseParticipantsProps {
  hackathonId: string;
  onSendRequest: (participantId: string) => void;
  onStartChat: (participantId: string) => void;
}

export default function BrowseParticipants({ hackathonId, onSendRequest, onStartChat }: BrowseParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    experience: '' as string,
    availability: '' as string,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, [hackathonId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${hackathonId}/participants?lookingForTeam=true`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         p.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => p.skills.includes(skill));
    
    const matchesExperience = !filters.experience || p.experience === filters.experience;
    const matchesAvailability = !filters.availability || p.availability === filters.availability;

    return matchesSearch && matchesSkills && matchesExperience && matchesAvailability;
  });

  const getExperienceBadge = (experience: string) => {
    const badges = {
      beginner: { color: 'bg-green-500/20 text-green-400', label: 'Beginner' },
      intermediate: { color: 'bg-blue-500/20 text-blue-400', label: 'Intermediate' },
      advanced: { color: 'bg-purple-500/20 text-purple-400', label: 'Advanced' },
      expert: { color: 'bg-orange-500/20 text-orange-400', label: 'Expert' },
    };
    return badges[experience as keyof typeof badges] || badges.beginner;
  };

  const getMatchScore = (participant: Participant) => {
    // Simple matching algorithm
    let score = 0;
    if (participant.hackathonsWon > 0) score += 20;
    if (participant.hackathonsParticipated > 3) score += 15;
    if (participant.skills.length > 5) score += 10;
    if (participant.availability === 'full') score += 10;
    if (participant.github) score += 5;
    if (participant.linkedin) score += 5;
    return Math.min(100, score + Math.floor(Math.random() * 35));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skills, or bio..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-500/20 border-primary-500' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2"
            >
              <option value="">Any</option>
              <option value="full">Full Time (24h)</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark-400">
          {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} looking for teams
        </p>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParticipants.map((participant) => {
          const experienceBadge = getExperienceBadge(participant.experience);
          const matchScore = getMatchScore(participant);

          return (
            <div
              key={participant._id}
              className="card-hover p-4 cursor-pointer"
              onClick={() => setSelectedParticipant(participant)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  {participant.avatar ? (
                    <Image
                      src={participant.avatar}
                      alt={participant.name}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-2xl font-bold">
                      {participant.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-dark-900" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold truncate">{participant.name}</h3>
                      <p className="text-sm text-dark-400">{participant.preferredRole}</p>
                    </div>
                    <div className="bg-primary-500/20 text-primary-400 text-xs font-bold px-2 py-1 rounded">
                      {matchScore}% Match
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${experienceBadge.color}`}>
                      {experienceBadge.label}
                    </span>
                    <span className="text-xs text-dark-400">
                      {participant.hackathonsParticipated} hackathons
                    </span>
                    {participant.hackathonsWon > 0 && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {participant.hackathonsWon} wins
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {participant.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {participant.skills.length > 4 && (
                      <span className="text-xs text-dark-400">
                        +{participant.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendRequest(participant._id);
                      }}
                      className="flex-1 btn-primary text-sm py-1.5"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Send Request
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartChat(participant._id);
                      }}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-400">No participants found matching your criteria</p>
        </div>
      )}

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedParticipant(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-dark-900 rounded-xl border border-dark-700 z-50 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedParticipant.avatar ? (
                    <Image
                      src={selectedParticipant.avatar}
                      alt={selectedParticipant.name}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-3xl font-bold">
                      {selectedParticipant.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedParticipant.name}</h2>
                    <p className="text-dark-400">{selectedParticipant.preferredRole}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedParticipant(null)} className="p-2 hover:bg-dark-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedParticipant.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-dark-300">{selectedParticipant.bio}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipant.skills.map((skill, index) => (
                    <span key={index} className="bg-dark-800 text-primary-400 px-3 py-1 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-dark-800 p-4 rounded-lg">
                  <p className="text-dark-400 text-sm mb-1">Experience</p>
                  <p className="font-semibold capitalize">{selectedParticipant.experience}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <p className="text-dark-400 text-sm mb-1">Availability</p>
                  <p className="font-semibold capitalize">{selectedParticipant.availability}</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <p className="text-dark-400 text-sm mb-1">Hackathons</p>
                  <p className="font-semibold">{selectedParticipant.hackathonsParticipated} participated</p>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <p className="text-dark-400 text-sm mb-1">Wins</p>
                  <p className="font-semibold text-yellow-400">{selectedParticipant.hackathonsWon} wins</p>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                {selectedParticipant.github && (
                  <a href={selectedParticipant.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white">
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {selectedParticipant.linkedin && (
                  <a href={selectedParticipant.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onSendRequest(selectedParticipant._id);
                    setSelectedParticipant(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Team Request
                </button>
                <button
                  onClick={() => {
                    onStartChat(selectedParticipant._id);
                    setSelectedParticipant(null);
                  }}
                  className="btn-secondary"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
