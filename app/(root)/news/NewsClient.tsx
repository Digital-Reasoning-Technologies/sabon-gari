"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/contexts/site-config";

interface NewsData {
  _id?: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  images: string[];
}

interface NewsClientProps {
  news: NewsData[];
  currentPage: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  itemsPerPage: number;
}

export default function NewsClient({ news, currentPage, pagination, itemsPerPage }: NewsClientProps) {
  const router = useRouter();
  const config = useSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const hero = config.newsPage?.hero ?? {
    title: "Latest News",
    subtitle: `Stay updated with the latest news, announcements, and upcoming events from ${siteName} Local Government.`,
    image: "/news/newsHero.png",
  };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.pages;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    router.push(`/news?page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, pagination.total);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={hero.title || "News"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{hero.title}</h1>
          {hero.subtitle && <p className="text-xl max-w-3xl">{hero.subtitle}</p>}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">Latest News</h2>
          
          {news.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p>No news available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {news.map((newsItem: NewsData) => (
                  <Card key={newsItem.slug || newsItem._id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-brand-dark text-sm sm:text-base md:text-lg line-clamp-2">{newsItem.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{newsItem.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-3 sm:p-4 md:p-6 pt-0">
                      {newsItem.images && newsItem.images.length > 0 && (
                        <Image 
                          src={newsItem.images[0]} 
                          alt={newsItem.title}
                          width={400}
                          height={300}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-md mb-2 sm:mb-3 md:mb-4"
                        />
                      )}
                      <p className="text-gray-700 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base line-clamp-3">{newsItem.description}</p>
                    </CardContent>
                    <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
                      <Button variant="outline" className="w-full text-green-700 border-green-700 hover:bg-green-700 hover:text-white text-xs sm:text-sm md:text-base py-1.5 sm:py-2" asChild>
                        <Link href={`/news/${newsItem.slug}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => {
                        if (page === 'ellipsis') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            variant={currentPage === page ? "default" : "outline"}
                            className={`min-w-[40px] ${
                              currentPage === page
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "hover:bg-green-50"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      variant="outline"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={20} />
                    </Button>
                  </div>

                  {/* Page Info */}
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} - {endIndex} of {pagination.total} news articles
                  </p>
                </div>
              )}

              {/* Back Button */}
              <div className="flex justify-center mt-12">
                <Button 
                  variant="outline"
                  className="px-6 py-3 bg-green-700 text-white hover:bg-green-800 transition flex items-center gap-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft size={20} /> Back
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

