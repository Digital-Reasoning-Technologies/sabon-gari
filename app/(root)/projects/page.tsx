import type { Metadata } from 'next';
import { connectDB } from "@/lib/mongodb";
import Project from "@/lib/models/project";
import ProjectsClient from "./ProjectsClient";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const pp = config.projectsPage ?? {};
  return {
    title: pp.metadata?.title ?? `Projects | ${config.siteName ?? "Kudan"} Local Government`,
    description: pp.metadata?.description ?? "Discover ongoing and completed projects.",
  };
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

interface ProjectData {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  status?: string;
  location?: string;
  date?: string;
}

async function fetchProjects() {
  try {
    await connectDB();
    
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    // Map API response to component format
    const mapped = projects.map((item: any) => ({
      _id: item._id,
      id: item._id?.toString() || item.slug || String(item._id),
      title: item.title,
      description: item.description,
      image: item.image || (item.images && item.images[0]) || '',
      images: item.images || (item.image ? [item.image] : []),
      status: item.status || 'Completed',
      location: item.location,
      date: item.date || item.createdAt ? new Date(item.createdAt).toLocaleDateString() : undefined,
    }));
    
    return mapped as ProjectData[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  return <ProjectsClient projects={projects} />;
}
