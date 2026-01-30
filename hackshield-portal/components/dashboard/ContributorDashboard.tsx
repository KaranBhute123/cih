'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  FolderGit2,
  Search,
  Filter,
  Star,
  ExternalLink,
  Heart,
  Eye,
  MessageSquare
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  tagline: string;
  technologies: string[];
  views: number;
  likes: number;
  placement?: number;
  team?: {
    name: string;
    members: any[];
  };
}

export default function ContributorDashboard() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    projectsViewed: 0,
    inquiriesSent: 0,
    investmentsMade: 0,
    totalInvested: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/projects?status=published&limit=6');
      if (res.ok) {
        const data = await res.json();
        setFeaturedProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickStats = [
    { 
      label: 'Projects Viewed', 
      value: stats.projectsViewed, 
      icon: Eye, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    { 
      label: 'Inquiries Sent', 
      value: stats.inquiriesSent, 
      icon: MessageSquare, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    { 
      label: 'Investments Made', 
      value: stats.investmentsMade, 
      icon: Briefcase, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    { 
      label: 'Total Invested', 
      value: `$${stats.totalInvested.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-br from-green-900/50 to-primary-900/50 border-green-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Contributor Dashboard 💼
            </h1>
            <p className="text-dark-300">
              Discover promising projects, invest in innovation, and connect with talented teams.
            </p>
          </div>
          <Link href="/dashboard/projects" className="btn-primary">
            <Search className="w-4 h-4 mr-2" />
            Discover Projects
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search projects by name, technology, or domain..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select className="input-field w-auto">
              <option value="">All Technologies</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="ai">AI/ML</option>
              <option value="blockchain">Blockchain</option>
            </select>
            <select className="input-field w-auto">
              <option value="">All Domains</option>
              <option value="healthtech">HealthTech</option>
              <option value="fintech">FinTech</option>
              <option value="edtech">EdTech</option>
              <option value="climate">Climate</option>
            </select>
            <button className="btn-secondary">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Projects
          </h2>
          <Link href="/dashboard/projects" className="text-primary-400 hover:text-primary-300 text-sm">
            View All →
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <FolderGit2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects available yet</h3>
            <p className="text-dark-400 mb-6">Check back later for new hackathon projects.</p>
            <Link href="/dashboard/hackathons" className="text-primary-400 hover:text-primary-300">
              Browse Hackathons →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div key={project._id} className="card-hover group">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary-900/50 to-secondary-900/50 mb-4 flex items-center justify-center">
                  <FolderGit2 className="w-12 h-12 text-dark-500" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold group-hover:text-primary-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  {project.placement && project.placement <= 3 && (
                    <span className="badge-warning text-xs">🏆 #{project.placement}</span>
                  )}
                </div>
                <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                  {project.tagline}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.slice(0, 3).map((tech) => (
                    <span key={tech} className="badge-primary text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="text-xs text-dark-400">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {project.likes || 0}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/projects/${project._id}`}
                    className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/projects"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Discover Projects</h3>
          <p className="text-dark-400 text-sm">Browse hackathon innovations</p>
        </Link>

        <Link 
          href="/dashboard/investments"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">My Investments</h3>
          <p className="text-dark-400 text-sm">Track your portfolio</p>
        </Link>

        <Link 
          href="/dashboard/messages"
          className="card-hover flex flex-col items-center text-center p-8 group"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Messages</h3>
          <p className="text-dark-400 text-sm">Connect with teams</p>
        </Link>
      </div>
    </div>
  );
}
