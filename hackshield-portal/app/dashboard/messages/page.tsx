'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Image,
  File,
  Smile,
  Check,
  CheckCheck,
  Circle,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'current-user';

  useEffect(() => {
    // Demo data
    setTimeout(() => {
      const demoConversations: Conversation[] = [
        {
          id: '1',
          participant: {
            id: 'u1',
            name: 'Code Ninjas Team',
            role: 'Project Team',
            online: true
          },
          lastMessage: 'Thank you for your investment! We have some updates to share.',
          lastMessageTime: '10:30 AM',
          unreadCount: 2,
          messages: [
            { id: 'm1', senderId: 'u1', content: 'Hi! We noticed your interest in EcoTrack.', timestamp: '10:00 AM', read: true, type: 'text' },
            { id: 'm2', senderId: currentUserId, content: 'Yes, I love the concept! Tell me more about your roadmap.', timestamp: '10:15 AM', read: true, type: 'text' },
            { id: 'm3', senderId: 'u1', content: 'We\'re planning to launch the beta in 2 months. Here\'s our detailed roadmap:', timestamp: '10:20 AM', read: true, type: 'text' },
            { id: 'm4', senderId: 'u1', content: 'roadmap.pdf', timestamp: '10:21 AM', read: true, type: 'file', fileName: 'EcoTrack_Roadmap.pdf' },
            { id: 'm5', senderId: 'u1', content: 'Thank you for your investment! We have some updates to share.', timestamp: '10:30 AM', read: false, type: 'text' }
          ]
        },
        {
          id: '2',
          participant: {
            id: 'u2',
            name: 'Sarah Chen',
            role: 'Hackathon Organizer',
            online: false
          },
          lastMessage: 'The judging panel will start tomorrow at 2 PM.',
          lastMessageTime: 'Yesterday',
          unreadCount: 0,
          messages: [
            { id: 'm1', senderId: 'u2', content: 'Welcome to GreenTech Innovation 2024!', timestamp: 'Yesterday', read: true, type: 'text' },
            { id: 'm2', senderId: currentUserId, content: 'Thanks! Excited to be a mentor for this hackathon.', timestamp: 'Yesterday', read: true, type: 'text' },
            { id: 'm3', senderId: 'u2', content: 'The judging panel will start tomorrow at 2 PM.', timestamp: 'Yesterday', read: true, type: 'text' }
          ]
        },
        {
          id: '3',
          participant: {
            id: 'u3',
            name: 'Blockchain Builders',
            role: 'Project Team',
            online: true
          },
          lastMessage: 'We\'ve reached milestone 4! Check out the demo.',
          lastMessageTime: 'Monday',
          unreadCount: 0,
          messages: [
            { id: 'm1', senderId: 'u3', content: 'Hi! We wanted to share our progress on ChainVote.', timestamp: 'Monday', read: true, type: 'text' },
            { id: 'm2', senderId: 'u3', content: 'We\'ve reached milestone 4! Check out the demo.', timestamp: 'Monday', read: true, type: 'text' }
          ]
        }
      ];
      setConversations(demoConversations);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'text'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id
        ? { 
            ...conv, 
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage,
            lastMessageTime: 'Just now'
          }
        : conv
    ));

    setSelectedConversation(prev => 
      prev ? { ...prev, messages: [...prev.messages, newMsg] } : null
    );

    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    // Mark messages as read
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 bg-dark-900 border-r border-dark-800 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-dark-800">
          <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-dark-800 transition-colors border-b border-dark-800 ${
                  selectedConversation?.id === conv.id ? 'bg-dark-800' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                    {conv.participant.name[0]}
                  </div>
                  {conv.participant.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{conv.participant.name}</span>
                    <span className="text-xs text-dark-400 whitespace-nowrap ml-2">{conv.lastMessageTime}</span>
                  </div>
                  <div className="text-sm text-dark-400 truncate">{conv.lastMessage}</div>
                  <div className="text-xs text-dark-500">{conv.participant.role}</div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-xs font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-dark-950 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-800 flex items-center gap-4">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 hover:bg-dark-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                  {selectedConversation.participant.name[0]}
                </div>
                {selectedConversation.participant.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-950 rounded-full"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{selectedConversation.participant.name}</div>
                <div className="text-sm text-dark-400">
                  {selectedConversation.participant.online ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.senderId === currentUserId
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-dark-800 text-white rounded-bl-md'
                    }`}
                  >
                    {message.type === 'file' ? (
                      <div className="flex items-center gap-2">
                        <File className="w-5 h-5" />
                        <span className="text-sm underline cursor-pointer">{message.fileName}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      message.senderId === currentUserId ? 'text-white/70' : 'text-dark-400'
                    }`}>
                      <span className="text-xs">{message.timestamp}</span>
                      {message.senderId === currentUserId && (
                        message.read ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-800">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="input w-full pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
            <p className="text-sm">Choose a conversation from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
