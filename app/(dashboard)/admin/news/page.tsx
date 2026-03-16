"use client";

import DashboardWrapper from "@/app/(dashboard)/components/DashboardWrapper";
import ContentManager from "@/app/(dashboard)/components/ContentManager";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  const tabConfig = [
    { id: "news", label: "News", icon: Newspaper, color: "green" },
  ];

  return (
    <DashboardWrapper
      activeTab="news"
      setActiveTab={() => {}}
      tabConfig={tabConfig}
    >
      <ContentManager type="news" title="News" />
    </DashboardWrapper>
  );
}

