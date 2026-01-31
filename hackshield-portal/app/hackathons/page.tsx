'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Filter, 
  Search, 
  Calendar, 
  Users, 
  Trophy, 
  MapPin, 
  Clock, 
  Star,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Hackathon {
  _id: string;
  title: string;
  tagline: string;
  description: string;
  theme: string;
  coverImage?: string;
  organizationName: string;
  organizationLogo?: string;
  startDate: string;
  endDate: string;
  registrationEnd: string;
  duration: number;
  mode: 'online' | 'offline' | 'hybrid';
  location?: string;
  prizePool: number;
  maxTeamSize: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  registeredTeams: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  sponsors?: { name: string; logo: string; tier: 'gold' | 'silver' | 'bronze' }[];
  requiredSkills: string[];
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const MODE_COLORS = {
  online: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  offline: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  hybrid: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
};

export default function HackathonMarketplace() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    mode: [] as string[],
    technology: [] as string[],
    prizeRange: [] as string[],
    difficulty: [] as string[],
    status: [] as string[],
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, hackathons, sortBy]);

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/hackathons');
      const data = await response.json();
      setHackathons(data.hackathons || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hackathons];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Mode filter
    if (filters.mode.length > 0) {
      filtered = filtered.filter(h => filters.mode.includes(h.mode));
    }

    // Technology filter
    if (filters.technology.length > 0) {
      filtered = filtered.filter(h => 
        h.technologies.some(tech => filters.technology.includes(tech))
      );
    }

    // Prize range filter
    if (filters.prizeRange.length > 0) {
      filtered = filtered.filter(h => {
        const prize = h.prizePool;
        return filters.prizeRange.some(range => {
          switch (range) {
            case '0-1000': return prize <= 1000;
            case '1000-5000': return prize > 1000 && prize <= 5000;
            case '5000+': return prize > 5000;
            default: return true;
          }
        });
      });
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(h => filters.difficulty.includes(h.difficulty));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(h => filters.status.includes(h.status));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'prizePool':
          return b.prizePool - a.prizePool;
        case 'registrations':
          return b.registeredTeams - a.registeredTeams;
        case 'deadline':
          return new Date(a.registrationEnd).getTime() - new Date(b.registrationEnd).getTime();
        default:
          return 0;
      }
    });

    setFilteredHackathons(filtered);
  };

  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: Array.isArray(prev[filterType])
        ? (prev[filterType] as string[]).includes(value)
          ? (prev[filterType] as string[]).filter(item => item !== value)
          : [...(prev[filterType] as string[]), value]
        : value
    }));
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const HackathonCard = ({ hackathon }: { hackathon: Hackathon }) => (
    <div className="glass border border-dark-700 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
        {hackathon.coverImage ? (
          <Image 
            src={hackathon.coverImage} 
            alt={hackathon.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Trophy className="w-16 h-16 text-primary-500/50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
            hackathon.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            hackathon.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {hackathon.status}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 glass rounded-full hover:bg-white/10 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-1.5 glass rounded-full hover:bg-white/10 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-1.5 glass rounded-full hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Countdown Timer */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            {getTimeRemaining(hackathon.registrationEnd)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Organization */}
        <div className="flex items-center gap-2 mb-3">
          {hackathon.organizationLogo && (
            <Image 
              src={hackathon.organizationLogo} 
              alt={hackathon.organizationName}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span className="text-sm text-dark-200">{hackathon.organizationName}</span>
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>

        {/* Title & Theme */}
        <h3 className="text-xl font-bold text-white mb-1">{hackathon.title}</h3>
        <p className="text-sm text-dark-200 mb-3">"{hackathon.theme}"</p>

        {/* Description */}
        <p className="text-dark-200 text-sm mb-4 line-clamp-2">{hackathon.description}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`px-2 py-1 text-xs rounded-full border ${MODE_COLORS[hackathon.mode]}`}>
            {hackathon.mode}
          </div>
          <div className={`px-2 py-1 text-xs rounded-full border ${DIFFICULTY_COLORS[hackathon.difficulty]}`}>
            {hackathon.difficulty}
          </div>
          {hackathon.location && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-700/50 text-dark-200 rounded-full">
              <MapPin className="w-3 h-3" />
              {hackathon.location}
            </div>
          )}
        </div>

        {/* Date & Duration */}
        <div className="flex items-center justify-between mb-3 text-sm text-dark-200">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(hackathon.startDate).toLocaleDateString()}
          </div>
          <div>{hackathon.duration}h</div>
        </div>

        {/* Prize Pool */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-white">${hackathon.prizePool.toLocaleString()}</span>
          </div>
          <div className="text-sm text-dark-200">
            {hackathon.registeredTeams}/{Math.floor(hackathon.maxParticipants / hackathon.maxTeamSize)} teams
          </div>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1 mb-4">
          {hackathon.technologies.slice(0, 3).map((tech, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
              {tech}
            </span>
          ))}
          {hackathon.technologies.length > 3 && (
            <span className="px-2 py-1 text-xs bg-dark-700/50 text-dark-200 rounded">
              +{hackathon.technologies.length - 3} more
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-dark-200 mb-1">
            <span>Registration Progress</span>
            <span>{Math.floor((hackathon.registeredTeams / (hackathon.maxParticipants / hackathon.maxTeamSize)) * 100)}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((hackathon.registeredTeams / (hackathon.maxParticipants / hackathon.maxTeamSize)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link 
            href={`/hackathons/${hackathon._id}`}
            className="flex-1 btn-secondary text-center text-sm py-2"
          >
            Quick View
          </Link>
          <Link 
            href={`/hackathons/${hackathon._id}/register`}
            className="flex-1 btn-primary text-center text-sm py-2"
          >
            Register Now
          </Link>
        </div>

        {/* Sponsors */}
        {hackathon.sponsors && hackathon.sponsors.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dark-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-300">Sponsored by:</span>
              <div className="flex gap-1">
                {hackathon.sponsors.slice(0, 3).map((sponsor, index) => (
                  <Image 
                    key={index}
                    src={sponsor.logo} 
                    alt={sponsor.name}
                    width={16}
                    height={16}
                    className="rounded opacity-60 hover:opacity-100 transition-opacity"
                  />
                ))}
                {hackathon.sponsors.length > 3 && (
                  <span className="text-xs text-dark-300">+{hackathon.sponsors.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        )}
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

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hackathon Marketplace</h1>
          <p className="text-dark-200">Discover and participate in cutting-edge hackathons</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search hackathons, themes, organizations..."
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white hover:border-primary-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="startDate">Start Date</option>
              <option value="prizePool">Prize Pool</option>
              <option value="registrations">Most Popular</option>
              <option value="deadline">Registration Deadline</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="glass border border-dark-700 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mode Filter */}
                <div>
                  <h4 className="font-medium text-white mb-3">Mode</h4>
                  {['online', 'offline', 'hybrid'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={filters.mode.includes(mode)}
                        onChange={() => toggleFilter('mode', mode)}
                        className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-dark-200 capitalize">{mode}</span>
                    </label>
                  ))}
                </div>

                {/* Technology Filter */}
                <div>
                  <h4 className="font-medium text-white mb-3">Technology</h4>
                  {['React', 'Python', 'AI/ML', 'Blockchain', 'Mobile', 'IoT'].map(tech => (
                    <label key={tech} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={filters.technology.includes(tech)}
                        onChange={() => toggleFilter('technology', tech)}
                        className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-dark-200">{tech}</span>
                    </label>
                  ))}
                </div>

                {/* Prize Range Filter */}
                <div>
                  <h4 className="font-medium text-white mb-3">Prize Range</h4>
                  {[
                    { value: '0-1000', label: '$0 - $1,000' },
                    { value: '1000-5000', label: '$1,000 - $5,000' },
                    { value: '5000+', label: '$5,000+' }
                  ].map(range => (
                    <label key={range.value} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={filters.prizeRange.includes(range.value)}
                        onChange={() => toggleFilter('prizeRange', range.value)}
                        className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-dark-200">{range.label}</span>
                    </label>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h4 className="font-medium text-white mb-3">Difficulty</h4>
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <label key={difficulty} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(difficulty)}
                        onChange={() => toggleFilter('difficulty', difficulty)}
                        className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-dark-200 capitalize">{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-dark-200">
            Showing {filteredHackathons.length} of {hackathons.length} hackathons
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500' : 'bg-dark-800'} transition-colors`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-current rounded-sm" />
                ))}
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500' : 'bg-dark-800'} transition-colors`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-current h-0.5 rounded-sm" />
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Hackathons Grid */}
        {filteredHackathons.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
            <p className="text-dark-300">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredHackathons.map(hackathon => (
              <HackathonCard key={hackathon._id} hackathon={hackathon} />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredHackathons.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Hackathons
            </button>
          </div>
        )}
      </div>
    </div>
  );
}