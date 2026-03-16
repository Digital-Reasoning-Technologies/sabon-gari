"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Newspaper, Images, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardWrapper from "@/app/(dashboard)/components/DashboardWrapper";
import DashboardPageContent from "@/app/(dashboard)/components/DashboardPageContent";

type ContentType = "dashboard" | "news" | "gallery" | "projects";

const VALID_TABS: ContentType[] = ["dashboard", "news", "gallery", "projects"];

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const tabFromUrl = searchParams.get("tab") as ContentType | null;
  
  // Validate and set initial tab from URL, default to "dashboard"
  const initialTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) 
    ? tabFromUrl 
    : "dashboard";
  
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab);

  // Check for login success message
  useEffect(() => {
    const loginSuccess = searchParams.get('login');
    if (loginSuccess === 'success') {
      toast({
        variant: 'success',
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      // Clean up URL by removing the login parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('login');
      const newUrl = params.toString() ? `/admin?${params.toString()}` : '/admin';
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, toast, router]);

  // Update URL when tab changes (without page reload)
  const handleTabChange = (tab: string) => {
    const validTab = VALID_TABS.includes(tab as ContentType) ? (tab as ContentType) : "dashboard";
    setActiveTab(validTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", validTab);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL on mount or when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as ContentType | null;
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const tabConfig = [
    { id: "dashboard" as ContentType, label: "Dashboard", icon: LayoutDashboard, color: "indigo" },
    { id: "news" as ContentType, label: "News", icon: Newspaper, color: "green" },
    { id: "gallery" as ContentType, label: "Gallery", icon: Images, color: "blue" },
    { id: "projects" as ContentType, label: "Projects", icon: FolderKanban, color: "purple" },
  ];

  return (
    <DashboardWrapper
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      tabConfig={tabConfig}
    >
      <DashboardPageContent activeTab={activeTab} tabConfig={tabConfig} />
    </DashboardWrapper>
  );
}