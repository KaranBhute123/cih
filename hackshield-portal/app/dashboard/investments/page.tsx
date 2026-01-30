'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  ExternalLink,
  Eye,
  MessageSquare,
  BarChart3,
  PieChart,
  Calendar,
  Star,
  Award,
  Target,
  Wallet,
  ArrowUpRight,
  Filter,
  Search
} from 'lucide-react';

interface Investment {
  id: string;
  project: {
    id: string;
    name: string;
    description: string;
    team: string;
    hackathon: string;
    techStack: string[];
  };
  amount: number;
  equity: number;
  investedAt: string;
  status: 'active' | 'exited' | 'pending';
  currentValue: number;
  returns: number;
  milestones: {
    completed: number;
    total: number;
  };
}

interface Opportunity {
  id: string;
  name: string;
  team: string;
  description: string;
  seeking: number;
  equity: number;
  techStack: string[];
  hackathonRank: number;
  totalTeams: number;
  matchScore: number;
}

export default function InvestmentsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'opportunities'>('portfolio');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTech, setFilterTech] = useState('all');

  // Demo data
  useEffect(() => {
    setTimeout(() => {
      setInvestments([
        {
          id: '1',
          project: {
            id: 'p1',
            name: 'EcoTrack',
            description: 'AI-powered carbon footprint monitoring app',
            team: 'Code Ninjas',
            hackathon: 'GreenTech Innovation 2024',
            techStack: ['React Native', 'Python', 'TensorFlow']
          },
          amount: 10000,
          equity: 5,
          investedAt: '2024-01-20T00:00:00Z',
          status: 'active',
          currentValue: 15000,
          returns: 50,
          milestones: { completed: 3, total: 5 }
        },
        {
          id: '2',
          project: {
            id: 'p2',
            name: 'ChainVote',
            description: 'Decentralized voting system for organizations',
            team: 'Blockchain Builders',
            hackathon: 'Web3 Summit',
            techStack: ['Solidity', 'Next.js', 'IPFS']
          },
          amount: 25000,
          equity: 8,
          investedAt: '2023-11-15T00:00:00Z',
          status: 'active',
          currentValue: 32500,
          returns: 30,
          milestones: { completed: 4, total: 6 }
        },
        {
          id: '3',
          project: {
            id: 'p3',
            name: 'MediScan',
            description: 'AI diagnosis assistant for skin conditions',
            team: 'HealthTech Heroes',
            hackathon: 'HealthTech Revolution',
            techStack: ['Flutter', 'PyTorch', 'AWS']
          },
          amount: 15000,
          equity: 6,
          investedAt: '2023-09-10T00:00:00Z',
          status: 'exited',
          currentValue: 45000,
          returns: 200,
          milestones: { completed: 6, total: 6 }
        }
      ]);
      
      setOpportunities([
        {
          id: '1',
          name: 'SmartFarm AI',
          team: 'AgriTech Innovators',
          description: 'Machine learning platform for precision agriculture and crop yield optimization',
          seeking: 50000,
          equity: 10,
          techStack: ['Python', 'TensorFlow', 'IoT', 'React'],
          hackathonRank: 1,
          totalTeams: 45,
          matchScore: 95
        },
        {
          id: '2',
          name: 'EduVerse VR',
          team: 'Learning Labs',
          description: 'Virtual reality educational platform for immersive STEM learning',
          seeking: 30000,
          equity: 8,
          techStack: ['Unity', 'C#', 'WebXR', 'Node.js'],
          hackathonRank: 2,
          totalTeams: 38,
          matchScore: 88
        },
        {
          id: '3',
          name: 'FinFlow',
          team: 'Money Matters',
          description: 'AI-powered personal finance management with automated investment suggestions',
          seeking: 75000,
          equity: 12,
          techStack: ['Next.js', 'Python', 'PostgreSQL', 'ML'],
          hackathonRank: 1,
          totalTeams: 52,
          matchScore: 82
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = ((totalValue - totalInvested) / totalInvested) * 100;
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;

  if (session?.user?.role !== 'contributor') {
    return (
      <div className="text-center py-20">
        <Briefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-dark-400">Only contributors can access investments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-500" />
            Investment Dashboard
          </h1>
          <p className="text-dark-400 mt-1">Track your investments and discover opportunities</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Wallet className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
              <div className="text-sm text-dark-400">Total Invested</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <div className="text-sm text-dark-400">Current Value</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${totalReturns >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {totalReturns >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold ${totalReturns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalReturns >= 0 ? '+' : ''}{totalReturns.toFixed(1)}%
              </div>
              <div className="text-sm text-dark-400">Total Returns</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeInvestments}</div>
              <div className="text-sm text-dark-400">Active Investments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-800">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'portfolio'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          My Portfolio
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'opportunities'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          Investment Opportunities
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-dark-400 mt-4">Loading...</p>
        </div>
      ) : activeTab === 'portfolio' ? (
        /* Portfolio Tab */
        <div className="space-y-4">
          {investments.length === 0 ? (
            <div className="text-center py-12 card">
              <Briefcase className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Investments Yet</h3>
              <p className="text-dark-400 mb-4">Start building your portfolio by investing in promising projects.</p>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="btn-primary"
              >
                Explore Opportunities
              </button>
            </div>
          ) : (
            investments.map((investment) => (
              <div key={investment.id} className="card">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{investment.project.name}</h3>
                        <p className="text-dark-400">by {investment.project.team}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        investment.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : investment.status === 'exited'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-dark-300 mb-4">{investment.project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {investment.project.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Milestone Progress */}
                    <div className="p-3 bg-dark-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-400">Milestone Progress</span>
                        <span className="text-sm font-medium">{investment.milestones.completed}/{investment.milestones.total}</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${(investment.milestones.completed / investment.milestones.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-4">
                    <div className="p-4 bg-dark-800 rounded-lg space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Investment</span>
                        <span className="font-medium">${investment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Equity</span>
                        <span className="font-medium">{investment.equity}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Current Value</span>
                        <span className="font-medium text-green-400">${investment.currentValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-3 border-t border-dark-700">
                        <span className="text-dark-400">Returns</span>
                        <span className={`font-bold ${investment.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {investment.returns >= 0 ? '+' : ''}{investment.returns}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dashboard/projects/${investment.project.id}`}
                        className="btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Project
                      </Link>
                      <button className="btn-secondary text-sm flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Contact Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Opportunities Tab */
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </div>
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="input"
              >
                <option value="all">All Technologies</option>
                <option value="ai">AI/ML</option>
                <option value="web3">Blockchain/Web3</option>
                <option value="mobile">Mobile Apps</option>
                <option value="saas">SaaS</option>
              </select>
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="card hover:border-primary-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{opportunity.name}</h3>
                    <p className="text-dark-400">{opportunity.team}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                    <Star className="w-4 h-4 text-green-400 fill-green-400" />
                    <span className="text-sm font-medium text-green-400">{opportunity.matchScore}% match</span>
                  </div>
                </div>

                <p className="text-dark-300 mb-4">{opportunity.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-dark-400">
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    Rank #{opportunity.hackathonRank} of {opportunity.totalTeams}
                  </span>
                </div>

                <div className="p-4 bg-dark-800 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-dark-400">Seeking Investment</div>
                      <div className="text-2xl font-bold text-primary-400">${opportunity.seeking.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-dark-400">For Equity</div>
                      <div className="text-2xl font-bold">{opportunity.equity}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" /> Invest Now
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
