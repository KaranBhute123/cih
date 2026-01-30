'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Clock, Users, ArrowRight, Activity, AlertCircle } from 'lucide-react';

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  registeredTeams: string[];
  organization: {
    _id: string;
    name: string;
  };
}

export default function MonitorSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchHackathons();
    }
  }, [status, router]);

  const fetchHackathons = async () => {
    try {
      const res = await fetch('/api/hackathons/my');
      if (res.ok) {
        const data = await res.json();
        setHackathons(data.hackathons || []);
      }
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading hackathons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Eye className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live Monitoring</h1>
              <p className="text-dark-300">Select a hackathon to monitor team activities in real-time</p>
            </div>
          </div>
        </div>

        {/* Hackathons List */}
        {hackathons.length === 0 ? (
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Hackathons Found</h3>
            <p className="text-dark-400 mb-6">
              Create a hackathon to start monitoring team activities.
            </p>
            <Link
              href="/dashboard/hackathons/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
            >
              Create Hackathon
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {hackathons.map((hackathon) => (
              <Link
                key={hackathon._id}
                href={`/dashboard/organization/hackathons/${hackathon._id}/monitor`}
                className="block bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {hackathon.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          hackathon.status
                        )}`}
                      >
                        {hackathon.status}
                      </span>
                    </div>

                    <p className="text-dark-300 mb-4 line-clamp-2">
                      {hackathon.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-dark-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-dark-400">
                        <Users className="w-4 h-4" />
                        <span>{hackathon.registeredTeams?.length || 0} teams registered</span>
                      </div>
                      {hackathon.status === 'active' && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Activity className="w-4 h-4" />
                          <span>Live monitoring available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <ArrowRight className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-primary-900/20 border border-primary-700/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">About Live Monitoring</h3>
              <p className="text-dark-300 text-sm mb-2">
                Monitor your hackathon teams in real-time and track their activities:
              </p>
              <ul className="text-dark-300 text-sm space-y-1 list-disc list-inside">
                <li>File creation, editing, and code execution</li>
                <li>Terminal commands and AI assistant queries</li>
                <li>Violations and leave attempts</li>
                <li>Team activity status and session duration</li>
                <li>Export activity logs for review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
