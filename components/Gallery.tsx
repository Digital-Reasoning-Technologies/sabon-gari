"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useSiteConfig } from "@/contexts/site-config";

interface GalleryItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
}

export default function Gallery() {
  const config = useSiteConfig();
  const sectionTitle = config.gallery?.sectionTitle ?? "Our Gallery";
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index within the selected item's images array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true);
        // Fetch fresh data - no cache to ensure updates are visible
        const response = await fetch('/api/public/gallery?limit=3', {
          cache: 'no-store',
        });
        const data = await response.json();
        
        if (data.ok && data.data) {
          // Map API response to component format
          const mapped = data.data.map((item: any) => ({
            _id: item._id,
            id: item._id?.toString() || item.slug || String(item._id),
            title: item.title || 'Gallery Image',
            description: item.description || '',
            image: item.image || (item.images && item.images[0]) || '',
            images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
          }));
          setGalleryData(mapped);
        } else {
          setError('Failed to load gallery');
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to load gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const handleImageOpen = (item: GalleryItem, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
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
    if (galleryData.length === 0) return;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % galleryData.length
      : (currentIndex - 1 + galleryData.length) % galleryData.length;
    
    setSelectedImage(galleryData[newIndex]);
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

  return (
    <div className="py-16 bg-brand-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-brand-dark mb-4"
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

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">
            <p>{error}</p>
          </div>
        ) : galleryData.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p>No gallery images available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 py-8 sm:py-12 md:py-16">
            {galleryData.map((item, index) => (
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
                alt={item.title}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn color="white" size={24} className="sm:w-8 sm:h-8"/>
              </div>
            </motion.div>
            ))}
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
                <div className="relative p-3 bg-gradient-to-r from-brand-muted to-white border-b">
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
                        <h2 className="text-lg md:text-xl font-bold text-brand-dark truncate">
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
                              ? "border-brand scale-105 shadow-md"
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

        {/* View More Button */}
        <div className="flex justify-center mt-12">
          <Link href="/gallery">
            <Button className="bg-brand hover:bg-brand-hover text-brand-foreground">
              View More Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}