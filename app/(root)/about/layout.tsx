import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  return {
    title: `About ${siteName} | ${config.metadata?.title ?? siteName + " Local Government"}`,
    description: config.aboutPage?.hero?.subtitle ?? config.metadata?.description,
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
