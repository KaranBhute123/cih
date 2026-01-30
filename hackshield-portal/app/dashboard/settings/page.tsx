'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Phone,
  Github,
  Linkedin,
  Globe,
  Save,
  Camera,
  Bell,
  Shield,
  Loader2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: [] as string[],
    experience: 'intermediate',
    github: '',
    linkedin: '',
    portfolio: '',
    location: '',
    timezone: '',
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    inApp: true,
    push: true,
  });
  
  const skillOptions = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'TypeScript', 'JavaScript', 'UI/UX', 'Mobile', 'AI/ML', 'Blockchain', 'DevOps', 'Database', 'Cloud', 'Security'];
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
          skills: data.user.skills || [],
          experience: data.user.experience || 'intermediate',
          github: data.user.github || '',
          linkedin: data.user.linkedin || '',
          portfolio: data.user.portfolio || '',
          location: data.user.location || '',
          timezone: data.user.timezone || '',
        });
        setNotifications(data.user.notificationPreferences || notifications);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          notificationPreferences: notifications,
        }),
      });
      
      if (res.ok) {
        toast.success('Profile updated successfully!');
        // Update session if name changed
        if (session?.user?.name !== profile.name) {
          await update({ name: profile.name });
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };
  
  const toggleSkill = (skill: string) => {
    if (profile.skills.includes(skill)) {
      setProfile({
        ...profile,
        skills: profile.skills.filter(s => s !== skill)
      });
    } else {
      setProfile({
        ...profile,
        skills: [...profile.skills, skill]
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-dark-400">Manage your account settings and preferences</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'profile' ? 'text-primary-400' : 'text-dark-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Profile
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'notifications' ? 'text-primary-400' : 'text-dark-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Notifications
          {activeTab === 'notifications' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'security' ? 'text-primary-400' : 'text-dark-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Security
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card">
            <h3 className="font-semibold mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold">
                  {profile.name.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="text-dark-400 text-sm">Upload a new profile picture</p>
                <p className="text-dark-500 text-xs mt-1">JPG, PNG or GIF, max 2MB</p>
              </div>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="input-field"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="input-field"
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="input-field h-24"
                placeholder="Tell others about yourself..."
              />
            </div>
          </div>
          
          {/* Skills */}
          <div className="card">
            <h3 className="font-semibold mb-4">Skills & Experience</h3>
            <div>
              <label className="label">Experience Level</label>
              <select
                value={profile.experience}
                onChange={(e) => setProfile({...profile, experience: e.target.value})}
                className="input-field w-auto"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="label">Skills</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      profile.skills.includes(skill)
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {profile.skills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="card">
            <h3 className="font-semibold mb-4">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </label>
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => setProfile({...profile, github: e.target.value})}
                  className="input-field"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                  className="input-field"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={profile.portfolio}
                  onChange={(e) => setProfile({...profile, portfolio: e.target.value})}
                  className="input-field"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h3 className="font-semibold mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-dark-700">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-dark-400">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setNotifications({...notifications, email: !notifications.email})}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.email ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-dark-700">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-dark-400">Receive urgent notifications via SMS</p>
              </div>
              <button
                onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.sms ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-dark-700">
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-dark-400">See notifications within the app</p>
              </div>
              <button
                onClick={() => setNotifications({...notifications, inApp: !notifications.inApp})}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.inApp ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  notifications.inApp ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-dark-400">Receive browser push notifications</p>
              </div>
              <button
                onClick={() => setNotifications({...notifications, push: !notifications.push})}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications.push ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input-field" />
              </div>
              <button className="btn-secondary">Update Password</button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
            <p className="text-dark-400 mb-4">Add an extra layer of security to your account</p>
            <button className="btn-primary">
              <Shield className="w-4 h-4 mr-2" />
              Enable 2FA
            </button>
          </div>
          
          <div className="card border-red-500/30">
            <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
            <p className="text-dark-400 mb-4">Once you delete your account, there is no going back.</p>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
      )}
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
