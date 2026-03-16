"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface DashboardTopbarProps {
  onMenuClick: () => void;
  activeTab: string;
  tabConfig?: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
  }>;
}

const DashboardTopbar = ({
  onMenuClick,
  activeTab,
  tabConfig = [],
}: DashboardTopbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const currentTab = tabConfig.find((t) => t.id === activeTab);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const getPageTitle = () => {
    if (pathname === '/admin/news') return 'News';
    if (pathname === '/admin/gallery') return 'Gallery';
    if (pathname === '/admin/projects') return 'Projects';
    if (pathname === '/admin/users') return 'Users';
    return currentTab?.label || "Dashboard";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.ok && data.data?.email) {
          setUserEmail(data.data.email);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 lg:left-64">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-green-800">
            {getPageTitle()} Management
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg p-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-semibold">
                    {isLoadingUser ? 'A' : userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {isLoadingUser ? 'Loading...' : userEmail}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isLoadingUser ? 'Loading...' : userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
