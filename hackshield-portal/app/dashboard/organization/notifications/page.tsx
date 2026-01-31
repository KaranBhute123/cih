'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Bell, 
  Send,
  Clock,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Hackathon {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  teams?: any[];
}

interface SentNotification {
  _id: string;
  hackathonId: string;
  hackathonTitle: string;
  title: string;
  message: string;
  priority: string;
  channels: string[];
  recipients: string;
  participantCount: number;
  sentAt: string;
}

interface AutoReminder {
  hackathon: string;
  id: string;
  hoursUntilStart?: number;
  hoursUntilEnd?: number;
  willSendReminder: boolean;
}

export default function OrganizationNotificationsPage() {
  const { data: session } = useSession();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('');
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<AutoReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'auto-alerts'>('send');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    channels: ['in_app', 'email'],
    recipients: 'all'
  });

  useEffect(() => {
    fetchHackathons();
    fetchSentNotifications();
    fetchUpcomingReminders();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await fetch('/api/hackathons');
      const data = await res.json();
      if (res.ok && data.hackathons) {
        // Filter hackathons by organization
        const orgHackathons = data.hackathons.filter((h: any) => 
          h.status === 'published' || h.status === 'active'
        );
        setHackathons(orgHackathons);
        if (orgHackathons.length > 0) {
          setSelectedHackathon(orgHackathons[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentNotifications = async () => {
    try {
      // Fetch all notifications sent by this organization
      const res = await fetch('/api/notifications?type=sent');
      const data = await res.json();
      if (res.ok) {
        setSentNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
    }
  };

  const fetchUpcomingReminders = async () => {
    try {
      const res = await fetch('/api/notifications/reminders');
      const data = await res.json();
      if (res.ok && data.upcoming) {
        setUpcomingReminders(data.upcoming);
      }
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedHackathon) {
      toast.error('Please select a hackathon');
      return;
    }

    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.channels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/hackathons/${selectedHackathon}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Notification sent to ${data.participantCount} participants!`);
        // Reset form
        setFormData({
          title: '',
          message: '',
          priority: 'medium',
          channels: ['in_app', 'email'],
          recipients: 'all'
        });
        fetchSentNotifications();
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-primary-400" />
          Notifications Center
        </h1>
        <p className="text-gray-400">
          Send messages and manage auto-alerts for your hackathons
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'send'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Notification
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History ({sentNotifications.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('auto-alerts')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'auto-alerts'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Auto-Alerts ({upcomingReminders.length})
          </div>
        </button>
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {hackathons.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Active Hackathons</h2>
              <p className="text-gray-400 mb-6">
                Create and publish a hackathon to send notifications to participants
              </p>
              <a
                href="/dashboard/hackathons/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Hackathon
              </a>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              {/* Hackathon Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Hackathon *
                </label>
                <select
                  value={selectedHackathon}
                  onChange={(e) => setSelectedHackathon(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {hackathons.map((hackathon) => (
                    <option key={hackathon._id} value={hackathon._id}>
                      {hackathon.title} ({hackathon.teams?.length || 0} teams)
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Important Update"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000</p>
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority Level
                </label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.priority === priority
                          ? getPriorityColor(priority)
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Channels *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'in_app', label: 'In-App', icon: Bell },
                    { id: 'email', label: 'Email', icon: Send },
                    { id: 'push', label: 'Push', icon: AlertTriangle },
                    { id: 'sms', label: 'SMS', icon: Users }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleChannelToggle(id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.channels.includes(id)
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2" />
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipients
                </label>
                <select
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Participants</option>
                  <option value="leaders">Team Leaders Only</option>
                  <option value="members">Team Members Only</option>
                </select>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={sending || !formData.title || !formData.message || formData.channels.length === 0}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {sentNotifications.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Notifications Sent</h2>
              <p className="text-gray-400">
                Your sent notifications will appear here
              </p>
            </div>
          ) : (
            sentNotifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {notification.hackathonTitle}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-4">{notification.message}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {notification.participantCount} recipients
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {notification.channels.join(', ')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(notification.sentAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Auto-Alerts Tab */}
      {activeTab === 'auto-alerts' && (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Automatic Reminder System</h3>
                <p className="text-sm text-gray-300">
                  Participants automatically receive reminders at: <strong>24 hours</strong>, <strong>6 hours</strong>, and <strong>1 hour</strong> before hackathon start/end times.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Auto-Alerts Active</h3>
                  <p className="text-sm text-gray-400">System monitoring {hackathons.length} hackathons</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Reminders are automatically sent via email and in-app notifications. No manual action required.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Upcoming Alerts</h3>
                  <p className="text-sm text-gray-400">{upcomingReminders.length} scheduled</p>
                </div>
              </div>
              <button
                onClick={fetchUpcomingReminders}
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          </div>

          {/* Upcoming Reminders List */}
          {upcomingReminders.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Scheduled Reminders</h3>
              <div className="space-y-3">
                {upcomingReminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{reminder.hackathon}</p>
                      <p className="text-sm text-gray-400">
                        {reminder.hoursUntilStart
                          ? `Starts in ${reminder.hoursUntilStart.toFixed(1)} hours`
                          : `Ends in ${reminder.hoursUntilEnd?.toFixed(1)} hours`
                        }
                      </p>
                    </div>
                    {reminder.willSendReminder && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        Alert Scheduled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Settings Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reminder Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Before Start</p>
                  <p className="text-sm text-gray-400">Reminders sent 24h and 1h before hackathon begins</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/20 rounded">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Before End</p>
                  <p className="text-sm text-gray-400">Reminders sent 24h, 6h, and 1h before deadline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded">
                  <Send className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Delivery Channels</p>
                  <p className="text-sm text-gray-400">In-app notifications, Email, and Push notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
