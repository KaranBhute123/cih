'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  AlertTriangle,
  Trophy,
  Users,
  MessageSquare,
  Calendar,
  Code,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'hackathon_start' | 'hackathon_end' | 'team_invite' | 'team_join' | 'submission_received' | 'judging_complete' | 'award_won' | 'security_alert' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data for demonstration
      setNotifications([
        {
          _id: '1',
          type: 'hackathon_start',
          title: 'Hackathon Starting Soon!',
          message: 'AI Innovation Challenge starts in 2 hours. Make sure your team is ready!',
          read: false,
          priority: 'high',
          link: '/dashboard/hackathons/1',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          type: 'team_invite',
          title: 'Team Invitation',
          message: 'CodeNinjas has invited you to join their team for Web3 Hackathon.',
          read: false,
          priority: 'medium',
          link: '/dashboard/teams',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '3',
          type: 'award_won',
          title: '🏆 Congratulations!',
          message: 'Your team won 2nd place in the HealthTech Summit hackathon!',
          read: true,
          priority: 'high',
          link: '/dashboard/teams/1',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '4',
          type: 'security_alert',
          title: 'Security Warning',
          message: 'Tab switch detected during active hackathon. 2/3 warnings.',
          read: true,
          priority: 'urgent',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: '5',
          type: 'message',
          title: 'New Message',
          message: 'Your teammate left a comment on the project.',
          read: true,
          priority: 'low',
          link: '/dashboard/teams/1',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          _id: '6',
          type: 'system',
          title: 'System Update',
          message: 'HackShield Portal has been updated with new features!',
          read: true,
          priority: 'low',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => 
      n._id === id ? { ...n, read: true } : n
    ));

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');

    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => n._id !== id));
    toast.success('Notification deleted');

    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hackathon_start':
      case 'hackathon_end':
        return <Calendar className="w-5 h-5" />;
      case 'team_invite':
      case 'team_join':
        return <Users className="w-5 h-5" />;
      case 'award_won':
        return <Trophy className="w-5 h-5" />;
      case 'security_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'submission_received':
      case 'judging_complete':
        return <Code className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10';
      case 'high':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'medium':
        return 'text-blue-400 bg-blue-500/10';
      default:
        return 'text-dark-400 bg-dark-700';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-dark-400 mt-1">Stay updated with your hackathon activities</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Notifications</h2>
          <p className="text-dark-400">
            {filter === 'unread' 
              ? "You're all caught up!"
              : "No notifications yet"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`card p-4 flex items-start gap-4 transition-all hover:border-dark-600 ${
                !notification.read ? 'border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className={`p-2 rounded-lg ${getIconColor(notification.priority)}`}>
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-medium ${!notification.read ? 'text-white' : 'text-dark-300'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-dark-500 whitespace-nowrap">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-dark-400 mt-1">
                  {notification.message}
                </p>
                
                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block"
                  >
                    View details →
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="p-2 hover:bg-dark-700 rounded text-dark-400 hover:text-white"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="p-2 hover:bg-dark-700 rounded text-dark-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
