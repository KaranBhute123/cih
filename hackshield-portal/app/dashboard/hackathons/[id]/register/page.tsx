'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  ArrowLeft,
  Check,
  Mail,
  X,
  Loader2,
  Crown,
  Code2,
  Palette,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Hackathon {
  _id: string;
  title: string;
  minTeamSize: number;
  maxTeamSize: number;
  soloAllowed: boolean;
}

export default function RegisterForHackathonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const hackathonId = params.id as string;
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationType, setRegistrationType] = useState<'have-team' | 'need-team' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  
  // For "Need a Team" profile
  const [lookingProfile, setLookingProfile] = useState({
    skills: [] as string[],
    experience: 'intermediate',
    preferredRole: 'developer',
    availability: 'full',
    bio: '',
    github: '',
    linkedin: '',
  });
  
  const skillOptions = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'TypeScript', 'JavaScript', 'UI/UX', 'Mobile', 'AI/ML', 'Blockchain', 'DevOps', 'Database'];
  
  useEffect(() => {
    fetchHackathon();
  }, [hackathonId]);
  
  const fetchHackathon = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}`);
      if (res.ok) {
        const data = await res.json();
        setHackathon(data.hackathon);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEmail = () => {
    if (inviteEmails.length < (hackathon?.maxTeamSize || 4) - 1) {
      setInviteEmails([...inviteEmails, '']);
    }
  };
  
  const handleRemoveEmail = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };
  
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };
  
  const toggleSkill = (skill: string) => {
    if (lookingProfile.skills.includes(skill)) {
      setLookingProfile({
        ...lookingProfile,
        skills: lookingProfile.skills.filter(s => s !== skill)
      });
    } else {
      setLookingProfile({
        ...lookingProfile,
        skills: [...lookingProfile.skills, skill]
      });
    }
  };
  
  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          hackathonId,
          invitedEmails: inviteEmails.filter(e => e.trim()),
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Team created successfully!');
        router.push(`/dashboard/teams/${data.team._id}`);
      } else {
        toast.error(data.error || 'Failed to create team');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleLookingForTeam = async () => {
    if (lookingProfile.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    
    setSubmitting(true);
    try {
      // Update user profile with looking-for-team status
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lookingProfile,
          lookingForTeam: true,
          lookingForHackathon: hackathonId,
        }),
      });
      
      if (res.ok) {
        toast.success('Profile updated! You can now be discovered by other participants.');
        router.push(`/dashboard/hackathons/${hackathonId}/find-team`);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  if (!hackathon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Hackathon not found</h2>
        <Link href="/dashboard/hackathons" className="text-primary-400 hover:text-primary-300">
          Back to Hackathons
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/hackathons/${hackathonId}`}
          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Register for {hackathon.title}</h1>
          <p className="text-dark-400">Choose how you want to participate</p>
        </div>
      </div>
      
      {/* Registration Type Selection */}
      {!registrationType && (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setRegistrationType('have-team')}
            className="card-hover p-8 text-left group"
          >
            <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
              <Users className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">I Have a Team</h3>
            <p className="text-dark-400">
              Create a team and invite your teammates to join. You'll be the team leader.
            </p>
          </button>
          
          <button
            onClick={() => setRegistrationType('need-team')}
            className="card-hover p-8 text-left group"
          >
            <div className="w-16 h-16 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4 group-hover:bg-accent-500/30 transition-colors">
              <UserPlus className="w-8 h-8 text-accent-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">I Need a Team</h3>
            <p className="text-dark-400">
              Create a profile to be discovered by other participants looking for teammates.
            </p>
          </button>
        </div>
      )}
      
      {/* Create Team Form */}
      {registrationType === 'have-team' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create Your Team</h2>
            <button 
              onClick={() => setRegistrationType(null)}
              className="text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div>
            <label className="label">Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="input-field"
              placeholder="e.g., CodeNinjas"
            />
          </div>
          
          <div>
            <label className="label">Invite Teammates (Optional)</label>
            <p className="text-sm text-dark-400 mb-3">
              Team size: {hackathon.minTeamSize}-{hackathon.maxTeamSize} members
            </p>
            {inviteEmails.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="input-field pl-10"
                    placeholder="teammate@email.com"
                  />
                </div>
                {inviteEmails.length > 1 && (
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {inviteEmails.length < (hackathon.maxTeamSize - 1) && (
              <button
                onClick={handleAddEmail}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Add another teammate
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setRegistrationType(null)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleCreateTeam}
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Create Team
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Looking for Team Form */}
      {registrationType === 'need-team' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <button 
              onClick={() => setRegistrationType(null)}
              className="text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div>
            <label className="label">Your Skills *</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    lookingProfile.skills.includes(skill)
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {lookingProfile.skills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Experience Level</label>
              <select
                value={lookingProfile.experience}
                onChange={(e) => setLookingProfile({...lookingProfile, experience: e.target.value})}
                className="input-field"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label className="label">Preferred Role</label>
              <select
                value={lookingProfile.preferredRole}
                onChange={(e) => setLookingProfile({...lookingProfile, preferredRole: e.target.value})}
                className="input-field"
              >
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="pm">Project Manager</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Availability During Hackathon</label>
            <select
              value={lookingProfile.availability}
              onChange={(e) => setLookingProfile({...lookingProfile, availability: e.target.value})}
              className="input-field"
            >
              <option value="full">Full time (all hours)</option>
              <option value="partial">Partial (some hours)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          
          <div>
            <label className="label">Short Bio</label>
            <textarea
              value={lookingProfile.bio}
              onChange={(e) => setLookingProfile({...lookingProfile, bio: e.target.value})}
              className="input-field h-24"
              placeholder="Tell potential teammates about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-dark-500 mt-1">{lookingProfile.bio.length}/200</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">GitHub Profile</label>
              <input
                type="url"
                value={lookingProfile.github}
                onChange={(e) => setLookingProfile({...lookingProfile, github: e.target.value})}
                className="input-field"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="label">LinkedIn Profile</label>
              <input
                type="url"
                value={lookingProfile.linkedin}
                onChange={(e) => setLookingProfile({...lookingProfile, linkedin: e.target.value})}
                className="input-field"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setRegistrationType(null)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleLookingForTeam}
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Find Teammates
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
