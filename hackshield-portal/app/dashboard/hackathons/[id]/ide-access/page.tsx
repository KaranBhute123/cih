'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Lock, 
  Unlock, 
  Code, 
  AlertTriangle, 
  Shield,
  Timer,
  Users,
  ChevronLeft,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IDEAccessPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [credentials, setCredentials] = useState({
    accessId: '',
    password: ''
  });

  useEffect(() => {
    fetchHackathonDetails();
  }, [params.id]);

  const fetchHackathonDetails = async () => {
    try {
      const res = await fetch(`/api/hackathons/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setHackathon(data);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    }
  };

  const handleAccessIDE = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.accessId || !credentials.password) {
      toast.error('Please enter both Access ID and Password');
      return;
    }

    setLoading(true);

    try {
      // Verify credentials with backend
      const verifyRes = await fetch(`/api/hackathons/${params.id}/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessId: credentials.accessId,
          password: credentials.password,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Show warning about lockdown mode
      const confirmed = window.confirm(
        '⚠️ IMPORTANT WARNING ⚠️\n\n' +
        '🔒 Once you enter the IDE, LOCKDOWN MODE will activate:\n\n' +
        '• Timer starts immediately\n' +
        '• Cannot leave IDE during hackathon\n' +
        '• Attempting to leave = 15 second warning\n' +
        '• 3 strikes = DISQUALIFICATION\n' +
        '• All activities are monitored\n\n' +
        'Are you ready to start?'
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }

      toast.success('Access verified! Entering IDE...');
      
      // Redirect to IDE with credentials
      setTimeout(() => {
        router.push(`/dashboard/hackathons/${params.id}/ide?accessId=${credentials.accessId}&password=${credentials.password}`);
      }, 1000);

    } catch (error) {
      console.error('IDE access error:', error);
      toast.error('Failed to verify credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Hackathon
          </button>
          
          {hackathon && (
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    IDE Access Portal
                  </h1>
                  <p className="text-dark-300">
                    {hackathon.title}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Access Form */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">Enter IDE Credentials</h2>
            </div>

            <form onSubmit={handleAccessIDE} className="space-y-6">
              {/* Access ID */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Access ID
                </label>
                <input
                  type="text"
                  value={credentials.accessId}
                  onChange={(e) => setCredentials({ ...credentials, accessId: e.target.value.toUpperCase() })}
                  placeholder="Enter your Access ID"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg tracking-wider"
                  maxLength={20}
                  required
                />
                <p className="mt-1 text-xs text-dark-400">
                  Format: XXXX-XXXX-XXXX (received via email)
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Access IDE
                  </>
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Don't have credentials?</strong> Team leaders receive IDE credentials via email after qualification. Contact your team leader or check your registered email.
              </p>
            </div>
          </div>

          {/* Right Side - Rules & Features */}
          <div className="space-y-6">
            {/* Lockdown Rules */}
            <div className="glass-card p-6 border-2 border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">Lockdown Mode Rules</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-dark-200">
                  <Timer className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Timer starts on login</strong>
                    <p className="text-sm text-dark-300">Be ready before entering</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-dark-200">
                  <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Cannot leave IDE</strong>
                    <p className="text-sm text-dark-300">Lockdown active during hackathon</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-dark-200">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">3 Strike System</strong>
                    <p className="text-sm text-dark-300">15s warning per strike, 3 = disqualification</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-dark-200">
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Activity Monitoring</strong>
                    <p className="text-sm text-dark-300">All actions are tracked and logged</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* IDE Features */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">IDE Features</h3>
              </div>
              <ul className="space-y-2 text-dark-200">
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  Multi-language support (Python, JS, TS, Java, C++, HTML, CSS)
                </li>
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  Create files with any extension
                </li>
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  Live code execution & terminal
                </li>
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  Local hosting & live preview
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  Team collaboration with branches
                </li>
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  AI coding assistant
                </li>
                <li className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  One-click deployment
                </li>
              </ul>
            </div>

            {/* Team Members Note */}
            <div className="glass-card p-6 bg-primary-500/10 border border-primary-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-primary-400" />
                <h3 className="text-lg font-bold text-white">Team Members</h3>
              </div>
              <p className="text-dark-200 text-sm">
                Team leaders can create branches for team members from within the IDE. 
                Each member gets their own branch with unique credentials for collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
