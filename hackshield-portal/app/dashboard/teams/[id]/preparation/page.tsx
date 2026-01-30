'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Clock,
  Calendar,
  FileText,
  MessageSquare,
  Video,
  Play,
  Settings,
  Bell,
  CheckCircle,
  Circle,
  Loader2,
  ExternalLink,
  Edit3,
  Save,
  Send,
  Sparkles,
  Trophy,
  BookOpen,
  Lightbulb,
  Target,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  hackathonId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    duration: number;
    rules?: string[];
    judgingCriteria?: { name: string; weight: number }[];
    allowedTechnologies?: string[];
  };
  members: {
    userId: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    role: string;
    isLeader: boolean;
  }[];
  projectIdea?: string;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'reminder' | 'info' | 'warning';
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
}

export default function TeamPreparationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'resources' | 'chat'>('overview');
  const [projectIdea, setProjectIdea] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Research project ideas', assignee: 'All', completed: true },
    { id: '2', title: 'Set up development environment', assignee: 'Developer', completed: false },
    { id: '3', title: 'Create wireframes', assignee: 'Designer', completed: false },
    { id: '4', title: 'Prepare presentation template', assignee: 'PM', completed: false },
  ]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; time: string }[]>([
    { sender: 'System', message: 'Team chat created. Good luck!', time: '2 days ago' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hackathonStarted, setHackathonStarted] = useState(false);

  const notifications: Notification[] = [
    { id: '1', message: 'Hackathon starts in 2 days! Make sure your team is ready.', time: '1 hour ago', type: 'reminder' },
    { id: '2', message: 'New tutorial added: "How to build a winning demo"', time: '3 hours ago', type: 'info' },
    { id: '3', message: 'Final reminder: Complete your team profile before the hackathon.', time: '1 day ago', type: 'warning' },
  ];

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  useEffect(() => {
    if (team?.hackathonId?.startDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(team.hackathonId.startDate).getTime();
        const diff = start - now;

        if (diff <= 0) {
          setHackathonStarted(true);
          clearInterval(timer);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setProjectIdea(data.team?.projectIdea || '');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIdea }),
      });

      if (res.ok) {
        toast.success('Project idea saved!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: session?.user?.name || 'You', message: chatInput, time: 'Just now' }
    ]);
    setChatInput('');
  };

  const getCountdownColor = () => {
    if (timeRemaining.days > 7) return 'text-green-400';
    if (timeRemaining.days > 1) return 'text-yellow-400';
    if (timeRemaining.days > 0) return 'text-orange-400';
    return 'text-red-400 animate-pulse';
  };

  const enterIDE = () => {
    router.push(`/dashboard/ide?team=${teamId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Team not found</h2>
        <Link href="/dashboard/teams" className="text-primary-400">
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/teams/${teamId}`}
          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{team.name} - Preparation</h1>
          <p className="text-dark-400">{team.hackathonId?.title}</p>
        </div>
      </div>

      {/* Massive Countdown Timer */}
      <div className={`card bg-gradient-to-br from-dark-800 to-dark-900 border-2 ${
        hackathonStarted ? 'border-green-500' : getCountdownColor().includes('green') ? 'border-green-500/30' :
        getCountdownColor().includes('yellow') ? 'border-yellow-500/30' :
        getCountdownColor().includes('orange') ? 'border-orange-500/30' : 'border-red-500/50'
      }`}>
        <div className="text-center py-8">
          {hackathonStarted ? (
            <>
              <div className="text-3xl font-bold text-green-400 mb-4 animate-pulse">
                🚀 HACKATHON IS LIVE!
              </div>
              <button
                onClick={enterIDE}
                className="btn-primary text-xl px-12 py-4 animate-bounce"
              >
                <Play className="w-6 h-6 mr-2" />
                ENTER IDE NOW
              </button>
            </>
          ) : (
            <>
              <div className="text-dark-400 mb-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Hackathon starts in
              </div>
              <div className={`flex items-center justify-center gap-4 ${getCountdownColor()}`}>
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono">{timeRemaining.days}</div>
                  <div className="text-sm text-dark-400">Days</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                  <div className="text-sm text-dark-400">Hours</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-sm text-dark-400">Minutes</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-sm text-dark-400">Seconds</div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  disabled
                  className="btn-secondary opacity-50 cursor-not-allowed"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Enter IDE (Available at Start Time)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-dark-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'planning', label: 'Planning', icon: Target },
          { id: 'resources', label: 'Resources', icon: BookOpen },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Team Members ({team.members.length})
            </h3>
            <div className="space-y-3">
              {team.members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-dark-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold">
                    {member.userId?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {member.userId?.name}
                      {member.isLeader && (
                        <span className="badge-primary text-xs">Leader</span>
                      )}
                    </div>
                    <div className="text-sm text-dark-400">{member.role}</div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-400" title="Online" />
                </div>
              ))}
            </div>
          </div>

          {/* Hackathon Details */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Hackathon Info
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-dark-400">Duration</div>
                <div className="font-medium">{team.hackathonId?.duration || 48} hours</div>
              </div>
              <div>
                <div className="text-sm text-dark-400">Start Date</div>
                <div className="font-medium">
                  {team.hackathonId?.startDate && new Date(team.hackathonId.startDate).toLocaleString()}
                </div>
              </div>
              {team.hackathonId?.judgingCriteria && (
                <div>
                  <div className="text-sm text-dark-400 mb-2">Judging Criteria</div>
                  {team.hackathonId.judgingCriteria.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <span>{c.name}</span>
                      <span className="text-primary-400">{c.weight}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-lg ${
                  n.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                  n.type === 'reminder' ? 'bg-blue-500/10 border border-blue-500/30' :
                  'bg-dark-800'
                }`}>
                  <div className="text-sm">{n.message}</div>
                  <div className="text-xs text-dark-400 mt-1">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Project Idea */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Project Idea
              </h3>
              {isEditing ? (
                <button onClick={handleSaveIdea} className="btn-primary text-sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                className="input-field min-h-[200px]"
                placeholder="Describe your project idea, features, tech stack..."
              />
            ) : (
              <div className="bg-dark-800 rounded-lg p-4 min-h-[200px] text-dark-300">
                {projectIdea || 'No project idea yet. Click Edit to add one!'}
              </div>
            )}
          </div>

          {/* Tasks Checklist */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Preparation Tasks
            </h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    task.completed ? 'bg-green-500/10' : 'bg-dark-800 hover:bg-dark-700'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-dark-500" />
                  )}
                  <div className="flex-1">
                    <div className={task.completed ? 'line-through text-dark-400' : ''}>
                      {task.title}
                    </div>
                    <div className="text-xs text-dark-400">{task.assignee}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'React Documentation', url: 'https://react.dev', icon: BookOpen },
            { title: 'Next.js Guide', url: 'https://nextjs.org/docs', icon: BookOpen },
            { title: 'Tailwind CSS', url: 'https://tailwindcss.com/docs', icon: BookOpen },
            { title: 'Node.js Docs', url: 'https://nodejs.org/docs', icon: BookOpen },
            { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs', icon: BookOpen },
            { title: 'Git Cheatsheet', url: 'https://education.github.com/git-cheat-sheet-education.pdf', icon: FileText },
          ].map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover flex items-center gap-4"
            >
              <div className="p-3 rounded-lg bg-primary-500/20">
                <resource.icon className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{resource.title}</div>
                <div className="text-sm text-dark-400">External Resource</div>
              </div>
              <ExternalLink className="w-5 h-5 text-dark-400" />
            </a>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="card max-h-[60vh] flex flex-col">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Team Chat
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                msg.sender === 'System' ? 'bg-dark-800 text-dark-400 italic' :
                msg.sender === session?.user?.name ? 'bg-primary-500/20 ml-8' : 'bg-dark-800 mr-8'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{msg.sender}</span>
                  <span className="text-xs text-dark-400">{msg.time}</span>
                </div>
                <div className="text-sm">{msg.message}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Type a message..."
              className="input-field flex-1"
            />
            <button onClick={handleSendChat} className="btn-primary">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
