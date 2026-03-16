"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Users, LogOut, LayoutDashboard, Newspaper, Images, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfigOptional } from "@/contexts/site-config";

type UserRole = 'user' | 'admin' | 'superadmin';

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabConfig: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
  }>;
}

const DashboardSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  tabConfig,
}: DashboardSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const config = useSiteConfigOptional();
  const adminLabel = config?.dashboard?.adminLabel ?? "Kudan Admin";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.ok && data.data?.role) {
          setUserRole(data.data.role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({
        variant: 'success',
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
      router.replace('/login?logout=success');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout error',
        description: 'An error occurred while logging out.',
      });
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      {/* Desktop Sidebar - Fixed position, never scrolls */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-green-800 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold">{adminLabel}</h1>
          </div>

          <nav className="space-y-2">
            <Link href="/admin">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin') && pathname === '/admin'
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
            </Link>
            <Link href="/admin/news">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/news')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <Newspaper className="h-5 w-5" />
                <span className="font-medium">News</span>
              </button>
            </Link>
            <Link href="/admin/gallery">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/gallery')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <Images className="h-5 w-5" />
                <span className="font-medium">Gallery</span>
              </button>
            </Link>
            <Link href="/admin/projects">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/projects')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <FolderKanban className="h-5 w-5" />
                <span className="font-medium">Projects</span>
              </button>
            </Link>
            {userRole === 'superadmin' && (
              <Link href="/admin/users">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/users')
                      ? "bg-green-700 text-white"
                      : "text-green-100 hover:bg-green-700"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </button>
              </Link>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="h-5 w-5 border-2 border-green-100 border-t-transparent rounded-full animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar - Overlay */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-green-800 text-white transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold">{adminLabel}</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <Link href="/admin">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin') && pathname === '/admin'
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
            </Link>
            <Link href="/admin/news">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/news')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <Newspaper className="h-5 w-5" />
                <span className="font-medium">News</span>
              </button>
            </Link>
            <Link href="/admin/gallery">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/gallery')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <Images className="h-5 w-5" />
                <span className="font-medium">Gallery</span>
              </button>
            </Link>
            <Link href="/admin/projects">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/projects')
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                <FolderKanban className="h-5 w-5" />
                <span className="font-medium">Projects</span>
              </button>
            </Link>
            {userRole === 'superadmin' && (
              <Link href="/admin/users">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/users')
                      ? "bg-green-700 text-white"
                      : "text-green-100 hover:bg-green-700"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </button>
              </Link>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="h-5 w-5 border-2 border-green-100 border-t-transparent rounded-full animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;
