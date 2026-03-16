"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSiteConfig } from "@/contexts/site-config";

interface NewsData {
  _id?: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  images: string[];
}

export default function News() {
  const config = useSiteConfig();
  const sectionTitle = config.news?.sectionTitle && config.news?.subtitle
    ? `${config.news.sectionTitle} - ${config.news.subtitle}`
    : (config.news?.sectionTitle ?? "Latest News - Stay in Touch with Us");
  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // Fetch fresh data - no cache to ensure updates are visible
        const response = await fetch('/api/public/news?limit=3', {
          cache: 'no-store',
        });
        const data = await response.json();
        
        if (data.ok && data.data) {
          setNewsData(data.data);
        } else {
          setError('Failed to load news');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="py-16 bg-brand-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-dark mb-4 break-words overflow-wrap-anywhere"
          >
            {sectionTitle}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-1 bg-brand mx-auto"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">
            <p>{error}</p>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p>No news available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
            {newsData.map((news) => (
            <Card key={news.slug} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-brand-dark">{news.title}</CardTitle>
                  <CardDescription>{news.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                {news.images && news.images.length > 0 && (
                  <Image 
                    src={news.images[0]} 
                    alt={news.title}
                    width={400}
                    height={300}
                    className="w-86 h-40 object-cover rounded-md mb-4"
                  />
                )}
                  <p className="text-gray-700 mb-4">{news.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-brand-dark border-brand hover:bg-brand hover:text-brand-foreground" asChild>
                    <Link href={`/news/${news.slug}`}>
                      Read More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

          <div className="flex justify-center mt-12">
            <Link href="/news">
              <button className="px-6 py-3 bg-brand text-brand-foreground rounded-lg hover:bg-brand-hover transition">
                View More News
              </button>
            </Link>
          </div>
        </div>
      </div>
  );
}
