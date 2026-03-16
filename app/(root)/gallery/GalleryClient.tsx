"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/contexts/site-config";

interface GalleryItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
}

interface GalleryClientProps {
  gallery: GalleryItem[];
  currentPage: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  itemsPerPage: number;
}

export default function GalleryClient({ gallery, currentPage, pagination, itemsPerPage }: GalleryClientProps) {
  const config = useSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const hero = config.galleryPage?.hero ?? {
    title: `Discover the Art of ${siteName}`,
    subtitle: `A visual journey through the moments, stories, and creativity that shape the ${siteName} Local Government experience.`,
    image: "/bg1.png",
  };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index within the selected item's images array

  const handleImageOpen = (item: GalleryItem, index: number) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setSelectedImage({ ...item, title: item.title || `Image ${actualIndex + 1}` });
    setCurrentIndex(actualIndex);
    setCurrentImageIndex(0); // Reset to first image of the selected item
  };

  // Get all images for the selected item
  const getSelectedItemImages = (): string[] => {
    if (!selectedImage) return [];
    return selectedImage.images && selectedImage.images.length > 0 
      ? selectedImage.images 
      : [selectedImage.image];
  };

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (gallery.length === 0) return;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % gallery.length
      : (currentIndex - 1 + gallery.length) % gallery.length;

    const newSelectedImage = {
      ...gallery[newIndex],
      title: gallery[newIndex].title || `Image ${newIndex + 1}`
    };

    setSelectedImage(newSelectedImage);
    setCurrentIndex(newIndex);
    setCurrentImageIndex(0); // Reset to first image of the new item
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    const images = getSelectedItemImages();
    if (images.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handlePageChange = (page: number) => {
    window.location.href = `/gallery?page=${page}`;
  };

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, pagination.total);

  return (
    <div className="bg-white">
      <section className="relative h-[40vh] flex items-center mb-10 mt-0">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={hero.title || "Gallery"}
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-green-800 mb-4"
          >
            Our Gallery
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-1 bg-green-600 mx-auto"
          ></motion.div>
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p>No gallery images available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 py-8 sm:py-12 md:py-16">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="group relative overflow-hidden rounded-lg cursor-pointer aspect-square"
                  onClick={() => handleImageOpen(item, index)}
                >
                  <Image
                    src={item.image}
                    alt={item.description || item.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={24} className="sm:w-8 sm:h-8" style={{ color: 'white' }} />
                  </div>
                </motion.div>
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
                  Showing {startIndex + 1} - {endIndex} of {pagination.total} images
                </p>
              </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (() => {
              const images = getSelectedItemImages();
              const hasMultipleImages = images.length > 1;
              
              return (
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
                  onClick={() => {
                    setSelectedImage(null);
                    setCurrentImageIndex(0);
                  }}
                >
                  <div 
                    className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Compact Header with All Info */}
                    <div className="relative p-3 bg-gradient-to-r from-green-50 to-white border-b">
                      {/* Close Button - Inside Header */}
                      <Button
                        onClick={() => {
                          setSelectedImage(null);
                          setCurrentImageIndex(0);
                        }}
                        className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 sm:p-2.5 shadow-lg transition-all hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center"
                        variant="ghost"
                        size="icon"
                        aria-label="Close modal"
                      >
                        <X size={20} className="sm:w-6 sm:h-6" />
                      </Button>
                      
                      <div className="flex flex-col gap-2 pr-12">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg md:text-xl font-bold text-green-800 truncate">
                              {selectedImage.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {selectedImage.description}
                            </p>
                          </div>
                          {hasMultipleImages && (
                            <div className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {images.length} images
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Navigation - At Top */}
                    {hasMultipleImages && (
                      <div className="p-2 bg-gray-50 border-b">
                        <div className="flex gap-1.5 overflow-x-auto justify-center scrollbar-hide">
                          {images.map((img: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                                currentImageIndex === idx
                                  ? "border-green-600 scale-105 shadow-md"
                                  : "border-gray-300 opacity-70 hover:opacity-100 hover:border-gray-400"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Large Image Container - Takes Most Space */}
                    <div className="relative flex-1 bg-transparent flex items-center justify-center min-h-0 p-2 overflow-hidden">
                      <Image
                        src={images[currentImageIndex]}
                        alt={`${selectedImage.title} - Image ${currentImageIndex + 1}`}
                        width={1400}
                        height={1000}
                        className="max-w-[95%] max-h-full w-auto h-[26rem] object-contain rounded-lg shadow-lg"
                      />

                      {/* Navigation Arrows for images within item (shown when multiple images) */}
                      {hasMultipleImages && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNavigation('prev');
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-all z-10"
                            variant="ghost"
                            size="icon"
                          >
                            <ChevronLeft size={24} />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNavigation('next');
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-all z-10"
                            variant="ghost"
                            size="icon"
                          >
                            <ChevronRight size={24} />
                          </Button>
                        </>
                      )}

                      {/* Navigation Arrows for gallery items (shown when single image or at boundaries) */}
                      {(!hasMultipleImages || currentImageIndex === 0) && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('prev');
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-0 transition-all"
                          variant="ghost"
                          size="icon"
                        >
                          <ChevronLeft size={32} />
                        </Button>
                      )}
                      {(!hasMultipleImages || currentImageIndex === images.length - 1) && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('next');
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-0 transition-all"
                          variant="ghost"
                          size="icon"
                        >
                          <ChevronRight size={32} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

