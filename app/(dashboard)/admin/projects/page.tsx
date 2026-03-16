"use client";

import DashboardWrapper from "@/app/(dashboard)/components/DashboardWrapper";
import ContentManager from "@/app/(dashboard)/components/ContentManager";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const tabConfig = [
    { id: "projects", label: "Projects", icon: FolderKanban, color: "purple" },
  ];

  return (
    <DashboardWrapper
      activeTab="projects"
      setActiveTab={() => {}}
      tabConfig={tabConfig}
    >
      <ContentManager type="projects" title="Projects" />
    </DashboardWrapper>
  );
}

