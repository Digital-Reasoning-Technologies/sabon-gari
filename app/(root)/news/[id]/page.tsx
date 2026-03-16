import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import News from '@/lib/models/news';
import { getSiteConfig } from '@/lib/site-config';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchNewsBySlug(slug: string) {
  try {
    await connectDB();
    const news = await News.findOne({ slug }).lean().exec();
    return news as any;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const siteTitle = config.metadata?.title ?? `${siteName} Local Government`;
  const news = await fetchNewsBySlug(id);

  if (!news) {
    return { title: `News Not Found | ${siteTitle}` };
  }

  return {
    title: `${news.title} | ${siteTitle}`,
    description: news.description ?? `Read latest news from ${siteTitle}`,
  };
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const news = await News.find().select('slug').lean().exec();
    return news.map((item: any) => ({
      id: item.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function NewsDetail({ params }: PageProps) {
  const { id } = await params;
  const news = await fetchNewsBySlug(id);

  if (!news) {
    notFound();
  }

  return (
    <article className="py bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-10 mb-8">
          <h1 className="text-4xl font-serif font-medium text-gray-900 mb-4 text-center">
            {news.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{news.date}</span>
            </div>
          </div>
        </header>

        {news.images && news.images.length > 0 && (
          <div className="relative w-full h-[400px] mb-12">
            <Image
              src={news.images[0]}
              alt={news.title}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        <div className="py-3 prose prose-lg max-w-none">
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {news.content || news.description}
          </div>
        </div>
      </div>
    </article>
  );
}
