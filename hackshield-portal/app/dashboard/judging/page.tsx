'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  Gavel, 
  Trophy, 
  Users, 
  Star, 
  Eye, 
  CheckCircle, 
  Clock, 
  ChevronDown,
  Filter,
  Search,
  Code2,
  Lightbulb,
  Presentation,
  TrendingUp,
  Award,
  MessageSquare,
  Save
} from 'lucide-react';

interface Submission {
  id: string;
  teamName: string;
  projectName: string;
  description: string;
  hackathon: {
    id: string;
    title: string;
  };
  members: string[];
  techStack: string[];
  demoUrl?: string;
  repoUrl?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'winner';
  scores?: {
    innovation: number;
    technical: number;
    design: number;
    presentation: number;
    impact: number;
    total: number;
  };
  feedback?: string;
  aiIntegrityScore: number;
}

export default function JudgingPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState({
    innovation: 0,
    technical: 0,
    design: 0,
    presentation: 0,
    impact: 0
  });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  // Demo data
  useEffect(() => {
    setTimeout(() => {
      setSubmissions([
        {
          id: '1',
          teamName: 'Code Ninjas',
          projectName: 'EcoTrack - Carbon Footprint Monitor',
          description: 'An AI-powered app that tracks personal carbon footprint using daily activities and provides personalized suggestions to reduce environmental impact.',
          hackathon: { id: 'h1', title: 'GreenTech Innovation 2024' },
          members: ['John Doe', 'Jane Smith', 'Bob Wilson'],
          techStack: ['React Native', 'Python', 'TensorFlow', 'Firebase'],
          demoUrl: 'https://ecotrack.demo.com',
          repoUrl: 'https://github.com/team/ecotrack',
          submittedAt: '2024-01-15T10:30:00Z',
          status: 'pending',
          aiIntegrityScore: 95
        },
        {
          id: '2',
          teamName: 'HealthTech Heroes',
          projectName: 'MediScan - AI Diagnosis Assistant',
          description: 'A mobile application that uses machine learning to help preliminary diagnosis of skin conditions through image analysis.',
          hackathon: { id: 'h1', title: 'GreenTech Innovation 2024' },
          members: ['Alice Brown', 'Charlie Davis'],
          techStack: ['Flutter', 'Python', 'PyTorch', 'AWS'],
          demoUrl: 'https://mediscan.demo.com',
          submittedAt: '2024-01-15T09:15:00Z',
          status: 'reviewed',
          scores: {
            innovation: 9,
            technical: 8,
            design: 9,
            presentation: 7,
            impact: 9,
            total: 42
          },
          feedback: 'Excellent concept with strong technical implementation. Consider improving the presentation slides.',
          aiIntegrityScore: 88
        },
        {
          id: '3',
          teamName: 'Blockchain Builders',
          projectName: 'ChainVote - Decentralized Voting',
          description: 'A blockchain-based voting system ensuring transparency and immutability for organizational decisions.',
          hackathon: { id: 'h2', title: 'Web3 Summit Hackathon' },
          members: ['Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Chen'],
          techStack: ['Solidity', 'Next.js', 'Hardhat', 'IPFS'],
          repoUrl: 'https://github.com/team/chainvote',
          submittedAt: '2024-01-14T16:45:00Z',
          status: 'shortlisted',
          scores: {
            innovation: 10,
            technical: 9,
            design: 8,
            presentation: 9,
            impact: 10,
            total: 46
          },
          feedback: 'Outstanding innovation! This project addresses a real-world problem with elegant blockchain solution.',
          aiIntegrityScore: 92
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesHackathon = selectedHackathon === 'all' || sub.hackathon.id === selectedHackathon;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = sub.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesHackathon && matchesStatus && matchesSearch;
  });

  const handleScore = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    setSubmissions(prev => prev.map(sub => 
      sub.id === selectedSubmission.id 
        ? { 
            ...sub, 
            status: 'reviewed' as const, 
            scores: { ...scores, total },
            feedback 
          }
        : sub
    ));
    
    setSaving(false);
    setSelectedSubmission(null);
    setScores({ innovation: 0, technical: 0, design: 0, presentation: 0, impact: 0 });
    setFeedback('');
  };

  const getStatusBadge = (status: Submission['status']) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shortlisted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      winner: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return badges[status];
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    shortlisted: submissions.filter(s => s.status === 'shortlisted').length
  };

  if (session?.user?.role !== 'organization') {
    return (
      <div className="text-center py-20">
        <Gavel className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-dark-400">Only organizations can access the judging panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gavel className="w-8 h-8 text-primary-500" />
            Judging Panel
          </h1>
          <p className="text-dark-400 mt-1">Review and score hackathon submissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Trophy className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-dark-400">Total Submissions</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-dark-400">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.reviewed}</div>
              <div className="text-sm text-dark-400">Reviewed</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.shortlisted}</div>
              <div className="text-sm text-dark-400">Shortlisted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search teams or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="input"
            >
              <option value="all">All Hackathons</option>
              <option value="h1">GreenTech Innovation 2024</option>
              <option value="h2">Web3 Summit Hackathon</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="winner">Winners</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-dark-400 mt-4">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 card">
          <Trophy className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Submissions Found</h3>
          <p className="text-dark-400">No submissions match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="card hover:border-primary-500/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{submission.projectName}</h3>
                      <p className="text-dark-400">by {submission.teamName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusBadge(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-dark-300 mb-4">{submission.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-dark-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {submission.hackathon.title}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {submission.members.length} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {submission.techStack.map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* AI Integrity Score */}
                  <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                    <div className={`p-2 rounded-lg ${submission.aiIntegrityScore >= 90 ? 'bg-green-500/20' : submission.aiIntegrityScore >= 70 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                      <Code2 className={`w-5 h-5 ${submission.aiIntegrityScore >= 90 ? 'text-green-400' : submission.aiIntegrityScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">AI Integrity Score</div>
                      <div className={`text-lg font-bold ${submission.aiIntegrityScore >= 90 ? 'text-green-400' : submission.aiIntegrityScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {submission.aiIntegrityScore}%
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-dark-400">
                      {submission.aiIntegrityScore >= 90 ? 'High authenticity' : submission.aiIntegrityScore >= 70 ? 'Moderate AI assistance' : 'High AI usage detected'}
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 space-y-3">
                  {submission.scores ? (
                    <div className="p-4 bg-dark-800 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Scores
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-400">Innovation</span>
                          <span>{submission.scores.innovation}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Technical</span>
                          <span>{submission.scores.technical}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Design</span>
                          <span>{submission.scores.design}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Presentation</span>
                          <span>{submission.scores.presentation}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Impact</span>
                          <span>{submission.scores.impact}/10</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-dark-700 font-bold">
                          <span>Total</span>
                          <span className="text-primary-400">{submission.scores.total}/50</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    {submission.demoUrl && (
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Demo
                      </a>
                    )}
                    {submission.repoUrl && (
                      <a
                        href={submission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Code2 className="w-4 h-4" /> View Code
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        if (submission.scores) {
                          setScores({
                            innovation: submission.scores.innovation,
                            technical: submission.scores.technical,
                            design: submission.scores.design,
                            presentation: submission.scores.presentation,
                            impact: submission.scores.impact
                          });
                        }
                        if (submission.feedback) setFeedback(submission.feedback);
                      }}
                      className="btn-primary text-sm flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4" /> 
                      {submission.scores ? 'Edit Review' : 'Review'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800">
              <h2 className="text-2xl font-bold">Review Submission</h2>
              <p className="text-dark-400">{selectedSubmission.projectName} by {selectedSubmission.teamName}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Scoring Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Scoring (1-10)
                </h3>
                
                {[
                  { key: 'innovation', label: 'Innovation & Creativity', icon: Lightbulb },
                  { key: 'technical', label: 'Technical Implementation', icon: Code2 },
                  { key: 'design', label: 'Design & UX', icon: Eye },
                  { key: 'presentation', label: 'Presentation & Demo', icon: Presentation },
                  { key: 'impact', label: 'Potential Impact', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-48">
                      <Icon className="w-4 h-4 text-dark-400" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleScore(key as keyof typeof scores, value)}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                            scores[key as keyof typeof scores] >= value
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="w-12 text-right font-bold text-primary-400">
                      {scores[key as keyof typeof scores]}/10
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                  <span className="font-semibold">Total Score</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {Object.values(scores).reduce((a, b) => a + b, 0)}/50
                  </span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                  Feedback for Team
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the team..."
                  rows={4}
                  className="input w-full"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSubmissions(prev => prev.map(sub =>
                      sub.id === selectedSubmission.id
                        ? { ...sub, status: 'shortlisted' }
                        : sub
                    ));
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Add to Shortlist
                </button>
                <button
                  onClick={() => {
                    setSubmissions(prev => prev.map(sub =>
                      sub.id === selectedSubmission.id
                        ? { ...sub, status: 'winner' }
                        : sub
                    ));
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Mark as Winner
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setScores({ innovation: 0, technical: 0, design: 0, presentation: 0, impact: 0 });
                  setFeedback('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
