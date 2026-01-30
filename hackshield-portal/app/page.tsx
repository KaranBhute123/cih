import Link from 'next/link';
import { 
  Shield, 
  Code2, 
  Users, 
  Trophy, 
  Rocket, 
  Brain,
  Lock,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">HackShield</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/hackathons" className="text-dark-200 hover:text-white transition-colors">
                Hackathons
              </Link>
              <Link href="/projects" className="text-dark-200 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/contributors" className="text-dark-200 hover:text-white transition-colors">
                Contributors
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300">The Future of Hackathons is Here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Code. Compete.</span>
            <br />
            <span className="text-white">Collaborate.</span>
          </h1>
          
          <p className="text-xl text-dark-300 max-w-3xl mx-auto mb-12">
            The complete hackathon platform with a lockdown IDE, AI-powered fairness engine, 
            real-time collaboration, and a marketplace to turn your projects into products.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register?role=participant" className="btn-primary text-lg px-8 py-4">
              Join as Participant
            </Link>
            <Link href="/auth/register?role=organization" className="btn-secondary text-lg px-8 py-4">
              Host a Hackathon
            </Link>
            <Link href="/auth/register?role=contributor" className="btn-accent text-lg px-8 py-4">
              Become a Contributor
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Win</span>
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              From registration to results, we've built the most comprehensive hackathon platform ever created.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-hover group">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              Whether you're a participant, organization, or contributor, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <div key={index} className="card-hover text-center">
                <div className="text-6xl mb-4">{type.emoji}</div>
                <h3 className="text-2xl font-bold mb-4">{type.title}</h3>
                <p className="text-dark-400 mb-6">{type.description}</p>
                <ul className="text-left space-y-2 mb-6">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-dark-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/auth/register?role=${type.role}`} className="btn-primary w-full">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-primary-900/50 to-secondary-900/50 border-primary-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build the Future?
            </h2>
            <p className="text-dark-300 mb-8">
              Join thousands of developers, organizations, and investors on HackShield Portal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/hackathons" className="btn-primary text-lg px-8 py-4">
                Browse Hackathons
              </Link>
              <Link href="/auth/register" className="btn-secondary text-lg px-8 py-4">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary-500" />
              <span className="font-bold">HackShield Portal</span>
            </div>
            <div className="text-dark-400 text-sm">
              © 2026 HackShield Portal. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-dark-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href="/terms" className="text-dark-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <Link href="/contact" className="text-dark-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Lock,
    title: 'Lockdown IDE',
    description: 'Fullscreen coding environment with tab switching detection and security enforcement.',
    color: 'bg-red-500/20 text-red-400',
  },
  {
    icon: Brain,
    title: 'Neural Fairness Engine',
    description: 'AI-powered cheat detection, plagiarism scanning, and code originality analysis.',
    color: 'bg-purple-500/20 text-purple-400',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    description: 'Code together with live cursors, team chat, and video conferencing built-in.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: Code2,
    title: 'WebContainer Runtime',
    description: 'Run Node.js, Python, and more directly in the browser. No server required.',
    color: 'bg-green-500/20 text-green-400',
  },
  {
    icon: Trophy,
    title: 'Smart Team Matching',
    description: 'AI-powered algorithm matches you with the perfect teammates based on skills.',
    color: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    icon: Rocket,
    title: 'Project Marketplace',
    description: 'Turn hackathon projects into products with investor and mentor connections.',
    color: 'bg-orange-500/20 text-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Live Leaderboard',
    description: 'Track team progress, code quality, and activity in real-time during events.',
    color: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with developers, organizations, and contributors worldwide.',
    color: 'bg-pink-500/20 text-pink-400',
  },
  {
    icon: Shield,
    title: 'Blockchain Verified',
    description: 'Immutable proof-of-work and NFT certificates for all participants.',
    color: 'bg-indigo-500/20 text-indigo-400',
  },
];

const stats = [
  { value: '10K+', label: 'Hackathons Hosted' },
  { value: '100K+', label: 'Developers' },
  { value: '$5M+', label: 'Prizes Awarded' },
  { value: '500+', label: 'Projects Funded' },
];

const userTypes = [
  {
    emoji: '👨‍💻',
    title: 'Participant',
    description: 'Join hackathons, form teams, and build amazing projects.',
    role: 'participant',
    features: [
      'Browse & join hackathons',
      'Smart team matching',
      'Lockdown IDE access',
      'Portfolio & certificates',
      'Skill marketplace',
    ],
  },
  {
    emoji: '🏢',
    title: 'Organization',
    description: 'Host hackathons with complete management tools.',
    role: 'organization',
    features: [
      'Create & manage events',
      'Real-time monitoring',
      'Neural fairness engine',
      'Judging dashboard',
      'Analytics & reports',
    ],
  },
  {
    emoji: '💼',
    title: 'Contributor',
    description: 'Invest, mentor, or provide services to teams.',
    role: 'contributor',
    features: [
      'Discover projects',
      'Invest in startups',
      'Mentor teams',
      'Hire talent',
      'Smart contracts',
    ],
  },
];
