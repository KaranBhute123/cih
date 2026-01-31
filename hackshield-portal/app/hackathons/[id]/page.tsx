'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Trophy,
  Code,
  Brain,
  Shield,
  Share2,
  Bookmark,
  Heart,
  ExternalLink,
  Download,
  Play,
  ChevronRight,
  Award,
  DollarSign,
  Globe,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';

interface HackathonDetail {
  _id: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  theme: string;
  coverImage?: string;
  videoIntro?: string;
  organization: {
    _id: string;
    name: string;
    logo?: string;
    website?: string;
    verified: boolean;
  };
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  duration: number;
  mode: 'online' | 'offline' | 'hybrid';
  location?: string;
  venue?: {
    address: string;
    capacity: number;
    parking: string;
    food: string;
  };
  prizePool: number;
  prizes: Array<{
    place: string;
    amount: number;
    description?: string;
  }>;
  specialAwards: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
  nonMonetaryPrizes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  prohibitedTechnologies?: string[];
  allowedFrameworks: string[];
  externalLibrariesAllowed: boolean;
  preBuiltCodeAllowed: boolean;
  aiAssistanceLevel: 'strict' | 'moderate' | 'permissive';
  minTeamSize: number;
  maxTeamSize: number;
  soloParticipationAllowed: boolean;
  judgingCriteria: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
  judges: Array<{
    name: string;
    title: string;
    company: string;
    avatar?: string;
    bio: string;
  }>;
  sponsors: Array<{
    name: string;
    logo: string;
    tier: 'gold' | 'silver' | 'bronze';
    website?: string;
  }>;
  registeredTeams: number;
  maxParticipants: number;
  waitlistCount: number;
  status: 'draft' | 'published' | 'active' | 'judging' | 'completed';
  features: {
    neuralFairness: boolean;
    blockchain: boolean;
    geolocation: boolean;
    identityChecks: boolean;
    carbonOffset: boolean;
    accessibility: boolean;
  };
  timeline: Array<{
    phase: string;
    description: string;
    startTime: string;
    endTime: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  rules: string[];
  codeOfConduct: string;
  contactInfo: {
    email: string;
    discord?: string;
    slack?: string;
  };
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchHackathonDetail(params.id as string);
    }
  }, [params.id]);

  const fetchHackathonDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/hackathons/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setHackathon(data.hackathon);
      } else {
        console.error('Error fetching hackathon:', data.error);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return { expired: true, text: 'Registration Closed' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { expired: false, text: `${days}d ${hours}h ${minutes}m` };
    if (hours > 0) return { expired: false, text: `${hours}h ${minutes}m` };
    return { expired: false, text: `${minutes}m` };
  };

  const handleRegistration = () => {
    router.push(`/hackathons/${params.id}/register`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hackathon?.title,
          text: hackathon?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

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
          <p className="text-dark-300 mb-4">The hackathon you're looking for doesn't exist.</p>
          <Link href="/hackathons" className="btn-primary">
            Browse Hackathons
          </Link>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(hackathon.registrationEnd);
  const registrationProgress = (hackathon.registeredTeams / (hackathon.maxParticipants / hackathon.maxTeamSize)) * 100;

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-96 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 relative">
          {hackathon.coverImage ? (
            <Image 
              src={hackathon.coverImage} 
              alt={hackathon.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Trophy className="w-32 h-32 text-primary-500/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-32 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="glass border border-dark-700 rounded-xl p-8">
                  {/* Organization Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    {hackathon.organization.logo && (
                      <Image 
                        src={hackathon.organization.logo} 
                        alt={hackathon.organization.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{hackathon.organization.name}</span>
                        {hackathon.organization.verified && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      {hackathon.organization.website && (
                        <a 
                          href={hackathon.organization.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-400 hover:underline"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title & Theme */}
                  <h1 className="text-4xl font-bold text-white mb-2">{hackathon.title}</h1>
                  <p className="text-xl text-primary-400 mb-4">"{hackathon.theme}"</p>
                  <p className="text-dark-200 mb-6">{hackathon.description}</p>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                      <Calendar className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                      <div className="text-white font-medium">
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-dark-300">Start Date</div>
                    </div>
                    <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                      <Clock className="w-6 h-6 text-secondary-400 mx-auto mb-2" />
                      <div className="text-white font-medium">{hackathon.duration}h</div>
                      <div className="text-xs text-dark-300">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-white font-medium">${hackathon.prizePool.toLocaleString()}</div>
                      <div className="text-xs text-dark-300">Prize Pool</div>
                    </div>
                    <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                      <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-white font-medium">{hackathon.registeredTeams} teams</div>
                      <div className="text-xs text-dark-300">Registered</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm border ${
                      hackathon.mode === 'online' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      hackathon.mode === 'offline' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {hackathon.mode}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm border ${
                      hackathon.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      hackathon.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {hackathon.difficulty}
                    </span>
                    {hackathon.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registration Card */}
              <div className="lg:col-span-1">
                <div className="glass border border-dark-700 rounded-xl p-6 sticky top-24">
                  {/* Countdown Timer */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white mb-2">
                      {timeRemaining.expired ? (
                        <span className="text-red-400">Closed</span>
                      ) : (
                        timeRemaining.text
                      )}
                    </div>
                    <div className="text-sm text-dark-300">
                      {timeRemaining.expired ? 'Registration has ended' : 'Registration ends'}
                    </div>
                  </div>

                  {/* Registration Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-dark-200 mb-2">
                      <span>Registration Progress</span>
                      <span>{Math.floor(registrationProgress)}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(registrationProgress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-dark-300 mt-2">
                      {hackathon.registeredTeams} of {Math.floor(hackathon.maxParticipants / hackathon.maxTeamSize)} teams registered
                    </div>
                  </div>

                  {/* Prize Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-medium text-white mb-3">Prize Breakdown</h4>
                    <div className="space-y-2">
                      {hackathon.prizes.map((prize, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-dark-200">{prize.place}</span>
                          <span className="text-white font-medium">${prize.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      {hackathon.specialAwards.map((award, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-dark-200">{award.name}</span>
                          <span className="text-white font-medium">${award.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!timeRemaining.expired && hackathon.status === 'published' ? (
                      <button 
                        onClick={handleRegistration}
                        className="w-full btn-primary py-3"
                      >
                        Register Now
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full btn-secondary py-3 opacity-50 cursor-not-allowed"
                      >
                        {hackathon.status === 'completed' ? 'Hackathon Ended' : 'Registration Closed'}
                      </button>
                    )}
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleShare}
                        className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button 
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          isBookmarked 
                            ? 'bg-primary-500 border-primary-500 text-white' 
                            : 'bg-dark-800 border-dark-600 text-dark-200 hover:border-primary-500'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          isLiked 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'bg-dark-800 border-dark-600 text-dark-200 hover:border-red-500'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-dark-700">
                    <h4 className="font-medium text-white mb-3">Platform Features</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {hackathon.features.neuralFairness && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Brain className="w-4 h-4" />
                          <span>AI Fairness</span>
                        </div>
                      )}
                      {hackathon.features.blockchain && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Shield className="w-4 h-4" />
                          <span>Blockchain</span>
                        </div>
                      )}
                      {hackathon.features.accessibility && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Users className="w-4 h-4" />
                          <span>Accessible</span>
                        </div>
                      )}
                      {hackathon.features.carbonOffset && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Globe className="w-4 h-4" />
                          <span>Carbon Neutral</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="glass border border-dark-700 rounded-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-dark-700">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Globe },
                { id: 'rules', label: 'Rules & Guidelines', icon: Shield },
                { id: 'judging', label: 'Judging', icon: Award },
                { id: 'timeline', label: 'Timeline', icon: Timer },
                { id: 'sponsors', label: 'Sponsors', icon: DollarSign },
                { id: 'faq', label: 'FAQ', icon: AlertCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-dark-300 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Long Description */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">About This Hackathon</h3>
                  <div className="text-dark-200 prose prose-invert max-w-none">
                    {hackathon.longDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Video Introduction */}
                {hackathon.videoIntro && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Introduction Video</h3>
                    <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden">
                      <iframe
                        src={hackathon.videoIntro}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Technologies */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Technologies & Frameworks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Allowed Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.technologies.map((tech, index) => (
                          <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {hackathon.prohibitedTechnologies && hackathon.prohibitedTechnologies.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-3">Prohibited Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.prohibitedTechnologies.map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Requirements */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Team Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass p-4 rounded-lg">
                      <Users className="w-8 h-8 text-primary-400 mb-2" />
                      <div className="text-white font-medium">Team Size</div>
                      <div className="text-dark-200">{hackathon.minTeamSize} - {hackathon.maxTeamSize} members</div>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <Code className="w-8 h-8 text-secondary-400 mb-2" />
                      <div className="text-white font-medium">Solo Allowed</div>
                      <div className="text-dark-200">{hackathon.soloParticipationAllowed ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <Brain className="w-8 h-8 text-green-400 mb-2" />
                      <div className="text-white font-medium">AI Assistance</div>
                      <div className="text-dark-200 capitalize">{hackathon.aiAssistanceLevel}</div>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                {hackathon.mode !== 'online' && hackathon.venue && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Venue Information</h3>
                    <div className="glass p-6 rounded-lg">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-primary-400 mt-1" />
                        <div>
                          <div className="text-white font-medium mb-2">{hackathon.venue.address}</div>
                          <div className="text-dark-200 mb-4">Capacity: {hackathon.venue.capacity} participants</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-dark-300">Parking:</span>
                              <span className="text-white ml-2">{hackathon.venue.parking}</span>
                            </div>
                            <div>
                              <span className="text-dark-300">Food:</span>
                              <span className="text-white ml-2">{hackathon.venue.food}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Rules & Guidelines</h3>
                  <div className="space-y-4">
                    {hackathon.rules.map((rule, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-dark-200">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Code of Conduct</h3>
                  <div className="glass p-6 rounded-lg">
                    <p className="text-dark-200 leading-relaxed">{hackathon.codeOfConduct}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Technical Guidelines</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">External Libraries</h4>
                      <p className="text-dark-200">
                        {hackathon.externalLibrariesAllowed ? 'Allowed' : 'Not Allowed'}
                      </p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">Pre-built Code</h4>
                      <p className="text-dark-200">
                        {hackathon.preBuiltCodeAllowed ? 'Allowed with restrictions' : 'Not Allowed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'judging' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Judging Criteria</h3>
                  <div className="space-y-4">
                    {hackathon.judgingCriteria.map((criteria, index) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-white">{criteria.name}</h4>
                          <span className="text-primary-400 font-medium">{criteria.weight}%</span>
                        </div>
                        <p className="text-dark-200 text-sm">{criteria.description}</p>
                        <div className="mt-2">
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                              style={{ width: `${criteria.weight}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Judge Panel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathon.judges.map((judge, index) => (
                      <div key={index} className="glass p-6 rounded-lg text-center">
                        {judge.avatar ? (
                          <Image 
                            src={judge.avatar} 
                            alt={judge.name}
                            width={80}
                            height={80}
                            className="rounded-full mx-auto mb-4"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                            {judge.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <h4 className="font-medium text-white mb-1">{judge.name}</h4>
                        <p className="text-primary-400 text-sm mb-1">{judge.title}</p>
                        <p className="text-dark-300 text-sm mb-3">{judge.company}</p>
                        <p className="text-dark-200 text-xs leading-relaxed">{judge.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Event Timeline</h3>
                <div className="space-y-6">
                  {hackathon.timeline.map((event, index) => (
                    <div key={index} className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        {index < hackathon.timeline.length - 1 && (
                          <div className="w-px h-16 bg-dark-700 ml-6 mt-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-white mb-2">{event.phase}</h4>
                        <p className="text-dark-200 mb-3">{event.description}</p>
                        <div className="flex gap-4 text-sm text-dark-300">
                          <div>
                            <span>Start: </span>
                            <span>{new Date(event.startTime).toLocaleString()}</span>
                          </div>
                          <div>
                            <span>End: </span>
                            <span>{new Date(event.endTime).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sponsors' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Sponsors & Partners</h3>
                
                {/* Group sponsors by tier */}
                {['gold', 'silver', 'bronze'].map(tier => {
                  const tierSponsors = hackathon.sponsors.filter(s => s.tier === tier);
                  if (tierSponsors.length === 0) return null;
                  
                  return (
                    <div key={tier}>
                      <h4 className="text-lg font-medium text-white mb-4 capitalize">{tier} Sponsors</h4>
                      <div className={`grid gap-6 ${
                        tier === 'gold' ? 'grid-cols-1 md:grid-cols-2' :
                        tier === 'silver' ? 'grid-cols-2 md:grid-cols-3' :
                        'grid-cols-3 md:grid-cols-4'
                      }`}>
                        {tierSponsors.map((sponsor, index) => (
                          <div key={index} className="glass p-6 rounded-lg text-center group hover:border-primary-500/50 transition-colors">
                            <Image 
                              src={sponsor.logo} 
                              alt={sponsor.name}
                              width={tier === 'gold' ? 120 : tier === 'silver' ? 80 : 60}
                              height={tier === 'gold' ? 120 : tier === 'silver' ? 80 : 60}
                              className="mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <h5 className="font-medium text-white mb-2">{sponsor.name}</h5>
                            {sponsor.website && (
                              <a 
                                href={sponsor.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:underline text-sm flex items-center justify-center gap-1"
                              >
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {hackathon.faq.map((item, index) => (
                    <details key={index} className="glass rounded-lg">
                      <summary className="p-6 cursor-pointer text-white font-medium hover:text-primary-400 transition-colors">
                        {item.question}
                      </summary>
                      <div className="px-6 pb-6">
                        <p className="text-dark-200 leading-relaxed">{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
                
                <div className="glass p-6 rounded-lg">
                  <h4 className="font-medium text-white mb-4">Need More Help?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-dark-300">Email:</span>
                      <a href={`mailto:${hackathon.contactInfo.email}`} className="text-primary-400 hover:underline">
                        {hackathon.contactInfo.email}
                      </a>
                    </div>
                    {hackathon.contactInfo.discord && (
                      <div className="flex items-center gap-2">
                        <span className="text-dark-300">Discord:</span>
                        <a href={hackathon.contactInfo.discord} className="text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">
                          Join Server
                        </a>
                      </div>
                    )}
                    {hackathon.contactInfo.slack && (
                      <div className="flex items-center gap-2">
                        <span className="text-dark-300">Slack:</span>
                        <a href={hackathon.contactInfo.slack} className="text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">
                          Join Workspace
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}