import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import News from "@/lib/models/news";
import NewsClient from "./NewsClient";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  return {
    title: `News | ${config.metadata?.title ?? siteName + " Local Government"}`,
    description: config.metadata?.description,
  };
}

interface NewsData {
  _id?: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  images: string[];
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function fetchNews(page: number = 1, limit: number = 6) {
  try {
    await connectDB();
    
    const skip = (page - 1) * limit;
    const [news, total] = await Promise.all([
      News.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      News.countDocuments(),
    ]);
    
    return {
      news: news as unknown as NewsData[],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { news: [], pagination: { total: 0, page: 1, pages: 1, limit } };
  }
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1'));
  const itemsPerPage = 6;
  
  const { news, pagination } = await fetchNews(currentPage, itemsPerPage);
  
  // Redirect if page is out of bounds
  if (currentPage > pagination.pages && pagination.pages > 0) {
    redirect('/news?page=1');
  }

  return (
    <NewsClient 
      news={news} 
      currentPage={currentPage}
      pagination={pagination}
      itemsPerPage={itemsPerPage}
    />
  );
}