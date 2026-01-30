'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Send,
  Loader2,
  Radio,
  Globe,
  UserPlus,
  Check,
  X,
  Clock,
  Sparkles,
  MessageSquare,
  Crown,
  Vote
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  _id: string;
  name: string;
  skills: string[];
  experience: string;
  avatar?: string;
}

interface TeamFormation {
  id: string;
  members: Participant[];
  teamName: string;
  confirmed: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'invite';
}

interface OpenInvite {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  skills: string[];
  experience: string;
  bio: string;
  createdAt: string;
}

export default function TeamFormationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'invites' | 'broadcast'>('chat');
  const [connectedUsers, setConnectedUsers] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'system',
      senderName: 'System',
      message: 'Welcome to Team Formation! Connect with other participants looking for a team.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [openInvites, setOpenInvites] = useState<OpenInvite[]>([]);
  const [myBroadcast, setMyBroadcast] = useState({
    active: false,
    bio: '',
    skills: [] as string[],
    experience: 'intermediate'
  });
  const [teamFormation, setTeamFormation] = useState<TeamFormation | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [showTeamConfirm, setShowTeamConfirm] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  
  const skillOptions = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'TypeScript', 'JavaScript', 'UI/UX', 'Mobile', 'AI/ML', 'Blockchain', 'DevOps', 'Database'];
  
  useEffect(() => {
    fetchOpenInvites();
    // Simulate some connected users for demo
    setTimeout(() => {
      setConnectedUsers([
        { _id: '1', name: 'Alice Chen', skills: ['React', 'TypeScript', 'UI/UX'], experience: 'expert' },
        { _id: '2', name: 'Bob Kumar', skills: ['Python', 'AI/ML', 'Backend'], experience: 'intermediate' },
      ]);
      setLoading(false);
    }, 500);
  }, [hackathonId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchOpenInvites = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/open-invites`);
      if (res.ok) {
        const data = await res.json();
        setOpenInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Error fetching open invites:', error);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: session?.user?.id || 'you',
      senderName: session?.user?.name || 'You',
      message: chatInput,
      timestamp: new Date(),
      type: 'text'
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleBroadcastInvite = async () => {
    if (myBroadcast.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/open-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: myBroadcast.bio,
          skills: myBroadcast.skills,
          experience: myBroadcast.experience
        })
      });

      if (res.ok) {
        setMyBroadcast({ ...myBroadcast, active: true });
        toast.success('Your open invite is now live! Others can see and invite you.');
        
        // Add system message
        setChatMessages([
          ...chatMessages,
          {
            id: Date.now().toString(),
            senderId: 'system',
            senderName: 'System',
            message: `${session?.user?.name} is now looking for a team!`,
            timestamp: new Date(),
            type: 'system'
          }
        ]);
      }
    } catch (error) {
      toast.error('Failed to broadcast invite');
    }
  };

  const handleRespondToInvite = async (inviteId: string, accept: boolean) => {
    if (accept) {
      const invite = openInvites.find(i => i._id === inviteId);
      if (invite) {
        // Add to connected users for chat
        setConnectedUsers([
          ...connectedUsers,
          {
            _id: invite.userId._id,
            name: invite.userId.name,
            skills: invite.skills,
            experience: invite.experience
          }
        ]);
        
        toast.success(`Connected with ${invite.userId.name}! You can now chat.`);
        
        setChatMessages([
          ...chatMessages,
          {
            id: Date.now().toString(),
            senderId: 'system',
            senderName: 'System',
            message: `${invite.userId.name} has joined the conversation!`,
            timestamp: new Date(),
            type: 'system'
          }
        ]);
      }
    }
  };

  const handleInviteToTeam = (userId: string, userName: string) => {
    if (!teamFormation) {
      const user = connectedUsers.find(u => u._id === userId);
      if (user) {
        setTeamFormation({
          id: Date.now().toString(),
          members: [
            { _id: session?.user?.id || 'you', name: session?.user?.name || 'You', skills: [], experience: 'intermediate' },
            user
          ],
          teamName: '',
          confirmed: false
        });
      }
    } else {
      const user = connectedUsers.find(u => u._id === userId);
      if (user && teamFormation.members.length < 4) {
        setTeamFormation({
          ...teamFormation,
          members: [...teamFormation.members, user]
        });
      }
    }
    
    toast.success(`${userName} added to team formation!`);
    
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now().toString(),
        senderId: session?.user?.id || 'you',
        senderName: session?.user?.name || 'You',
        message: `I've invited ${userName} to form a team!`,
        timestamp: new Date(),
        type: 'invite'
      }
    ]);
  };

  const handleLockTeam = async () => {
    if (!teamNameInput.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamNameInput,
          hackathonId,
          memberIds: teamFormation?.members.map(m => m._id) || []
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Team locked and confirmed!');
        router.push(`/dashboard/teams/${data.team._id}/preparation`);
      } else {
        toast.error('Failed to create team');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const toggleSkill = (skill: string) => {
    if (myBroadcast.skills.includes(skill)) {
      setMyBroadcast({
        ...myBroadcast,
        skills: myBroadcast.skills.filter(s => s !== skill)
      });
    } else {
      setMyBroadcast({
        ...myBroadcast,
        skills: [...myBroadcast.skills, skill]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/hackathons/${hackathonId}/find-team`}
          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Team Formation</h1>
          <p className="text-dark-400">Connect, chat, and form your dream team</p>
        </div>
      </div>

      {/* Team Formation Progress */}
      {teamFormation && (
        <div className="card bg-gradient-to-r from-primary-900/30 to-secondary-900/30 border-primary-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Team Formation ({teamFormation.members.length}/4)
            </h3>
            {!showTeamConfirm ? (
              <button
                onClick={() => setShowTeamConfirm(true)}
                className="btn-primary"
                disabled={teamFormation.members.length < 2}
              >
                <Check className="w-4 h-4 mr-2" />
                Lock Team Roster
              </button>
            ) : (
              <button
                onClick={() => setShowTeamConfirm(false)}
                className="btn-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}
          </div>

          {showTeamConfirm ? (
            <div className="space-y-4">
              <div>
                <label className="label">Team Name</label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="Enter your team name..."
                  className="input-field"
                />
              </div>
              <button onClick={handleLockTeam} className="btn-primary w-full">
                <Crown className="w-5 h-5 mr-2" />
                Confirm & Create Team
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {teamFormation.members.map((member) => (
                <div key={member._id} className="flex items-center gap-2 bg-dark-800 rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-bold">
                    {member.name[0]}
                  </div>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-dark-700">
        {[
          { id: 'chat', label: 'Group Chat', icon: MessageSquare },
          { id: 'invites', label: 'Open Invites', icon: Globe },
          { id: 'broadcast', label: 'Broadcast', icon: Radio },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'chat' && (
            <div className="card h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4" ref={chatRef}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.type === 'system'
                        ? 'bg-dark-800 text-dark-400 text-center italic text-sm'
                        : msg.type === 'invite'
                        ? 'bg-primary-500/10 border border-primary-500/30'
                        : msg.senderId === (session?.user?.id || 'you')
                        ? 'bg-primary-500/20 ml-12'
                        : 'bg-dark-800 mr-12'
                    }`}
                  >
                    {msg.type !== 'system' && (
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-primary-400">{msg.senderName}</span>
                        <span className="text-xs text-dark-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button onClick={handleSendMessage} className="btn-primary">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Open Invites from Other Participants
              </h3>
              {openInvites.length === 0 ? (
                <div className="card text-center py-12">
                  <Radio className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No open invites yet</h4>
                  <p className="text-dark-400 text-sm">Be the first to broadcast your invite!</p>
                </div>
              ) : (
                openInvites.map((invite) => (
                  <div key={invite._id} className="card-hover">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-lg font-bold">
                        {invite.userId.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{invite.userId.name}</div>
                        <div className="text-sm text-dark-400 capitalize mb-2">
                          {invite.experience} Developer
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {invite.skills.map((skill) => (
                            <span key={skill} className="badge-primary text-xs">{skill}</span>
                          ))}
                        </div>
                        {invite.bio && (
                          <p className="text-sm text-dark-300 mb-3">{invite.bio}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondToInvite(invite._id, true)}
                            className="btn-primary text-sm"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Connect
                          </button>
                          <button className="btn-secondary text-sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-accent-400" />
                Broadcast Your Open Invite
              </h3>
              <p className="text-dark-400 text-sm mb-6">
                Create a public post so other participants can find and invite you to their team.
              </p>

              {myBroadcast.active ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Your invite is live!</h4>
                  <p className="text-dark-400 text-sm">
                    Other participants can now see your profile and invite you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label">Your Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            myBroadcast.skills.includes(skill)
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Experience Level</label>
                    <select
                      value={myBroadcast.experience}
                      onChange={(e) => setMyBroadcast({ ...myBroadcast, experience: e.target.value })}
                      className="input-field"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Short Bio (200 chars)</label>
                    <textarea
                      value={myBroadcast.bio}
                      onChange={(e) => setMyBroadcast({ ...myBroadcast, bio: e.target.value.slice(0, 200) })}
                      placeholder="Introduce yourself..."
                      className="input-field min-h-[100px]"
                      maxLength={200}
                    />
                    <div className="text-xs text-dark-400 mt-1">{myBroadcast.bio.length}/200</div>
                  </div>

                  <button onClick={handleBroadcastInvite} className="btn-primary w-full">
                    <Radio className="w-5 h-5 mr-2" />
                    Go Live!
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Connected Users */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Connected ({connectedUsers.length})
            </h3>
            <div className="space-y-3">
              {connectedUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-dark-400 truncate">
                      {user.skills.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleInviteToTeam(user._id, user.name)}
                    className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400"
                    title="Invite to team"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {connectedUsers.length === 0 && (
                <p className="text-dark-400 text-sm text-center py-4">
                  No connections yet. Browse open invites to connect!
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border-primary-500/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Team Tips
            </h3>
            <ul className="text-sm text-dark-300 space-y-2">
              <li>• Look for complementary skills</li>
              <li>• Discuss availability before teaming</li>
              <li>• Max team size: 4 members</li>
              <li>• Lock team before hackathon starts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
