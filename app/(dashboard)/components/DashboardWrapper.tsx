"use client";

import { useState, ReactNode } from "react";
import DashboardTopbar from "./DashboardTopbar";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardWrapperProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabConfig: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
  }>;
}

const DashboardWrapper = ({
  children,
  activeTab,
  setActiveTab,
  tabConfig,
}: DashboardWrapperProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabConfig={tabConfig}
      />

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <DashboardTopbar
          onMenuClick={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          tabConfig={tabConfig}
        />

        {/* Page content - This has independent scrolling */}
        <main className="flex-1 mt-20 lg:mt-20 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;
