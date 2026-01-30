'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Loader2, Eye, EyeOff, Building, Briefcase, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';

type UserRole = 'participant' | 'organization' | 'contributor';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'participant';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    // Participant fields
    skills: [] as string[],
    experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    github: '',
    linkedin: '',
    // Organization fields
    orgName: '',
    orgType: 'company' as 'university' | 'company' | 'nonprofit' | 'community',
    orgWebsite: '',
    // Contributor fields
    contributorType: 'investor' as 'company' | 'investor' | 'mentor' | 'freelancer' | 'accelerator',
    companyName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Account created successfully! Please login.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const roleOptions = [
    {
      value: 'participant',
      label: 'Participant',
      description: 'Join hackathons and build projects',
      icon: Code2,
      color: 'from-blue-500 to-blue-600',
    },
    {
      value: 'organization',
      label: 'Organization',
      description: 'Host and manage hackathons',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
    },
    {
      value: 'contributor',
      label: 'Contributor',
      description: 'Invest, mentor, or hire talent',
      icon: Briefcase,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-2xl">
        <div className="card">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Shield className="w-10 h-10 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">HackShield</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="text-dark-400 mt-2">Join the future of hackathons</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-dark-700'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Role Selection */}
                <div>
                  <label className="label">I want to join as</label>
                  <div className="grid grid-cols-3 gap-4">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: option.value as UserRole })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.role === option.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <option.icon className={`w-8 h-8 mx-auto mb-2 ${
                          formData.role === option.value ? 'text-primary-400' : 'text-dark-400'
                        }`} />
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-dark-400 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="text"
                        id="name"
                        className="input-field pl-10"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="email"
                        id="email"
                        className="input-field pl-10"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        className="input-field pl-10"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary w-full py-3"
                  disabled={!formData.name || !formData.email || !formData.password}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Role-specific fields */}
                {formData.role === 'participant' && (
                  <>
                    <div>
                      <label className="label">Experience Level</label>
                      <select
                        className="input-field"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value as any })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Skills</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="badge-primary flex items-center gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              className="ml-1 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['React', 'Python', 'JavaScript', 'Node.js', 'AI/ML', 'UI/UX', 'Mobile', 'Blockchain'].map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillAdd(skill)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              formData.skills.includes(skill)
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="github" className="label">GitHub (optional)</label>
                        <input
                          type="url"
                          id="github"
                          className="input-field"
                          placeholder="https://github.com/username"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="linkedin" className="label">LinkedIn (optional)</label>
                        <input
                          type="url"
                          id="linkedin"
                          className="input-field"
                          placeholder="https://linkedin.com/in/username"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.role === 'organization' && (
                  <>
                    <div>
                      <label htmlFor="orgName" className="label">Organization Name</label>
                      <input
                        type="text"
                        id="orgName"
                        className="input-field"
                        placeholder="Your Organization"
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Organization Type</label>
                      <select
                        className="input-field"
                        value={formData.orgType}
                        onChange={(e) => setFormData({ ...formData, orgType: e.target.value as any })}
                      >
                        <option value="company">Company / Startup</option>
                        <option value="university">University / College</option>
                        <option value="nonprofit">Non-Profit</option>
                        <option value="community">Community / Group</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="orgWebsite" className="label">Website (optional)</label>
                      <input
                        type="url"
                        id="orgWebsite"
                        className="input-field"
                        placeholder="https://yourcompany.com"
                        value={formData.orgWebsite}
                        onChange={(e) => setFormData({ ...formData, orgWebsite: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {formData.role === 'contributor' && (
                  <>
                    <div>
                      <label className="label">Contributor Type</label>
                      <select
                        className="input-field"
                        value={formData.contributorType}
                        onChange={(e) => setFormData({ ...formData, contributorType: e.target.value as any })}
                      >
                        <option value="investor">Investor / VC</option>
                        <option value="company">Company / Startup</option>
                        <option value="mentor">Mentor</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="accelerator">Accelerator / Incubator</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="companyName" className="label">Company Name (optional)</label>
                      <input
                        type="text"
                        id="companyName"
                        className="input-field"
                        placeholder="Your Company"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1 py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
