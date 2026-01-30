'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Download, Filter, Calendar, Mail, User, CheckCircle, XCircle, Clock } from 'lucide-react';

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

interface Hackathon {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  maxParticipants?: number;
  status: string;
}

export default function RegistrationsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [selectedHackathon, searchTerm, hackathons]);

  const fetchHackathons = async () => {
    try {
      setIsLoading(true);
      // Fetch hackathons created by this organization
      const response = await fetch('/api/hackathons?organizationOwned=true');
      const data = await response.json();
      
      if (response.ok) {
        setHackathons(data.hackathons || []);
      }
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    } finally {
      setIsLoading(false);
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
                          {hackathon.participants?.length || 0}
                          {hackathon.maxParticipants && `/${hackathon.maxParticipants}`} registered
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => exportToCSV(hackathon._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Participants List */}
                {hackathon.participants && hackathon.participants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Participant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {hackathon.participants.map((participant, index) => (
                          <tr key={participant.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {participant.avatar ? (
                                  <img
                                    src={participant.avatar}
                                    alt={participant.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {participant.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {participant.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {new Date(participant.registeredAt).toLocaleDateString()} {new Date(participant.registeredAt).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(participant.status)}
                                <span className="text-sm capitalize text-gray-900 dark:text-white">
                                  {participant.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {participant.teamId || 'No team'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    No participants registered yet
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
