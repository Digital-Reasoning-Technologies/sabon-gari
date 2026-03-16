"use client";

import React, { createContext, useContext } from "react";
import type { SiteConfig } from "@/lib/site-config.types";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function useSiteConfig(): SiteConfig {
  const config = useContext(SiteConfigContext);
  if (!config) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return config;
}

export function useSiteConfigOptional(): SiteConfig | null {
  return useContext(SiteConfigContext);
}

interface SiteConfigProviderProps {
  config: SiteConfig;
  children: React.ReactNode;
}

export function SiteConfigProvider({ config, children }: SiteConfigProviderProps) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}
