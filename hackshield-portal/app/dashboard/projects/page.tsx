'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Code, 
  Star, 
  Eye, 
  DollarSign,
  MessageSquare,
  ExternalLink,
  Heart,
  TrendingUp,
  Award,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  title: string;
  description: string;
  team: {
    _id: string;
    name: string;
  };
  hackathon: {
    _id: string;
    title: string;
  };
  technologies: string[];
  category: string;
  demoUrl?: string;
  repoUrl?: string;
  coverImage?: string;
  marketplaceStatus: string;
  pricing?: {
    type: string;
    amount?: number;
    equity?: number;
  };
  analytics: {
    views: number;
    inquiries: number;
    likes: number;
  };
  featured: boolean;
  awards: string[];
}

export default function ProjectsMarketplacePage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    pricingType: '',
    technology: '',
    sortBy: 'trending',
  });
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.pricingType) queryParams.set('pricingType', filters.pricingType);
      if (filters.technology) queryParams.set('technology', filters.technology);
      queryParams.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/projects?${queryParams}`);
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Use mock data for demonstration
      setProjects([
        {
          _id: '1',
          title: 'AI-Powered Code Review Bot',
          description: 'An intelligent code review assistant that uses GPT-4 to analyze pull requests and provide constructive feedback.',
          team: { _id: '1', name: 'CodeNinjas' },
          hackathon: { _id: '1', title: 'AI Innovation Challenge' },
          technologies: ['Python', 'OpenAI', 'GitHub API', 'FastAPI'],
          category: 'Developer Tools',
          demoUrl: 'https://demo.example.com',
          repoUrl: 'https://github.com/example',
          marketplaceStatus: 'available',
          pricing: { type: 'fixed', amount: 15000 },
          analytics: { views: 1250, inquiries: 8, likes: 45 },
          featured: true,
          awards: ['1st Place'],
        },
        {
          _id: '2',
          title: 'DeFi Portfolio Tracker',
          description: 'A comprehensive dashboard to track and manage DeFi investments across multiple chains.',
          team: { _id: '2', name: 'BlockchainBuilders' },
          hackathon: { _id: '2', title: 'Web3 Hackathon' },
          technologies: ['React', 'Ethers.js', 'The Graph', 'Node.js'],
          category: 'FinTech',
          marketplaceStatus: 'available',
          pricing: { type: 'equity', equity: 5 },
          analytics: { views: 980, inquiries: 12, likes: 67 },
          featured: true,
          awards: ['Best DeFi Project'],
        },
        {
          _id: '3',
          title: 'Smart Health Monitor',
          description: 'IoT-based health monitoring system with AI predictions for early disease detection.',
          team: { _id: '3', name: 'HealthTech Heroes' },
          hackathon: { _id: '3', title: 'HealthTech Summit' },
          technologies: ['IoT', 'Python', 'TensorFlow', 'React Native'],
          category: 'HealthTech',
          marketplaceStatus: 'available',
          pricing: { type: 'negotiable' },
          analytics: { views: 2100, inquiries: 25, likes: 120 },
          featured: false,
          awards: [],
        },
        {
          _id: '4',
          title: 'EdTech Learning Platform',
          description: 'Gamified learning platform for K-12 students with adaptive AI tutoring.',
          team: { _id: '4', name: 'LearnSquad' },
          hackathon: { _id: '4', title: 'EdTech Innovation' },
          technologies: ['Next.js', 'MongoDB', 'OpenAI', 'WebRTC'],
          category: 'EdTech',
          marketplaceStatus: 'available',
          pricing: { type: 'fixed', amount: 25000 },
          analytics: { views: 1500, inquiries: 15, likes: 89 },
          featured: false,
          awards: ['Best UX Design'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (projectId: string) => {
    const newLiked = new Set(likedProjects);
    if (newLiked.has(projectId)) {
      newLiked.delete(projectId);
    } else {
      newLiked.add(projectId);
    }
    setLikedProjects(newLiked);
  };

  const categories = ['Developer Tools', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Social', 'Gaming', 'AI/ML'];
  const pricingTypes = ['fixed', 'equity', 'negotiable'];
  const technologies = ['React', 'Python', 'Node.js', 'AI/ML', 'Blockchain', 'IoT', 'Mobile'];
  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'mostLiked', label: 'Most Liked' },
    { value: 'mostViewed', label: 'Most Viewed' },
  ];

  const filteredProjects = projects.filter(project => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getPricingDisplay = (pricing?: { type: string; amount?: number; equity?: number }) => {
    if (!pricing) return 'Contact';
    if (pricing.type === 'fixed' && pricing.amount) return `$${pricing.amount.toLocaleString()}`;
    if (pricing.type === 'equity' && pricing.equity) return `${pricing.equity}% Equity`;
    return 'Negotiable';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Marketplace</h1>
        <p className="text-dark-400">Discover innovative hackathon projects ready for investment or acquisition</p>
      </div>

      {/* Featured Projects */}
      {projects.filter(p => p.featured).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.filter(p => p.featured).map(project => (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className="card p-6 hover:border-primary-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1">
                  FEATURED
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400">
                  {project.title}
                </h3>
                <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 4).map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-dark-700 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>

                {project.awards.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {project.awards.map((award, i) => (
                      <span key={i} className="flex items-center gap-1 text-sm text-yellow-400">
                        <Award className="w-4 h-4" />
                        {award}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.analytics.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {project.analytics.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {project.analytics.inquiries}
                    </span>
                  </div>
                  <span className="text-primary-400 font-bold">
                    {getPricingDisplay(project.pricing)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search projects by name, description, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
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

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="input-field md:w-48"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pricing Type</label>
            <select
              value={filters.pricingType}
              onChange={(e) => setFilters({ ...filters, pricingType: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              {pricingTypes.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Technology</label>
            <select
              value={filters.technology}
              onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
              className="input-field"
            >
              <option value="">All Technologies</option>
              {technologies.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="card p-12 text-center">
          <Code className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Projects Found</h2>
          <p className="text-dark-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.filter(p => !p.featured).map(project => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="card p-6 hover:border-primary-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="badge-primary text-xs">{project.category}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(project._id);
                  }}
                  className={`p-1 rounded ${likedProjects.has(project._id) ? 'text-red-400' : 'text-dark-400 hover:text-red-400'}`}
                >
                  <Heart className={`w-5 h-5 ${likedProjects.has(project._id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h3 className="text-lg font-bold mb-2 group-hover:text-primary-400 line-clamp-1">
                {project.title}
              </h3>
              <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-dark-400 mb-4">
                <span>by</span>
                <span className="text-primary-400">{project.team.name}</span>
                <span>•</span>
                <span>{project.hackathon.title}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-xs">
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-0.5 bg-dark-700 rounded text-xs">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {project.analytics.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {project.analytics.likes}
                  </span>
                </div>
                <span className="text-primary-400 font-bold text-sm">
                  {getPricingDisplay(project.pricing)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
