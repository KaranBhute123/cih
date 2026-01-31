'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Download, Filter, Calendar, Mail, User, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import SendNotificationModal from '../components/SendNotificationModal';

interface Participant {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  registeredAt: string;
  status: string;
  teamId?: string;
  
  // Team Information
  teamName?: string;
  teamSize?: number;
  teamLeaderName?: string;
  teamLeaderEmail?: string;
  teamLeaderMobile?: string;
  teamLeaderGender?: string;
  teamLeaderDOB?: string;
  teamLeaderCollege?: string;
  teamLeaderUniversity?: string;
  teamLeaderYearOfStudy?: string;
  teamLeaderCourse?: string;
  
  // Team Members
  teamMembers?: Array<{
    name: string;
    email: string;
    mobile: string;
    gender: string;
    dateOfBirth: string;
    collegeName: string;
    universityName?: string;
    yearOfStudy: string;
    course?: string;
  }>;
  
  // Additional Information
  projectIdea?: string;
  previousHackathonExperience?: string;
  specialRequirements?: string;
}

interface TeamInfo {
  _id: string;
  name: string;
  leader: {
    name: string;
    email: string;
  };
  memberCount: number;
  hasCredentials: boolean;
  status: string;
  createdAt: string;
}

interface Hackathon {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  teams?: TeamInfo[];
  maxParticipants?: number;
  status: string;
}

export default function RegistrationsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationHackathon, setNotificationHackathon] = useState<Hackathon | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [selectedHackathon, searchTerm, hackathons]);

  const fetchHackathons = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting to fetch hackathons...');
      
      // Fetch hackathons created by this organization
      const response = await fetch('/api/hackathons?organizationOwned=true');
      const data = await response.json();
      
      console.log('📦 Hackathons response:', data);
      
      if (response.ok) {
        console.log(`Found ${data.hackathons?.length || 0} hackathons`);
        
        const hackathonsWithTeams = await Promise.all(
          (data.hackathons || []).map(async (hackathon: Hackathon) => {
            console.log(`🔍 Fetching teams for: ${hackathon.title} (ID: ${hackathon._id})`);
            
            // Fetch teams for each hackathon with timeout
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
              
              const teamsRes = await fetch(`/api/hackathons/${hackathon._id}/teams`, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              console.log(`📡 Teams API response for ${hackathon.title}: ${teamsRes.status}`);
              
              if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                console.log(`✅ Teams data for ${hackathon.title}:`, teamsData);
                console.log(`✅ Teams count for ${hackathon.title}: ${teamsData.teams?.length || 0}`);
                return {
                  ...hackathon,
                  teams: teamsData.teams || []
                };
              } else {
                const errorText = await teamsRes.text();
                console.error(`❌ Teams API error for ${hackathon.title}:`, teamsRes.status, errorText);
                return {
                  ...hackathon,
                  teams: []
                };
              }
            } catch (error: any) {
              if (error.name === 'AbortError') {
                console.error(`⏱️ Timeout fetching teams for ${hackathon.title}`);
              } else {
                console.error(`❌ Failed to fetch teams for ${hackathon.title}:`, error);
              }
              return {
                ...hackathon,
                teams: []
              };
            }
          })
        );
        
        console.log('🎉 Final hackathons with teams:', hackathonsWithTeams);
        setHackathons(hackathonsWithTeams);
      }
    } catch (error) {
      console.error('💥 Failed to fetch hackathons:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ Finished loading');
    }
  };

  const filterHackathons = () => {
    let filtered = hackathons;

    if (selectedHackathon !== 'all') {
      filtered = filtered.filter(h => h._id === selectedHackathon);
    }

    if (searchTerm) {
      filtered = filtered.map(h => ({
        ...h,
        participants: h.participants?.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
      }));
    }

    setFilteredHackathons(filtered);
  };

  const getTotalRegistrations = () => {
    return hackathons.reduce((sum, h) => sum + (h.participants?.length || 0), 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'checked-in':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'disqualified':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportToCSV = (hackathonId: string) => {
    const hackathon = hackathons.find(h => h._id === hackathonId);
    if (!hackathon || !hackathon.participants) return;

    const csv = [
      ['Name', 'Email', 'Team Name', 'Team Size', 'Leader Mobile', 'Leader College', 'Year of Study', 'Registered At', 'Status'].join(','),
      ...hackathon.participants.map(p => [
        p.name,
        p.email,
        p.teamName || 'N/A',
        p.teamSize || '1',
        p.teamLeaderMobile || 'N/A',
        p.teamLeaderCollege || 'N/A',
        p.teamLeaderYearOfStudy || 'N/A',
        new Date(p.registeredAt).toLocaleString(),
        p.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon.title}-registrations.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hackathon Registrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage participant registrations for your hackathons
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalRegistrations()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Hackathons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hackathons.filter(h => h.status === 'published' || h.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. per Hackathon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hackathons.length > 0 ? Math.round(getTotalRegistrations() / hackathons.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search participants by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Hackathons</option>
                {hackathons.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.title} ({h.participants?.length || 0} registrations)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="space-y-6">
          {filteredHackathons.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No registrations found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search' : 'Your hackathons don\'t have any registrations yet'}
              </p>
            </div>
          ) : (
            filteredHackathons.map(hackathon => (
              <div key={hackathon._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                {/* Hackathon Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {hackathon.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(hackathon.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {hackathon.teams?.length || 0} teams registered
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNotificationHackathon(hackathon);
                          setShowNotificationModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                        Send Notification
                      </button>
                      <button
                        onClick={() => exportToCSV(hackathon._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teams List */}
                {hackathon.teams && hackathon.teams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team Leader
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Members
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {hackathon.teams.map((team) => (
                          <tr key={team._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {team.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {team.leader.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {team.leader.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {team.memberCount} members
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {team.hasCredentials ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3" />
                                  Selected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!team.hasCredentials && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Select team "${team.name}" for this hackathon?\n\nIDE credentials will be generated and sent to:\n• Team Leader: ${team.leader.name}\n• All ${team.memberCount} team member(s)\n\nThey will receive login credentials via email.`)) {
                                      try {
                                        const res = await fetch(`/api/hackathons/${hackathon._id}/select-team`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ teamId: team._id })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                          alert(`✅ Team Selected Successfully!\n\n` +
                                            `Team: ${data.teamName}\n` +
                                            `Username: ${data.username}\n` +
                                            `Emails Sent: ${data.emailsSent}\n\n` +
                                            `📧 Credentials have been sent to:\n` +
                                            data.recipients.map((r: any) => `• ${r.name} (${r.email})`).join('\n') +
                                            `\n\n📋 Check your terminal for email details.`);
                                          fetchHackathons();
                                        } else {
                                          alert('❌ ' + (data.error || 'Failed to select team'));
                                        }
                                      } catch (error) {
                                        alert('❌ Failed to select team. Please try again.');
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  Select Team
                                </button>
                              )}
                              {team.hasCredentials && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ✅ Credentials sent
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    No teams registered yet
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && notificationHackathon && (
        <SendNotificationModal
          hackathonId={notificationHackathon._id}
          hackathonTitle={notificationHackathon.title}
          onClose={() => {
            setShowNotificationModal(false);
            setNotificationHackathon(null);
          }}
          onSuccess={() => {
            setShowNotificationModal(false);
            setNotificationHackathon(null);
          }}
        />
      )}
    </div>
  );
}
