'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { 
  BarChart3, 
  Trophy, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Code2,
  DollarSign,
  Globe,
  Award,
  Clock,
  Target,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('30d');

  const metrics: MetricCard[] = [
    { title: 'Total Hackathons', value: 12, change: 33.3, icon: Trophy, color: 'primary' },
    { title: 'Total Participants', value: '2,847', change: 28.5, icon: Users, color: 'green' },
    { title: 'Submissions', value: 456, change: 15.2, icon: Code2, color: 'purple' },
    { title: 'Prize Pool Distributed', value: '$125,000', change: 45.0, icon: DollarSign, color: 'yellow' }
  ];

  const hackathonPerformance = [
    { name: 'GreenTech Innovation 2024', participants: 345, submissions: 89, avgScore: 7.8 },
    { name: 'Web3 Summit Hackathon', participants: 278, submissions: 65, avgScore: 8.2 },
    { name: 'AI for Good Challenge', participants: 512, submissions: 124, avgScore: 7.5 },
    { name: 'HealthTech Revolution', participants: 189, submissions: 48, avgScore: 8.0 },
    { name: 'FinTech Frontier 2024', participants: 423, submissions: 98, avgScore: 7.9 }
  ];

  const geographicData = [
    { country: 'United States', participants: 856, percentage: 30.1 },
    { country: 'India', participants: 623, percentage: 21.9 },
    { country: 'Germany', participants: 312, percentage: 11.0 },
    { country: 'United Kingdom', participants: 278, percentage: 9.8 },
    { country: 'Canada', participants: 234, percentage: 8.2 },
    { country: 'Others', participants: 544, percentage: 19.0 }
  ];

  const techStackPopularity = [
    { tech: 'React/Next.js', percentage: 45 },
    { tech: 'Python/ML', percentage: 38 },
    { tech: 'Node.js', percentage: 32 },
    { tech: 'TypeScript', percentage: 28 },
    { tech: 'Blockchain/Web3', percentage: 22 },
    { tech: 'Flutter/Mobile', percentage: 18 }
  ];

  const participantActivity = [
    { hour: '00:00', active: 45 },
    { hour: '04:00', active: 23 },
    { hour: '08:00', active: 156 },
    { hour: '12:00', active: 234 },
    { hour: '16:00', active: 312 },
    { hour: '20:00', active: 278 },
    { hour: '24:00', active: 189 }
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'bg-primary-500/20 text-primary-400',
      green: 'bg-green-500/20 text-green-400',
      purple: 'bg-purple-500/20 text-purple-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/20 text-blue-400',
      red: 'bg-red-500/20 text-red-400'
    };
    return colors[color] || colors.primary;
  };

  if (session?.user?.role !== 'organization') {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-dark-400">Only organizations can access analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            Analytics Dashboard
          </h1>
          <p className="text-dark-400 mt-1">Track your hackathon performance and insights</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {range === '7d' ? 'Week' : range === '30d' ? 'Month' : range === '90d' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="card">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${getColorClass(metric.color)}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{metric.value}</div>
              <div className="text-sm text-dark-400">{metric.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hackathon Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-400" />
            Hackathon Performance
          </h3>
          <div className="space-y-4">
            {hackathonPerformance.map((hackathon, index) => (
              <div key={hackathon.name} className="flex items-center gap-4">
                <div className="w-8 text-center text-dark-400 font-medium">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">{hackathon.name}</div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                      style={{ width: `${(hackathon.participants / 600) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{hackathon.participants}</div>
                  <div className="text-xs text-dark-400">participants</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-400" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {geographicData.map((data) => (
              <div key={data.country} className="flex items-center gap-4">
                <div className="w-32 text-sm">{data.country}</div>
                <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm">
                  <span className="font-medium">{data.participants}</span>
                  <span className="text-dark-400 ml-1">({data.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tech Stack Popularity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary-400" />
            Popular Tech Stacks
          </h3>
          <div className="space-y-4">
            {techStackPopularity.map((tech) => (
              <div key={tech.tech}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{tech.tech}</span>
                  <span className="text-dark-400">{tech.percentage}%</span>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${tech.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Key Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Avg. Hackathon Duration</span>
              </div>
              <span className="font-bold">48 hrs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-sm">Avg. Team Size</span>
              </div>
              <span className="font-bold">3.8</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Submission Rate</span>
              </div>
              <span className="font-bold">68%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">Avg. Score</span>
              </div>
              <span className="font-bold">7.8/10</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                <span className="text-sm">Return Participants</span>
              </div>
              <span className="font-bold">42%</span>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Peak Activity Hours
          </h3>
          <div className="space-y-3">
            {participantActivity.map((data) => (
              <div key={data.hour} className="flex items-center gap-3">
                <div className="w-12 text-sm text-dark-400">{data.hour}</div>
                <div className="flex-1 h-6 bg-dark-800 rounded overflow-hidden">
                  <div 
                    className={`h-full rounded ${
                      data.active > 250 
                        ? 'bg-green-500' 
                        : data.active > 150 
                        ? 'bg-yellow-500' 
                        : data.active > 100 
                        ? 'bg-orange-500' 
                        : 'bg-dark-600'
                    }`}
                    style={{ width: `${(data.active / 350) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium">{data.active}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-dark-600 rounded"></span> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-500 rounded"></span> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span> Peak
            </span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary-400" />
          AI-Generated Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Growth Opportunity</span>
            </div>
            <p className="text-sm text-dark-300">
              Participants from India increased by 45% this quarter. Consider hosting timezone-friendly events.
            </p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">Engagement Alert</span>
            </div>
            <p className="text-sm text-dark-300">
              Submission rates drop by 22% in the last 6 hours. Consider deadline reminders and support.
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Code2 className="w-5 h-5" />
              <span className="font-medium">Tech Trend</span>
            </div>
            <p className="text-sm text-dark-300">
              AI/ML projects increased by 60%. Consider adding specialized AI-focused hackathon tracks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
