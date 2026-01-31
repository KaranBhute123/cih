'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search,
  Filter,
  Star,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Code,
  ExternalLink,
  Play,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Building,
  Target,
  Zap,
  Trophy,
  Calendar,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Mail,
  Phone,
  Clock,
  ArrowUpRight,
  ChevronDown,
  Briefcase,
  GraduationCap,
  PiggyBank,
  Handshake,
  Lightbulb
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail?: string;
  demoVideo?: string;
  liveDemo?: string;
  githubRepo?: string;
  technologies: string[];
  domain: string[];
  team: {
    name: string;
    members: Array<{
      name: string;
      role: string;
      avatar?: string;
      linkedin?: string;
      github?: string;
    }>;
    size: number;
  };
  hackathon: {
    name: string;
    placement?: string;
    date: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
    shares: number;
  };
  codeQuality: {
    score: number;
    linesOfCode: number;
    commits: number;
    testCoverage?: number;
    securityScore?: number;
  };
  blockchain: {
    verified: boolean;
    originalityScore: number;
    aiDependency: number;
  };
  seeking: Array<'investment' | 'mentor' | 'designer' | 'developer' | 'marketing' | 'legal'>;
  stage: 'concept' | 'mvp' | 'beta' | 'production';
  traction?: {
    users?: number;
    revenue?: number;
    growth?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Contributor {
  _id: string;
  name: string;
  avatar?: string;
  type: 'company' | 'investor' | 'mentor' | 'freelancer' | 'accelerator';
  title: string;
  company?: string;
  bio: string;
  expertise: string[];
  investmentRange?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  email?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  portfolio: Array<{
    title: string;
    description: string;
    image?: string;
    link?: string;
  }>;
  stats: {
    projectsSupported: number;
    totalInvestment?: number;
    successRate: number;
    responseTime: string;
  };
}

const DOMAIN_COLORS = {
  'HealthTech': 'bg-red-500/20 text-red-400 border-red-500/30',
  'FinTech': 'bg-green-500/20 text-green-400 border-green-500/30',
  'EdTech': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'CleanTech': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Social Impact': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'E-commerce': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'AI/ML': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
};

const STAGE_COLORS = {
  concept: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  mvp: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const CONTRIBUTOR_TYPE_ICONS = {
  company: Building,
  investor: PiggyBank,
  mentor: GraduationCap,
  freelancer: Briefcase,
  accelerator: Zap
};

export default function ContributorMarketplace() {
  const [activeTab, setActiveTab] = useState<'projects' | 'contributors'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string[]>([]);
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [seekingFilter, setSeekingFilter] = useState<string[]>([]);
  const [contributorTypeFilter, setContributorTypeFilter] = useState<string[]>([]);
  
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchContributors();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/marketplace/projects');
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const response = await fetch('/api/marketplace/contributors');
      const data = await response.json();
      if (response.ok) {
        setContributors(data.contributors);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="glass border border-dark-700 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
        {project.thumbnail ? (
          <Image 
            src={project.thumbnail} 
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Trophy className="w-16 h-16 text-primary-500/50" />
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {project.liveDemo && (
            <a 
              href={project.liveDemo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-green-500 rounded-full hover:bg-green-400 transition-colors"
            >
              <Play className="w-5 h-5 text-white" />
            </a>
          )}
          {project.githubRepo && (
            <a 
              href={project.githubRepo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-dark-800 rounded-full hover:bg-dark-700 transition-colors"
            >
              <Github className="w-5 h-5 text-white" />
            </a>
          )}
          <button className="p-2 bg-red-500 rounded-full hover:bg-red-400 transition-colors">
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Placement Badge */}
        {project.hackathon.placement && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {project.hackathon.placement}
            </span>
          </div>
        )}

        {/* Blockchain Verified */}
        {project.blockchain.verified && (
          <div className="absolute top-3 right-3">
            <div className="p-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30">
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Domain */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
          <div className="flex flex-wrap gap-1">
            {project.domain.map(domain => (
              <span 
                key={domain} 
                className={`px-2 py-1 text-xs rounded-full border ${DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-dark-200 text-sm mb-4 line-clamp-2">{project.description}</p>

        {/* Team Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {project.team.members.slice(0, 3).map((member, index) => (
              <div key={index} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-medium border-2 border-dark-900">
                {member.avatar ? (
                  <Image src={member.avatar} alt={member.name} width={32} height={32} className="rounded-full" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
            ))}
            {project.team.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-white text-xs font-medium border-2 border-dark-900">
                +{project.team.members.length - 3}
              </div>
            )}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{project.team.name}</div>
            <div className="text-dark-300 text-xs">{project.team.size} members</div>
          </div>
        </div>

        {/* Technologies */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map(tech => (
              <span key={tech} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30">
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-white font-medium text-sm">{project.metrics.views}</div>
            <div className="text-dark-400 text-xs">Views</div>
          </div>
          <div>
            <div className="text-white font-medium text-sm">{project.metrics.likes}</div>
            <div className="text-dark-400 text-xs">Likes</div>
          </div>
          <div>
            <div className="text-white font-medium text-sm">{project.codeQuality.score}</div>
            <div className="text-dark-400 text-xs">Quality</div>
          </div>
          <div>
            <div className="text-green-400 font-medium text-sm">{project.blockchain.originalityScore}%</div>
            <div className="text-dark-400 text-xs">Original</div>
          </div>
        </div>

        {/* Seeking */}
        <div className="mb-4">
          <div className="text-dark-300 text-xs mb-2">Looking for:</div>
          <div className="flex flex-wrap gap-1">
            {project.seeking.map(seek => (
              <span key={seek} className="px-2 py-1 bg-secondary-500/20 text-secondary-400 text-xs rounded-full border border-secondary-500/30">
                {seek}
              </span>
            ))}
          </div>
        </div>

        {/* Stage & Traction */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 text-xs rounded-full border capitalize ${STAGE_COLORS[project.stage]}`}>
            {project.stage}
          </span>
          {project.traction?.users && (
            <div className="text-right">
              <div className="text-white text-sm font-medium">{project.traction.users.toLocaleString()}</div>
              <div className="text-dark-400 text-xs">Users</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link 
            href={`/marketplace/projects/${project._id}`}
            className="flex-1 btn-secondary text-center py-2 text-sm"
          >
            View Details
          </Link>
          <button className="flex-1 btn-primary py-2 text-sm">
            Express Interest
          </button>
        </div>
      </div>
    </div>
  );

  const ContributorCard = ({ contributor }: { contributor: Contributor }) => {
    const IconComponent = CONTRIBUTOR_TYPE_ICONS[contributor.type];
    
    return (
      <div className="glass border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {contributor.avatar ? (
              <Image 
                src={contributor.avatar} 
                alt={contributor.name}
                width={60}
                height={60}
                className="rounded-full"
              />
            ) : (
              <div className="w-15 h-15 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {contributor.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            {contributor.verified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{contributor.name}</h3>
            <p className="text-primary-400 text-sm">{contributor.title}</p>
            {contributor.company && (
              <p className="text-dark-300 text-sm">{contributor.company}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm">{contributor.rating}</span>
                <span className="text-dark-400 text-sm">({contributor.reviewCount})</span>
              </div>
              <IconComponent className="w-4 h-4 text-secondary-400" />
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-dark-200 text-sm mb-4 line-clamp-3">{contributor.bio}</p>

        {/* Expertise */}
        <div className="mb-4">
          <div className="text-dark-300 text-xs mb-2">Expertise:</div>
          <div className="flex flex-wrap gap-1">
            {contributor.expertise.slice(0, 4).map(skill => (
              <span key={skill} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                {skill}
              </span>
            ))}
            {contributor.expertise.length > 4 && (
              <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                +{contributor.expertise.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Investment Range */}
        {contributor.investmentRange && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-green-400">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">{contributor.investmentRange}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <div className="text-white font-medium">{contributor.stats.projectsSupported}</div>
            <div className="text-dark-400 text-xs">Projects</div>
          </div>
          <div>
            <div className="text-white font-medium">{contributor.stats.successRate}%</div>
            <div className="text-dark-400 text-xs">Success</div>
          </div>
          <div>
            <div className="text-white font-medium">{contributor.stats.responseTime}</div>
            <div className="text-dark-400 text-xs">Response</div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex gap-2">
          <button className="flex-1 btn-secondary py-2 text-sm">
            View Profile
          </button>
          <button className="flex-1 btn-primary py-2 text-sm">
            Connect
          </button>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-dark-700">
          {contributor.website && (
            <a href={contributor.website} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white">
              <Globe className="w-4 h-4" />
            </a>
          )}
          {contributor.linkedin && (
            <a href={contributor.linkedin} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {contributor.email && (
            <a href={`mailto:${contributor.email}`} className="text-dark-400 hover:text-white">
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Contributor Marketplace</h1>
          <p className="text-dark-200">Connect innovative projects with the right contributors</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 glass rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4 inline mr-2" />
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('contributors')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'contributors'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4 inline mr-2" />
              Contributors ({contributors.length})
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder={activeTab === 'projects' ? 'Search projects, technologies, domains...' : 'Search contributors, skills, companies...'}
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
              <option value="popularity">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="glass border border-dark-700 rounded-lg p-6 mb-6">
              {activeTab === 'projects' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Domain Filter */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Domain</h4>
                    {Object.keys(DOMAIN_COLORS).map(domain => (
                      <label key={domain} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={domainFilter.includes(domain)}
                          onChange={() => {
                            setDomainFilter(prev => 
                              prev.includes(domain) 
                                ? prev.filter(d => d !== domain)
                                : [...prev, domain]
                            );
                          }}
                          className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-200 text-sm">{domain}</span>
                      </label>
                    ))}
                  </div>

                  {/* Stage Filter */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Stage</h4>
                    {Object.keys(STAGE_COLORS).map(stage => (
                      <label key={stage} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={stageFilter.includes(stage)}
                          onChange={() => {
                            setStageFilter(prev => 
                              prev.includes(stage) 
                                ? prev.filter(s => s !== stage)
                                : [...prev, stage]
                            );
                          }}
                          className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-200 text-sm capitalize">{stage}</span>
                      </label>
                    ))}
                  </div>

                  {/* Technology Filter */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Technology</h4>
                    {['React', 'Python', 'AI/ML', 'Blockchain', 'Mobile', 'Node.js'].map(tech => (
                      <label key={tech} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={techFilter.includes(tech)}
                          onChange={() => {
                            setTechFilter(prev => 
                              prev.includes(tech) 
                                ? prev.filter(t => t !== tech)
                                : [...prev, tech]
                            );
                          }}
                          className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-200 text-sm">{tech}</span>
                      </label>
                    ))}
                  </div>

                  {/* Seeking Filter */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Seeking</h4>
                    {['investment', 'mentor', 'designer', 'developer', 'marketing'].map(seek => (
                      <label key={seek} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={seekingFilter.includes(seek)}
                          onChange={() => {
                          setSeekingFilter(prev => 
                              prev.includes(seek) 
                                ? prev.filter(s => s !== seek)
                                : [...prev, seek]
                            );
                          }}
                          className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-200 text-sm capitalize">{seek}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Contributor Type Filter */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Type</h4>
                    {Object.keys(CONTRIBUTOR_TYPE_ICONS).map(type => (
                      <label key={type} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={contributorTypeFilter.includes(type)}
                          onChange={() => {
                            setContributorTypeFilter(prev => 
                              prev.includes(type) 
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                          }}
                          className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-200 text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            activeTab === 'projects' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {activeTab === 'projects' ? (
              projects.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Lightbulb className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                  <p className="text-dark-300">Try adjusting your search criteria</p>
                </div>
              ) : (
                projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))
              )
            ) : (
              contributors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Handshake className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No contributors found</h3>
                  <p className="text-dark-300">Try adjusting your search criteria</p>
                </div>
              ) : (
                contributors.map(contributor => (
                  <ContributorCard key={contributor._id} contributor={contributor} />
                ))
              )
            )}
          </div>
        )}

        {/* Load More */}
        {(activeTab === 'projects' ? projects.length : contributors.length) > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}