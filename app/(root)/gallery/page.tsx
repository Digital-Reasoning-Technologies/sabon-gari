import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Gallery from "@/lib/models/gallery";
import GalleryClient from "./GalleryClient";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const gp = config.galleryPage ?? {};
  return {
    title: gp.metadata?.title ?? `Gallery | ${config.siteName ?? "Kudan"} Local Government`,
    description: gp.metadata?.description,
  };
}

interface GalleryItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  image: string;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function fetchGallery(page: number = 1, limit: number = 12) {
  try {
    await connectDB();
    
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Gallery.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Gallery.countDocuments(),
    ]);
    
    // Map API response to component format
    const mapped = items.map((item: any) => ({
      _id: item._id,
      id: item._id?.toString() || item.slug || String(item._id),
      title: item.title || 'Gallery Image',
      description: item.description || '',
      image: item.image || (item.images && item.images[0]) || '',
      images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
    }));
    
    return {
      gallery: mapped as GalleryItem[],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return { gallery: [], pagination: { total: 0, page: 1, pages: 1, limit } };
  }
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1'));
  const itemsPerPage = 12;
  
  const { gallery, pagination } = await fetchGallery(currentPage, itemsPerPage);
  
  // Redirect if page is out of bounds
  if (currentPage > pagination.pages && pagination.pages > 0) {
    redirect('/gallery?page=1');
  }

  return (
    <GalleryClient 
      gallery={gallery} 
      currentPage={currentPage}
      pagination={pagination}
      itemsPerPage={itemsPerPage}
    />
  );
}
