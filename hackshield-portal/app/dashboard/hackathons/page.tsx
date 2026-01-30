'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import RegistrationButton from '@/components/hackathons/RegistrationButton';
import { 
  Trophy, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  DollarSign,
  Wifi,
  Building,
  ChevronDown,
  X,
  ArrowRight
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
  venue?: string;
  totalPrizePool: number;
  registeredTeams: string[];
  maxTeams?: number;
  minTeamSize: number;
  maxTeamSize: number;
  allowedTechnologies: string[];
  status: string;
}

const themes = [
  'All Themes',
  'AI/ML',
  'Blockchain',
  'Web Development',
  'Mobile',
  'IoT',
  'HealthTech',
  'FinTech',
  'EdTech',
  'Climate',
  'Social Impact',
];

const modes = ['All', 'Online', 'Offline', 'Hybrid'];

const prizeRanges = [
  { label: 'Any Prize', min: 0, max: Infinity },
  { label: '$0 - $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $5,000', min: 1000, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000+', min: 10000, max: Infinity },
];

export default function HackathonsPage() {
  const { data: session } = useSession();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('All Themes');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedPrizeRange, setSelectedPrizeRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await fetch('/api/hackathons');
      if (res.ok) {
        const data = await res.json();
        setHackathons(data.hackathons || []);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter((hackathon) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        hackathon.title.toLowerCase().includes(query) ||
        hackathon.description.toLowerCase().includes(query) ||
        hackathon.theme.toLowerCase().includes(query) ||
        hackathon.organizationName.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Theme filter
    if (selectedTheme !== 'All Themes' && hackathon.theme !== selectedTheme) {
      return false;
    }

    // Mode filter
    if (selectedMode !== 'All' && hackathon.mode !== selectedMode.toLowerCase()) {
      return false;
    }

    // Prize range filter
    const prizeRange = prizeRanges[selectedPrizeRange];
    if (
      hackathon.totalPrizePool < prizeRange.min ||
      hackathon.totalPrizePool > prizeRange.max
    ) {
      return false;
    }

    return true;
  });

  const getTimeUntil = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return <Wifi className="w-4 h-4" />;
      case 'offline':
        return <Building className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Hackathon Marketplace
          </h1>
          <p className="text-dark-400 mt-1">
            Discover and join exciting coding competitions
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search hackathons by name, theme, or organization..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-700 grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Theme</label>
              <select
                className="input-field"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Mode</label>
              <select
                className="input-field"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
              >
                {modes.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Prize Pool</label>
              <select
                className="input-field"
                value={selectedPrizeRange}
                onChange={(e) => setSelectedPrizeRange(parseInt(e.target.value))}
              >
                {prizeRanges.map((range, index) => (
                  <option key={index} value={index}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(selectedTheme !== 'All Themes' || selectedMode !== 'All' || selectedPrizeRange !== 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTheme !== 'All Themes' && (
              <span className="badge-primary flex items-center gap-1">
                {selectedTheme}
                <button onClick={() => setSelectedTheme('All Themes')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedMode !== 'All' && (
              <span className="badge-primary flex items-center gap-1">
                {selectedMode}
                <button onClick={() => setSelectedMode('All')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedPrizeRange !== 0 && (
              <span className="badge-primary flex items-center gap-1">
                {prizeRanges[selectedPrizeRange].label}
                <button onClick={() => setSelectedPrizeRange(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedTheme('All Themes');
                setSelectedMode('All');
                setSelectedPrizeRange(0);
              }}
              className="text-sm text-dark-400 hover:text-white"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-dark-400">
        Showing {filteredHackathons.length} hackathon{filteredHackathons.length !== 1 ? 's' : ''}
      </div>

      {/* Hackathon Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-dark-700 rounded-lg mb-4" />
              <div className="h-6 bg-dark-700 rounded mb-2 w-3/4" />
              <div className="h-4 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hackathons found</h3>
          <p className="text-dark-400">
            {searchQuery || selectedTheme !== 'All Themes' || selectedMode !== 'All' || selectedPrizeRange !== 0
              ? 'Try adjusting your filters or search query.'
              : 'Check back later for new hackathons.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <div
              key={hackathon._id}
              className="card-hover group"
            >
              {/* Cover Image - Clickable */}
              <Link href={`/dashboard/hackathons/${hackathon._id}`} className="block">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary-900/50 to-secondary-900/50 mb-4 flex items-center justify-center overflow-hidden">
                  {hackathon.coverImage ? (
                    <img
                      src={hackathon.coverImage}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Trophy className="w-12 h-12 text-dark-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </Link>

              {/* Content - Clickable */}
              <Link href={`/dashboard/hackathons/${hackathon._id}`} className="block">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary-400 transition-colors line-clamp-1">
                    {hackathon.title}
                  </h3>
                  <span className={`badge capitalize shrink-0 ${
                    hackathon.status === 'active' ? 'badge-success' : 'badge-primary'
                  }`}>
                    {hackathon.status}
                  </span>
                </div>

                <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                  {hackathon.tagline || hackathon.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge bg-dark-700 text-dark-300">
                    {hackathon.theme}
                  </span>
                  <span className="badge bg-dark-700 text-dark-300 flex items-center gap-1">
                    {getModeIcon(hackathon.mode)}
                    {hackathon.mode}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-dark-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-accent-400 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {hackathon.totalPrizePool >= 1000
                        ? `${(hackathon.totalPrizePool / 1000).toFixed(0)}K`
                        : hackathon.totalPrizePool}
                    </div>
                    <div className="text-xs text-dark-400">Prize</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 font-semibold">
                      <Users className="w-4 h-4" />
                      {hackathon.registeredTeams?.length || 0}
                    </div>
                    <div className="text-xs text-dark-400">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 font-semibold">
                      <Clock className="w-4 h-4" />
                      {hackathon.duration}h
                    </div>
                    <div className="text-xs text-dark-400">Duration</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-700 mb-4">
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(hackathon.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-primary-400">
                    Starts in {getTimeUntil(hackathon.startDate)}
                  </div>
                </div>
              </Link>

              {/* Registration Button - Interactive (not wrapped in Link) */}
              {session?.user?.role === 'participant' && (
                <div className="pt-4 border-t border-dark-700">
                  <RegistrationButton 
                    hackathonId={hackathon._id}
                    hackathonTitle={hackathon.title}
                    minTeamSize={hackathon.minTeamSize}
                    maxTeamSize={hackathon.maxTeamSize}
                  />
                  <Link 
                    href={`/dashboard/hackathons/${hackathon._id}`}
                    className="mt-3 flex items-center justify-center gap-2 text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Organization Actions */}
              {session?.user?.role === 'organization' && (
                <div className="pt-4 border-t border-dark-700 space-y-2">
                  <Link 
                    href={`/dashboard/hackathons/${hackathon._id}/monitor`}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                  >
                    Live Monitoring
                  </Link>
                  <Link 
                    href={`/dashboard/organization/registrations`}
                    className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                  >
                    View Registrations
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
