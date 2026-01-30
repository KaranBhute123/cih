'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, Activity, UserPlus, Trophy, TrendingUp, Eye, DollarSign } from 'lucide-react';

export default function OrganizationDashboard() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'View Registrations',
      description: 'See all participants registered for your hackathons',
      icon: UserPlus,
      color: 'bg-blue-500',
      href: '/dashboard/organization/registrations',
    },
    {
      title: 'Monitor Activity',
      description: 'Real-time monitoring of participant activities',
      icon: Activity,
      color: 'bg-green-500',
      href: '/dashboard/organization/monitoring',
    },
    {
      title: 'Manage Hackathons',
      description: 'Create and manage your hackathons',
      icon: Calendar,
      color: 'bg-purple-500',
      href: '/dashboard/hackathons/manage',
    },
    {
      title: 'View Analytics',
      description: 'Insights and analytics for your events',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      href: '/dashboard/organization/analytics',
    },
  ];

  const stats = [
    {
      label: 'Total Registrations',
      value: '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Active Hackathons',
      value: '0',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Total Prize Pool',
      value: '$0',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Total Views',
      value: '0',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Organization Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your hackathons and view participant registrations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all group text-left"
              >
                <div
                  className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">
              Activity will appear here when participants register for your hackathons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
