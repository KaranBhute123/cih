'use client';

import { useSession } from 'next-auth/react';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';
import ContributorDashboard from '@/components/dashboard/ContributorDashboard';

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === 'participant') {
    return <ParticipantDashboard />;
  }

  if (role === 'organization') {
    return <OrganizationDashboard />;
  }

  if (role === 'contributor') {
    return <ContributorDashboard />;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to HackShield</h1>
        <p className="text-dark-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
