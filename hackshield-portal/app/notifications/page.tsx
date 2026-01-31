'use client';

import { useState, useEffect } from 'react';
import { 
  Bell,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  Trophy,
  Users,
  Heart,
  Star,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  Filter,
  Search,
  Archive,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Lightbulb,
  Zap,
  Target,
  Award,
  Briefcase,
  MessageCircle,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';

interface Notification {
  _id: string;
  type: 'hackathon' | 'team' | 'project' | 'system' | 'social' | 'financial';
  category: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
  read: boolean;
  archived: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata: {
    sender?: {
      name: string;
      avatar?: string;
    };
    hackathon?: {
      id: string;
      name: string;
    };
    team?: {
      id: string;
      name: string;
    };
    project?: {
      id: string;
      name: string;
    };
  };
  scheduledFor?: string;
  deliveredAt: {
    email?: string;
    sms?: string;
    push?: string;
    in_app: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferences {
  _id: string;
  userId: string;
  channels: {
    email: {
      enabled: boolean;
      address: string;
      verified: boolean;
    };
    sms: {
      enabled: boolean;
      phone: string;
      verified: boolean;
    };
    push: {
      enabled: boolean;
      subscription: any;
    };
    in_app: {
      enabled: boolean;
    };
  };
  categories: {
    hackathon_updates: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    team_invitations: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    project_feedback: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    marketplace_activity: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    social_interactions: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    system_announcements: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
    security_alerts: {
      enabled: boolean;
      channels: string[];
      priority: string;
    };
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
    };
    immediate: {
      enabled: boolean;
      priorities: string[];
    };
  };
}

const NOTIFICATION_ICONS = {
  hackathon: Calendar,
  team: Users,
  project: Lightbulb,
  system: Settings,
  social: Heart,
  financial: DollarSign
};

const PRIORITY_COLORS = {
  low: 'text-blue-400 bg-blue-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  high: 'text-orange-400 bg-orange-500/20',
  critical: 'text-red-400 bg-red-500/20'
};

const CATEGORY_CONFIG = {
  hackathon_updates: {
    label: 'Hackathon Updates',
    description: 'Registration opens, deadlines, results, and event changes',
    icon: Calendar,
    defaultChannels: ['email', 'in_app'],
    defaultPriority: 'medium'
  },
  team_invitations: {
    label: 'Team Invitations',
    description: 'Team formation, invites, and collaboration requests',
    icon: Users,
    defaultChannels: ['email', 'sms', 'push', 'in_app'],
    defaultPriority: 'high'
  },
  project_feedback: {
    label: 'Project Feedback',
    description: 'Comments, reviews, and project interactions',
    icon: MessageCircle,
    defaultChannels: ['email', 'in_app'],
    defaultPriority: 'medium'
  },
  marketplace_activity: {
    label: 'Marketplace Activity',
    description: 'Investor interest, collaboration opportunities',
    icon: Briefcase,
    defaultChannels: ['email', 'push', 'in_app'],
    defaultPriority: 'high'
  },
  social_interactions: {
    label: 'Social Interactions',
    description: 'Likes, follows, mentions, and social activity',
    icon: Heart,
    defaultChannels: ['in_app'],
    defaultPriority: 'low'
  },
  system_announcements: {
    label: 'System Announcements',
    description: 'Platform updates, new features, and maintenance',
    icon: Zap,
    defaultChannels: ['email', 'in_app'],
    defaultPriority: 'medium'
  },
  security_alerts: {
    label: 'Security Alerts',
    description: 'Account security, login attempts, and privacy',
    icon: AlertCircle,
    defaultChannels: ['email', 'sms', 'push'],
    defaultPriority: 'critical'
  }
};

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Notification filters
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();
      if (response.ok) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      });
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const archiveNotifications = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/archive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, archived: true }
            : notif
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error archiving notifications:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      
      setNotifications(prev =>
        prev.filter(notif => !notificationIds.includes(notif._id))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const updatePreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPreferences)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const testNotification = async (channel: string) => {
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (!showArchived && notif.archived) return false;
    if (filter !== 'all' && notif.type !== filter) return false;
    if (searchTerm && !notif.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const IconComponent = NOTIFICATION_ICONS[notification.type];
    
    return (
      <div 
        className={`glass border rounded-lg p-4 transition-all duration-200 hover:border-primary-500/50 ${
          !notification.read 
            ? 'border-primary-500/30 bg-primary-500/5' 
            : 'border-dark-700'
        } ${
          selectedNotifications.includes(notification._id)
            ? 'ring-2 ring-primary-500'
            : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedNotifications(prev => [...prev, notification._id]);
              } else {
                setSelectedNotifications(prev => prev.filter(id => id !== notification._id));
              }
            }}
            className="mt-1 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
          />

          {/* Icon */}
          <div className={`p-2 rounded-full ${PRIORITY_COLORS[notification.priority]}`}>
            <IconComponent className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-medium ${notification.read ? 'text-dark-200' : 'text-white'}`}>
                {notification.title}
              </h3>
              <div className="flex items-center gap-2">
                {notification.priority === 'critical' && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Critical
                  </span>
                )}
                <span className="text-dark-400 text-xs">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${notification.read ? 'text-dark-300' : 'text-dark-200'}`}>
              {notification.message}
            </p>

            {/* Metadata */}
            {notification.metadata.sender && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs">
                  {notification.metadata.sender.avatar ? (
                    <img src={notification.metadata.sender.avatar} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    notification.metadata.sender.name.charAt(0)
                  )}
                </div>
                <span className="text-dark-300 text-sm">{notification.metadata.sender.name}</span>
              </div>
            )}

            {/* Delivery Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notification.channels.map(channel => (
                  <div key={channel} className="flex items-center gap-1">
                    {channel === 'email' && <Mail className="w-3 h-3 text-blue-400" />}
                    {channel === 'sms' && <MessageSquare className="w-3 h-3 text-green-400" />}
                    {channel === 'push' && <Bell className="w-3 h-3 text-purple-400" />}
                    {channel === 'in_app' && <Smartphone className="w-3 h-3 text-orange-400" />}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="text-primary-400 hover:text-primary-300 text-xs"
                  >
                    Mark as read
                  </button>
                )}
                
                {notification.actionRequired && notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
                  >
                    {notification.actionText || 'Take Action'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PreferencesPanel = () => {
    if (!preferences) return null;

    return (
      <div className="space-y-6">
        {/* Delivery Channels */}
        <div className="glass border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Delivery Channels</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Email</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.channels.email.enabled}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      email: { ...preferences.channels.email, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              <input
                type="email"
                value={preferences.channels.email.address}
                onChange={(e) => updatePreferences({
                  channels: {
                    ...preferences.channels,
                    email: { ...preferences.channels.email, address: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                placeholder="Email address"
              />
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${preferences.channels.email.verified ? 'text-green-400' : 'text-dark-500'}`} />
                <span className={`text-sm ${preferences.channels.email.verified ? 'text-green-400' : 'text-dark-400'}`}>
                  {preferences.channels.email.verified ? 'Verified' : 'Not verified'}
                </span>
                {!preferences.channels.email.verified && (
                  <button className="text-primary-400 hover:text-primary-300 text-sm">
                    Verify
                  </button>
                )}
              </div>
              <button
                onClick={() => testNotification('email')}
                className="text-sm text-secondary-400 hover:text-secondary-300"
              >
                Send test email
              </button>
            </div>

            {/* SMS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">SMS</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.channels.sms.enabled}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      sms: { ...preferences.channels.sms, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              <input
                type="tel"
                value={preferences.channels.sms.phone}
                onChange={(e) => updatePreferences({
                  channels: {
                    ...preferences.channels,
                    sms: { ...preferences.channels.sms, phone: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                placeholder="Phone number"
              />
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${preferences.channels.sms.verified ? 'text-green-400' : 'text-dark-500'}`} />
                <span className={`text-sm ${preferences.channels.sms.verified ? 'text-green-400' : 'text-dark-400'}`}>
                  {preferences.channels.sms.verified ? 'Verified' : 'Not verified'}
                </span>
                {!preferences.channels.sms.verified && (
                  <button className="text-primary-400 hover:text-primary-300 text-sm">
                    Verify
                  </button>
                )}
              </div>
              <button
                onClick={() => testNotification('sms')}
                className="text-sm text-secondary-400 hover:text-secondary-300"
              >
                Send test SMS
              </button>
            </div>

            {/* Push Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Push Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.channels.push.enabled}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      push: { ...preferences.channels.push, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              <p className="text-sm text-dark-300">
                Browser notifications for instant updates
              </p>
              <button
                onClick={() => testNotification('push')}
                className="text-sm text-secondary-400 hover:text-secondary-300"
              >
                Send test notification
              </button>
            </div>

            {/* In-App */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-white">In-App</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.channels.in_app.enabled}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      in_app: { ...preferences.channels.in_app, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              <p className="text-sm text-dark-300">
                Notifications within the platform
              </p>
            </div>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="glass border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Categories</h3>
          
          <div className="space-y-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              const categoryPref = preferences.categories[key as keyof typeof preferences.categories];
              
              return (
                <div key={key} className="p-4 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-primary-400" />
                      <div>
                        <h4 className="font-medium text-white">{config.label}</h4>
                        <p className="text-sm text-dark-300">{config.description}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={categoryPref.enabled}
                      onChange={(e) => updatePreferences({
                        categories: {
                          ...preferences.categories,
                          [key]: { ...categoryPref, enabled: e.target.checked }
                        }
                      })}
                      className="rounded border-dark-600 bg-dark-800 text-primary-500"
                    />
                  </div>
                  
                  {categoryPref.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Channels */}
                      <div>
                        <label className="block text-sm font-medium text-dark-200 mb-2">
                          Delivery Channels
                        </label>
                        <div className="space-y-1">
                          {['email', 'sms', 'push', 'in_app'].map(channel => (
                            <label key={channel} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={categoryPref.channels.includes(channel)}
                                onChange={(e) => {
                                  const updatedChannels = e.target.checked
                                    ? [...categoryPref.channels, channel]
                                    : categoryPref.channels.filter(c => c !== channel);
                                  
                                  updatePreferences({
                                    categories: {
                                      ...preferences.categories,
                                      [key]: { ...categoryPref, channels: updatedChannels }
                                    }
                                  });
                                }}
                                className="rounded border-dark-600 bg-dark-800 text-primary-500"
                              />
                              <span className="text-sm text-dark-300 capitalize">{channel.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-dark-200 mb-2">
                          Priority
                        </label>
                        <select
                          value={categoryPref.priority}
                          onChange={(e) => updatePreferences({
                            categories: {
                              ...preferences.categories,
                              [key]: { ...categoryPref, priority: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="glass border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Schedule & Timing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiet Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Quiet Hours</span>
                <input
                  type="checkbox"
                  checked={preferences.schedule.quietHours.enabled}
                  onChange={(e) => updatePreferences({
                    schedule: {
                      ...preferences.schedule,
                      quietHours: { ...preferences.schedule.quietHours, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              
              {preferences.schedule.quietHours.enabled && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={preferences.schedule.quietHours.start}
                      onChange={(e) => updatePreferences({
                        schedule: {
                          ...preferences.schedule,
                          quietHours: { ...preferences.schedule.quietHours, start: e.target.value }
                        }
                      })}
                      className="px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                    />
                    <span className="text-dark-300 self-center">to</span>
                    <input
                      type="time"
                      value={preferences.schedule.quietHours.end}
                      onChange={(e) => updatePreferences({
                        schedule: {
                          ...preferences.schedule,
                          quietHours: { ...preferences.schedule.quietHours, end: e.target.value }
                        }
                      })}
                      className="px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Digest */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Email Digest</span>
                <input
                  type="checkbox"
                  checked={preferences.schedule.digest.enabled}
                  onChange={(e) => updatePreferences({
                    schedule: {
                      ...preferences.schedule,
                      digest: { ...preferences.schedule.digest, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-dark-600 bg-dark-800 text-primary-500"
                />
              </div>
              
              {preferences.schedule.digest.enabled && (
                <div className="space-y-2">
                  <select
                    value={preferences.schedule.digest.frequency}
                    onChange={(e) => updatePreferences({
                      schedule: {
                        ...preferences.schedule,
                        digest: { ...preferences.schedule.digest, frequency: e.target.value as any }
                      }
                    })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input
                    type="time"
                    value={preferences.schedule.digest.time}
                    onChange={(e) => updatePreferences({
                      schedule: {
                        ...preferences.schedule,
                        digest: { ...preferences.schedule.digest, time: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-dark-200">
              Manage your communication preferences and stay updated
            </p>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                {unreadCount} unread
              </span>
              <button
                onClick={markAllAsRead}
                className="btn-secondary text-sm"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 glass rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'preferences'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-dark-200 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Preferences
            </button>
          </div>
        </div>

        {activeTab === 'notifications' ? (
          <div>
            {/* Filters & Actions */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="hackathon">Hackathons</option>
                  <option value="team">Teams</option>
                  <option value="project">Projects</option>
                  <option value="social">Social</option>
                  <option value="system">System</option>
                </select>

                {/* Archive Toggle */}
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    showArchived 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-dark-800 text-dark-200 border-dark-700 hover:border-primary-500'
                  }`}
                >
                  {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-dark-800 rounded-lg">
                  <span className="text-dark-200">
                    {selectedNotifications.length} selected
                  </span>
                  <button
                    onClick={() => archiveNotifications(selectedNotifications)}
                    className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => deleteNotifications(selectedNotifications)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="text-dark-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No notifications found</h3>
                <p className="text-dark-300">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <PreferencesPanel />
        )}
      </div>
    </div>
  );
}