'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2, Users, Sparkles, Upload, FileText } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
  mobile: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: string;
  collegeName: string;
  universityName: string;
  yearOfStudy: string;
  course: string;
}

interface RegistrationFormProps {
  hackathonId: string;
  hackathonTitle: string;
  minTeamSize: number;
  maxTeamSize: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationForm({
  hackathonId,
  hackathonTitle,
  minTeamSize,
  maxTeamSize,
  onClose,
  onSuccess,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Team Formation Mode
  const [hasTeam, setHasTeam] = useState<boolean>(true);
  const [needSmartMatching, setNeedSmartMatching] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [preferredTeamSize, setPreferredTeamSize] = useState<number>(minTeamSize);

  // Team Leader Information
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderMobile, setLeaderMobile] = useState('');
  const [leaderGender, setLeaderGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [leaderDOB, setLeaderDOB] = useState('');
  const [leaderCollege, setLeaderCollege] = useState('');
  const [leaderUniversity, setLeaderUniversity] = useState('');
  const [leaderYearOfStudy, setLeaderYearOfStudy] = useState('');
  const [leaderCourse, setLeaderCourse] = useState('');

  // Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Additional Information
  const [projectIdea, setProjectIdea] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // PPT Upload for Selection Round
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pptUploadProgress, setPptUploadProgress] = useState(0);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handlePptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
        setError('Please upload a valid PowerPoint file (.ppt or .pptx)');
        return;
      }
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('PPT file size should not exceed 50MB');
        return;
      }
      setPptFile(file);
      setError('');
    }
  };

  const addTeamMember = () => {
    if (teamMembers.length < maxTeamSize - 1) {
      setTeamMembers([
        ...teamMembers,
        {
          name: '',
          email: '',
          mobile: '',
          gender: 'prefer-not-to-say',
          dateOfBirth: '',
          collegeName: '',
          universityName: '',
          yearOfStudy: '',
          course: '',
        },
      ]);
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const validateForm = () => {
    if (!leaderName.trim() || !leaderEmail.trim() || !leaderMobile.trim()) {
      setError('Your personal information is required');
      return false;
    }

    if (!leaderDOB || !leaderCollege.trim() || !leaderYearOfStudy.trim()) {
      setError('Please fill all required personal fields');
      return false;
    }

    if (hasTeam) {
      if (!teamName.trim()) {
        setError('Team name is required');
        return false;
      }

      const totalSize = teamMembers.length + 1; // +1 for leader
      if (totalSize < minTeamSize) {
        setError(`Minimum team size is ${minTeamSize}`);
        return false;
      }

      if (totalSize > maxTeamSize) {
        setError(`Maximum team size is ${maxTeamSize}`);
        return false;
      }

      // Validate team members
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (!member.name.trim() || !member.email.trim() || !member.mobile.trim() ||
            !member.dateOfBirth || !member.collegeName.trim() || !member.yearOfStudy.trim()) {
          setError(`Please fill all required fields for team member ${i + 1}`);
          return false;
        }
      }
    } else if (needSmartMatching) {
      if (skills.length === 0) {
        setError('Please add at least one skill for smart matching');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload PPT if provided
      let pptUrl = '';
      if (pptFile) {
        const formData = new FormData();
        formData.append('file', pptFile);
        formData.append('hackathonId', hackathonId);

        const uploadResponse = await fetch('/api/hackathons/upload-ppt', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          pptUrl = uploadData.url;
        } else {
          setError('Failed to upload PPT. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const registrationData = {
        hasTeam,
        needSmartMatching: !hasTeam && needSmartMatching,
        skills: needSmartMatching ? skills : [],
        preferredTeamSize: !hasTeam ? preferredTeamSize : undefined,
        teamName: hasTeam ? teamName : undefined,
        teamSize: hasTeam ? teamMembers.length + 1 : 1,
        teamLeaderName: leaderName,
        teamLeaderEmail: leaderEmail,
        teamLeaderMobile: leaderMobile,
        teamLeaderGender: leaderGender,
        teamLeaderDOB: leaderDOB,
        teamLeaderCollege: leaderCollege,
        teamLeaderUniversity: leaderUniversity,
        teamLeaderYearOfStudy: leaderYearOfStudy,
        teamLeaderCourse: leaderCourse,
        teamMembers: hasTeam ? teamMembers : [],
        projectIdea,
        previousHackathonExperience: previousExperience,
        specialRequirements,
        pptUrl,
      };

      const response = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (error) {
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Register for Hackathon</h2>
            <p className="text-dark-300 mt-1">{hackathonTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Team Formation Mode */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Team Formation
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  checked={hasTeam}
                  onChange={() => {
                    setHasTeam(true);
                    setNeedSmartMatching(false);
                  }}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="text-white font-medium">I have a team</div>
                  <div className="text-sm text-dark-300">Register with my existing team members</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  checked={!hasTeam}
                  onChange={() => {
                    setHasTeam(false);
                    setTeamMembers([]);
                  }}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="text-white font-medium">I need a team</div>
                  <div className="text-sm text-dark-300">Use smart matching to find teammates</div>
                </div>
              </label>
            </div>

            {/* Smart Matching Section */}
            {!hasTeam && (
              <div className="mt-4 p-4 bg-gradient-to-br from-primary-900/20 to-purple-900/20 border border-primary-700/50 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  <h4 className="text-white font-medium">Smart Team Matching</h4>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={needSmartMatching}
                    onChange={(e) => setNeedSmartMatching(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-dark-200">Enable smart matching based on my skills</span>
                </label>

                {needSmartMatching && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-dark-200 mb-2">
                        Your Skills <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., React, Python, UI/UX Design"
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-300"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-primary-100 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-dark-200 mb-2">
                        Preferred Team Size
                      </label>
                      <select
                        value={preferredTeamSize}
                        onChange={(e) => setPreferredTeamSize(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      >
                        {Array.from({ length: maxTeamSize - minTeamSize + 1 }, (_, i) => minTeamSize + i).map((size) => (
                          <option key={size} value={size}>
                            {size} members
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-primary-900/30 border border-primary-700/30 rounded-lg">
                      <p className="text-sm text-primary-200">
                        💡 Our AI will match you with other participants who have complementary skills and send collaboration invites!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Team Name - Only show if user has a team */}
          {hasTeam && (
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your team name"
                required={hasTeam}
              />
            </div>
          )}

          {/* Team Leader Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              {hasTeam ? 'Team Leader Information' : 'Your Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={leaderMobile}
                  onChange={(e) => setLeaderMobile(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={leaderGender}
                  onChange={(e) => setLeaderGender(e.target.value as any)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={leaderDOB}
                  onChange={(e) => setLeaderDOB(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  value={leaderYearOfStudy}
                  onChange={(e) => setLeaderYearOfStudy(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={leaderCollege}
                  onChange={(e) => setLeaderCollege(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  University Name
                </label>
                <input
                  type="text"
                  value={leaderUniversity}
                  onChange={(e) => setLeaderUniversity(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Course/Program
                </label>
                <input
                  type="text"
                  value={leaderCourse}
                  onChange={(e) => setLeaderCourse(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Computer Science Engineering"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Team Members (Optional)
              </h3>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={teamMembers.length >= maxTeamSize - 1}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
            
            <p className="text-sm text-dark-400">
              Team size: {minTeamSize} - {maxTeamSize} members (including leader). 
              Current: {teamMembers.length + 1} member(s)
            </p>

            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 bg-dark-800 rounded-lg border border-dark-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-white">Member {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-1 hover:bg-dark-700 rounded text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={member.mobile}
                      onChange={(e) => updateTeamMember(index, 'mobile', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={member.gender}
                      onChange={(e) => updateTeamMember(index, 'gender', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={member.dateOfBirth}
                      onChange={(e) => updateTeamMember(index, 'dateOfBirth', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={member.yearOfStudy}
                      onChange={(e) => updateTeamMember(index, 'yearOfStudy', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.collegeName}
                      onChange={(e) => updateTeamMember(index, 'collegeName', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      University Name
                    </label>
                    <input
                      type="text"
                      value={member.universityName}
                      onChange={(e) => updateTeamMember(index, 'universityName', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Course/Program
                    </label>
                    <input
                      type="text"
                      value={member.course}
                      onChange={(e) => updateTeamMember(index, 'course', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Project Idea (Optional)
              </label>
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Briefly describe your project idea..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Previous Hackathon Experience (Optional)
              </label>
              <textarea
                value={previousExperience}
                onChange={(e) => setPreviousExperience(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="List any previous hackathons you've participated in..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Any dietary restrictions, accessibility needs, etc..."
              />
            </div>
          </div>

          {/* PPT Upload Section for First Selection Round */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Selection Round 1 - PPT Submission</h3>
            </div>
            
            <p className="text-sm text-dark-300">
              Upload your presentation for the first selection round. After clearing this round, you'll proceed to the live modeling hackathon.
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Upload PPT (Optional) <span className="text-xs text-dark-400">(Max 50MB, .ppt or .pptx)</span>
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  id="ppt-upload"
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handlePptUpload}
                  className="hidden"
                />
                <label
                  htmlFor="ppt-upload"
                  className="flex items-center justify-center gap-3 w-full p-6 bg-dark-800 border-2 border-dashed border-dark-600 hover:border-purple-500 rounded-lg cursor-pointer transition-colors group"
                >
                  <Upload className="w-6 h-6 text-dark-400 group-hover:text-purple-400 transition-colors" />
                  <div className="text-center">
                    <div className="text-white font-medium group-hover:text-purple-300 transition-colors">
                      {pptFile ? pptFile.name : 'Click to upload PPT'}
                    </div>
                    <div className="text-xs text-dark-400 mt-1">
                      PowerPoint presentation for selection round
                    </div>
                  </div>
                </label>
              </div>

              {pptFile && (
                <div className="flex items-center justify-between p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white text-sm font-medium">{pptFile.name}</div>
                      <div className="text-xs text-dark-400">
                        {(pptFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPptFile(null)}
                    className="p-2 hover:bg-purple-800/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}

              <div className="p-3 bg-blue-900/30 border border-blue-700/30 rounded-lg">
                <p className="text-xs text-blue-200">
                  📋 <strong>Selection Process:</strong> Round 1 - PPT evaluation → Round 2 - Live modeling hackathon
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-700 bg-dark-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
