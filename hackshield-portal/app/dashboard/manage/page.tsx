'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Trophy, 
  Users, 
  Plus,
  BarChart3,
  Eye,
  Settings,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Hackathon {
  _id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  registeredTeams: string[];
  totalPrizePool: number;
  views: number;
  mode: string;
}

export default function ManageHackathonsPage() {
  const { data: session } = useSession();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchHackathons();
  }, []);
  
  const fetchHackathons = async () => {
    try {
      const res = await fetch('/api/hackathons/my');
      if (res.ok) {
        const data = await res.json();
        setHackathons(data.hackathons || []);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/hackathons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(`Hackathon ${newStatus}`);
        fetchHackathons();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
  
  const deleteHackathon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;
    
    try {
      const res = await fetch(`/api/hackathons/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Hackathon deleted');
        fetchHackathons();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-dark-600 text-dark-300';
      case 'published': return 'badge-primary';
      case 'active': return 'badge-success';
      case 'judging': return 'badge-warning';
      case 'completed': return 'bg-dark-600 text-dark-300';
      default: return 'bg-dark-700 text-dark-400';
    }
  };
  
  const filteredHackathons = hackathons.filter(h => {
    if (filter === 'all') return true;
    return h.status === filter;
  });
  
  const stats = {
    total: hackathons.length,
    active: hackathons.filter(h => h.status === 'active').length,
    totalTeams: hackathons.reduce((acc, h) => acc + (h.registeredTeams?.length || 0), 0),
    totalPrize: hackathons.reduce((acc, h) => acc + (h.totalPrizePool || 0), 0),
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Hackathons</h1>
          <p className="text-dark-400">Create and manage your hackathon events</p>
        </div>
        <Link href="/dashboard/hackathons/create" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Hackathon
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-500/10">
              <Trophy className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-dark-400">Total Events</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-sm text-dark-400">Active Now</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <div className="text-sm text-dark-400">Total Teams</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">${stats.totalPrize.toLocaleString()}</div>
              <div className="text-sm text-dark-400">Prize Pool</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'draft', 'published', 'active', 'judging', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === status ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      
      {/* Hackathons List */}
      {filteredHackathons.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hackathons found</h3>
          <p className="text-dark-400 mb-6">
            {filter === 'all' ? 'Create your first hackathon to get started.' : `No ${filter} hackathons.`}
          </p>
          <Link href="/dashboard/hackathons/create" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Hackathon
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHackathons.map((hackathon) => (
            <div key={hackathon._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{hackathon.title}</h3>
                    <span className={`badge ${getStatusBadge(hackathon.status)}`}>
                      {hackathon.status}
                    </span>
                    <span className="badge bg-dark-700 text-dark-300 capitalize">
                      {hackathon.mode}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(hackathon.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {hackathon.registeredTeams?.length || 0} teams
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {hackathon.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${hackathon.totalPrizePool?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hackathon.status === 'draft' && (
                    <button
                      onClick={() => updateStatus(hackathon._id, 'published')}
                      className="btn-primary text-sm py-2"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Publish
                    </button>
                  )}
                  {hackathon.status === 'published' && (
                    <button
                      onClick={() => updateStatus(hackathon._id, 'active')}
                      className="btn-accent text-sm py-2"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </button>
                  )}
                  {hackathon.status === 'active' && (
                    <button
                      onClick={() => updateStatus(hackathon._id, 'judging')}
                      className="btn-warning text-sm py-2"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      End & Judge
                    </button>
                  )}
                  {hackathon.status === 'judging' && (
                    <button
                      onClick={() => updateStatus(hackathon._id, 'completed')}
                      className="btn-success text-sm py-2"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Announce Results
                    </button>
                  )}
                  
                  <Link
                    href={`/dashboard/hackathons/${hackathon._id}`}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/hackathons/${hackathon._id}/edit`}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/hackathons/${hackathon._id}/monitor`}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    title="Monitor"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteHackathon(hackathon._id)}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
