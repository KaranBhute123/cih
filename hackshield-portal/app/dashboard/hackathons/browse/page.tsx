'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Trophy, MapPin, Zap, Search, Filter, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import RegistrationButton from '@/components/hackathons/RegistrationButton';

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
  venue?: string;
  minTeamSize: number;
  maxTeamSize: number;
  totalPrizePool: number;
  registeredTeams: string[];
  maxTeams?: number;
  status: 'published' | 'active' | 'judging' | 'completed';
  views: number;
}

export default function LiveHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'prize' | 'deadline'>('popular');

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [searchQuery, selectedMode, selectedStatus, sortBy, hackathons]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hackathons?status=published,active');
      const data = await response.json();
      setHackathons(data.hackathons || []);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHackathons = () => {
    let filtered = [...hackathons];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(h =>
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mode filter
    if (selectedMode !== 'all') {
      filtered = filtered.filter(h => h.mode === selectedMode);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(h => h.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'newest':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'prize':
          return b.totalPrizePool - a.totalPrizePool;
        case 'deadline':
          return new Date(a.registrationEnd).getTime() - new Date(b.registrationEnd).getTime();
        default:
          return 0;
      }
    });

    setFilteredHackathons(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: 'bg-blue-900/30 text-blue-400 border-blue-500',
      active: 'bg-green-900/30 text-green-400 border-green-500',
      judging: 'bg-yellow-900/30 text-yellow-400 border-yellow-500',
      completed: 'bg-gray-900/30 text-gray-400 border-gray-500'
    };
    return badges[status as keyof typeof badges] || badges.published;
  };

  const getModeBadge = (mode: string) => {
    const badges = {
      online: { icon: '🌐', color: 'text-blue-400' },
      offline: { icon: '📍', color: 'text-green-400' },
      hybrid: { icon: '🔄', color: 'text-purple-400' }
    };
    return badges[mode as keyof typeof badges] || badges.online;
  };

  const getTimeUntil = (date: string): string => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getSpotsLeft = (hackathon: Hackathon): string | null => {
    if (!hackathon.maxTeams) return null;
    const spotsLeft = hackathon.maxTeams - hackathon.registeredTeams.length;
    return spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-dark-400">Loading hackathons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900/20 via-dark-900 to-secondary-900/20 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              🚀 Live Hackathons
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Join exciting hackathons, build amazing projects, and win prizes!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hackathons by name, theme, or organization..."
                className="w-full pl-12 pr-4 py-4 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary-500 text-white placeholder-dark-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dark-400" />
              <span className="text-sm text-dark-400">Filters:</span>
            </div>

            {/* Mode Filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Modes</option>
              <option value="online">🌐 Online</option>
              <option value="offline">📍 Offline</option>
              <option value="hybrid">🔄 Hybrid</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="published">📢 Registration Open</option>
              <option value="active">⚡ In Progress</option>
              <option value="judging">⚖️ Judging</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="popular">🔥 Most Popular</option>
              <option value="newest">🆕 Newest</option>
              <option value="prize">💰 Highest Prize</option>
              <option value="deadline">⏰ Deadline Soon</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMode('all');
                setSelectedStatus('all');
                setSortBy('popular');
              }}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-dark-300">
            Found <span className="text-white font-semibold">{filteredHackathons.length}</span> hackathons
          </div>
        </div>

        {filteredHackathons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No hackathons found</h3>
            <p className="text-dark-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => (
              <Link
                key={hackathon._id}
                href={`/dashboard/hackathons/${hackathon._id}`}
                className="block group"
              >
                <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden hover:border-primary-500 transition-all hover:shadow-lg hover:shadow-primary-500/20">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-primary-900/30 to-secondary-900/30 relative overflow-hidden">
                    {hackathon.coverImage ? (
                      <img
                        src={hackathon.coverImage}
                        alt={hackathon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🏆
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(hackathon.status)}`}>
                      {hackathon.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Organization */}
                    <div className="flex items-center gap-2 mb-3">
                      {hackathon.organizationLogo && (
                        <img
                          src={hackathon.organizationLogo}
                          alt={hackathon.organizationName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm text-primary-400">{hackathon.organizationName}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {hackathon.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-sm text-dark-400 mb-4 line-clamp-2">{hackathon.tagline}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-dark-300">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
                        <span className="text-dark-500">•</span>
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span>{hackathon.duration}h</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-dark-300">
                        <span className={getModeBadge(hackathon.mode).color}>
                          {getModeBadge(hackathon.mode).icon} {hackathon.mode}
                        </span>
                        {hackathon.venue && (
                          <>
                            <span className="text-dark-500">•</span>
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{hackathon.venue}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-dark-300">
                        <Users className="w-4 h-4 text-green-400" />
                        <span>Team: {hackathon.minTeamSize}-{hackathon.maxTeamSize} members</span>
                      </div>
                    </div>

                    {/* Prize and Registration */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="text-xs text-dark-400">Prize Pool</div>
                          <div className="font-bold text-yellow-400">
                            ${hackathon.totalPrizePool.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-dark-400">
                          {hackathon.status === 'published' ? 'Starts in' : 'Started'}
                        </div>
                        <div className="font-semibold text-primary-400">
                          {getTimeUntil(hackathon.startDate)}
                        </div>
                        {getSpotsLeft(hackathon) && (
                          <div className="text-xs text-yellow-400 mt-1">
                            {getSpotsLeft(hackathon)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Registration Section */}
                    <div className="mt-4">
                      <RegistrationButton 
                        hackathonId={hackathon._id}
                        hackathonTitle={hackathon.title}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
