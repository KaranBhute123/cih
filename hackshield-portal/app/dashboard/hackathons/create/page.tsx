'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Save,
  Calendar,
  Trophy,
  Users,
  Shield,
  Code,
  FileText,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Prize {
  position: string;
  amount: number;
  description: string;
}

interface JudgingCriteria {
  name: string;
  weight: number;
  description: string;
}

interface TimelineEvent {
  event: string;
  date: string;
  description: string;
}

export default function CreateHackathonPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    theme: 'AI/ML',
    mode: 'online',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeamSize: 4,
    minTeamSize: 1,
    maxParticipants: 100,
    coverImage: '',
    rules: [''],
    allowedTechnologies: [''],
  });

  const [prizes, setPrizes] = useState<Prize[]>([
    { position: '1st Place', amount: 5000, description: '' },
    { position: '2nd Place', amount: 3000, description: '' },
    { position: '3rd Place', amount: 1000, description: '' },
  ]);

  const [judgingCriteria, setJudgingCriteria] = useState<JudgingCriteria[]>([
    { name: 'Innovation', weight: 30, description: '' },
    { name: 'Technical Implementation', weight: 30, description: '' },
    { name: 'Design & UX', weight: 20, description: '' },
    { name: 'Presentation', weight: 20, description: '' },
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { event: 'Registration Opens', date: '', description: '' },
    { event: 'Hackathon Starts', date: '', description: '' },
    { event: 'Submission Deadline', date: '', description: '' },
    { event: 'Results Announcement', date: '', description: '' },
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    lockdownMode: true,
    tabSwitchLimit: 3,
    fullscreenRequired: true,
    codeRecording: true,
    aiProctoring: false,
    plagiarismCheck: true,
  });

  const themes = ['AI/ML', 'Blockchain', 'Web Development', 'Mobile Apps', 'IoT', 'Cloud Computing', 'Cybersecurity', 'FinTech', 'HealthTech', 'EdTech', 'Open Innovation'];
  const modes = ['online', 'offline', 'hybrid'];

  const totalSteps = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleArrayChange = (field: 'rules' | 'allowedTechnologies', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'rules' | 'allowedTechnologies') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'rules' | 'allowedTechnologies', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };

  const addPrize = () => {
    setPrizes([...prizes, { position: '', amount: 0, description: '' }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index: number, field: keyof JudgingCriteria, value: string | number) => {
    const newCriteria = [...judgingCriteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setJudgingCriteria(newCriteria);
  };

  const addCriteria = () => {
    setJudgingCriteria([...judgingCriteria, { name: '', weight: 0, description: '' }]);
  };

  const removeCriteria = (index: number) => {
    setJudgingCriteria(judgingCriteria.filter((_, i) => i !== index));
  };

  const handleTimelineChange = (index: number, field: keyof TimelineEvent, value: string) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
  };

  const handleSubmit = async () => {
    if (!session || session.user.role !== 'organization') {
      toast.error('Only organizations can create hackathons');
      return;
    }

    setLoading(true);

    try {
      const hackathonData = {
        ...formData,
        prizes,
        judgingCriteria,
        timeline: timeline.filter(t => t.event && t.date),
        securitySettings,
        rules: formData.rules.filter(r => r.trim()),
        allowedTechnologies: formData.allowedTechnologies.filter(t => t.trim()),
      };

      const res = await fetch('/api/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hackathonData),
      });

      const data = await res.json();

      if (res.ok && data.hackathon) {
        toast.success('Hackathon created successfully!');
        router.push(`/dashboard/hackathons/${data.hackathon._id}`);
      } else {
        toast.error(data.error || 'Failed to create hackathon');
      }
    } catch (error) {
      console.error('Error creating hackathon:', error);
      toast.error('Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.title && !!formData.tagline && !!formData.description;
      case 2:
        return !!formData.startDate && !!formData.endDate && !!formData.registrationDeadline;
      case 3:
        return prizes.length > 0 && prizes.every(p => p.position && p.amount > 0);
      case 4:
        return judgingCriteria.length > 0 && judgingCriteria.reduce((sum, c) => sum + c.weight, 0) === 100;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/dashboard/hackathons" className="flex items-center gap-2 text-dark-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" />
        Back to Hackathons
      </Link>

      <h1 className="text-3xl font-bold mb-2">Create New Hackathon</h1>
      <p className="text-dark-400 mb-8">Fill in the details to launch your hackathon</p>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Basic Info', icon: FileText },
          { num: 2, label: 'Schedule', icon: Calendar },
          { num: 3, label: 'Prizes', icon: Trophy },
          { num: 4, label: 'Judging', icon: Users },
          { num: 5, label: 'Security', icon: Shield },
        ].map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.num
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < 4 && (
              <div className={`w-16 h-1 ${currentStep > step.num ? 'bg-primary-500' : 'bg-dark-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Hackathon Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., AI Innovation Challenge 2024"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tagline *</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g., Build the future of AI in 48 hours"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your hackathon, its goals, and what participants will build..."
                className="input-field min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="input-field"
                >
                  {themes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="input-field"
                >
                  {modes.map(mode => (
                    <option key={mode} value={mode} className="capitalize">{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Team Size</label>
                <input
                  type="number"
                  name="minTeamSize"
                  value={formData.minTeamSize}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Team Size</label>
                <input
                  type="number"
                  name="maxTeamSize"
                  value={formData.maxTeamSize}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={10}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Schedule & Timeline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Registration Deadline *</label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Timeline Events</h3>
                <button
                  type="button"
                  onClick={() => setTimeline([...timeline, { event: '', date: '', description: '' }])}
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </button>
              </div>
              
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-dark-800 rounded-lg">
                    <input
                      type="text"
                      value={event.event}
                      onChange={(e) => handleTimelineChange(index, 'event', e.target.value)}
                      placeholder="Event name"
                      className="input-field"
                    />
                    <input
                      type="datetime-local"
                      value={event.date}
                      onChange={(e) => handleTimelineChange(index, 'date', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={event.description}
                      onChange={(e) => handleTimelineChange(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={() => setTimeline(timeline.filter((_, i) => i !== index))}
                      className="btn-secondary text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Prizes */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Prizes
            </h2>

            <div className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-dark-800 rounded-lg">
                  <input
                    type="text"
                    value={prize.position}
                    onChange={(e) => handlePrizeChange(index, 'position', e.target.value)}
                    placeholder="e.g., 1st Place"
                    className="input-field"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">$</span>
                    <input
                      type="number"
                      value={prize.amount}
                      onChange={(e) => handlePrizeChange(index, 'amount', parseInt(e.target.value) || 0)}
                      placeholder="Amount"
                      className="input-field pl-7"
                    />
                  </div>
                  <input
                    type="text"
                    value={prize.description}
                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="btn-secondary text-red-400 hover:text-red-300"
                    disabled={prizes.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addPrize} className="btn-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Prize
            </button>

            <div className="p-4 bg-primary-500/10 rounded-lg">
              <div className="text-lg font-bold text-primary-400">
                Total Prize Pool: ${prizes.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Judging Criteria */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Judging Criteria
            </h2>

            <div className="space-y-4">
              {judgingCriteria.map((criteria, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-dark-800 rounded-lg">
                  <input
                    type="text"
                    value={criteria.name}
                    onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                    placeholder="Criteria name"
                    className="input-field"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      value={criteria.weight}
                      onChange={(e) => handleCriteriaChange(index, 'weight', parseInt(e.target.value) || 0)}
                      placeholder="Weight"
                      min={0}
                      max={100}
                      className="input-field pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">%</span>
                  </div>
                  <input
                    type="text"
                    value={criteria.description}
                    onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => removeCriteria(index)}
                    className="btn-secondary text-red-400 hover:text-red-300"
                    disabled={judgingCriteria.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addCriteria} className="btn-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Criteria
            </button>

            <div className={`p-4 rounded-lg ${judgingCriteria.reduce((sum, c) => sum + c.weight, 0) === 100 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className={`font-medium ${judgingCriteria.reduce((sum, c) => sum + c.weight, 0) === 100 ? 'text-green-400' : 'text-red-400'}`}>
                Total Weight: {judgingCriteria.reduce((sum, c) => sum + c.weight, 0)}% 
                {judgingCriteria.reduce((sum, c) => sum + c.weight, 0) !== 100 && ' (Must equal 100%)'}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Security Settings */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Security & Proctoring Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'lockdownMode', label: 'Lockdown Mode', description: 'Enable secure coding environment' },
                { key: 'fullscreenRequired', label: 'Fullscreen Required', description: 'Participants must be in fullscreen' },
                { key: 'codeRecording', label: 'Code Recording', description: 'Record all code changes' },
                { key: 'aiProctoring', label: 'AI Proctoring', description: 'AI-based behavior monitoring' },
                { key: 'plagiarismCheck', label: 'Plagiarism Check', description: 'Check submissions for plagiarism' },
              ].map(({ key, label, description }) => (
                <label key={key} className="flex items-start gap-3 p-4 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700">
                  <input
                    type="checkbox"
                    checked={securitySettings[key as keyof typeof securitySettings] as boolean}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-1 w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-dark-400">{description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tab Switch Limit</label>
              <input
                type="number"
                value={securitySettings.tabSwitchLimit}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, tabSwitchLimit: parseInt(e.target.value) || 0 }))}
                min={0}
                max={10}
                className="input-field max-w-xs"
              />
              <p className="text-sm text-dark-400 mt-1">Number of allowed tab switches before warning (0 = unlimited)</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Allowed Technologies
                </h3>
                <button type="button" onClick={() => addArrayItem('allowedTechnologies')} className="btn-secondary text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.allowedTechnologies.map((tech, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleArrayChange('allowedTechnologies', index, e.target.value)}
                      placeholder="Technology"
                      className="input-field w-40"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('allowedTechnologies', index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Rules & Guidelines</h3>
                <button type="button" onClick={() => addArrayItem('rules')} className="btn-secondary text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-dark-400">{index + 1}.</span>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleArrayChange('rules', index, e.target.value)}
                      placeholder="Enter a rule"
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('rules', index)}
                      className="p-2 text-red-400 hover:text-red-300"
                      disabled={formData.rules.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            Previous
          </button>

          <div className="text-dark-400">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Hackathon'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
