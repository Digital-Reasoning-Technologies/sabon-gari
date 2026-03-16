"use client";

import DashboardWrapper from "@/app/(dashboard)/components/DashboardWrapper";
import ContentManager from "@/app/(dashboard)/components/ContentManager";
import { Images } from "lucide-react";

export default function GalleryPage() {
  const tabConfig = [
    { id: "gallery", label: "Gallery", icon: Images, color: "blue" },
  ];

  return (
    <DashboardWrapper
      activeTab="gallery"
      setActiveTab={() => {}}
      tabConfig={tabConfig}
    >
      <ContentManager type="gallery" title="Gallery" />
    </DashboardWrapper>
  );
}

