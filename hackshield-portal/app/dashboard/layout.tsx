'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Code2, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building,
  Briefcase,
  FolderGit2,
  Gavel,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true');
        const data = await res.json();
        if (res.ok && data.notifications) {
          setUnreadCount(data.notifications.length);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (session) {
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const role = session.user?.role;

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/hackathons', icon: Trophy, label: 'Hackathons' },
    ];

    if (role === 'participant') {
      return [
        ...commonItems,
        { href: '/dashboard/teams', icon: Users, label: 'My Teams' },
        { href: '/dashboard/ide', icon: Code2, label: 'IDE' },
        { href: '/dashboard/projects', icon: FolderGit2, label: 'My Projects' },
        { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      ];
    }

    if (role === 'organization') {
      return [
        ...commonItems,
        { href: '/dashboard/manage', icon: Building, label: 'Manage Events' },
        { href: '/dashboard/organization/notifications', icon: Bell, label: 'Notifications' },
        { href: '/dashboard/judging', icon: Gavel, label: 'Judging' },
        { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      ];
    }

    if (role === 'contributor') {
      return [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/projects', icon: FolderGit2, label: 'Discover Projects' },
        { href: '/dashboard/investments', icon: Briefcase, label: 'My Investments' },
        { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
        { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-dark-900 border-r border-dark-800 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-dark-800">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">HackShield</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-dark-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                          : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-dark-800">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-dark-900/80 backdrop-blur-sm border-b border-dark-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications */}
            <Link 
              href="/dashboard/notifications"
              className="relative p-2 text-dark-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{session.user?.name}</div>
                  <div className="text-xs text-dark-400 capitalize">{role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-dark-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-dark-300 hover:bg-dark-700 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-dark-300 hover:bg-dark-700 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-dark-700" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
