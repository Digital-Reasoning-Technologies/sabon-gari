"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images, Loader2, Calendar, CheckCircle2, MapPin } from "lucide-react";
import { useSiteConfig } from "@/contexts/site-config";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

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

export default function Project() {
  const config = useSiteConfig();
  const sectionTitle = config.projects?.sectionTitle ?? "Projects";
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Fetch fresh data - no cache to ensure updates are visible
        const response = await fetch('/api/public/projects?limit=3', {
          cache: 'no-store',
        });
        const data = await response.json();
        
        if (data.ok && data.data) {
          const mapped = data.data.map((item: any) => ({
            _id: item._id,
            id: item._id?.toString() || item.slug || String(item._id),
            title: item.title,
            description: item.description,
            image: item.image || (item.images && item.images[0]) || '',
            images: item.images || (item.image ? [item.image] : []),
            status: item.status,
            location: item.location,
            date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : undefined),
          }));
          setProjects(mapped);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProject && selectedProject.images) {
      const imagesLength = selectedProject.images.length;
      setCurrentImageIndex((prev) => 
        prev === imagesLength - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProject && selectedProject.images) {
      const imagesLength = selectedProject.images.length;
      setCurrentImageIndex((prev) => 
        prev === 0 ? imagesLength - 1 : prev - 1
      );
    }
  };
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" variants={cardVariants}>
          <h2 className="text-3xl font-bold text-brand-dark mb-4">{sectionTitle}</h2>
          <div className="w-24 h-1 bg-brand mx-auto" />
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p>No projects available at the moment.</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6" initial="hidden" whileInView="visible" variants={cardVariants}>
            {projects.map((project: ProjectData, index: number) => (
            <motion.div 
              key={index} 
              className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-square" 
              variants={cardVariants}
              onClick={() => handleProjectClick(project)}
            >
              <Image 
                src={project.image} 
                alt={project.title} 
                width={400} 
                height={400} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2 sm:p-3 md:p-4 text-white transition-all duration-300 group-hover:backdrop-blur-sm">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-1 line-clamp-2">{project.title}</h3>
                {project.status && (
                  <p className="text-xs font-semibold text-brand-muted-foreground">✓ {project.status}</p>
                )}
                {project.images && project.images.length > 1 && (
                  <div className="flex items-center gap-1 text-white mt-1 sm:mt-1.5">
                    <Images size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: 'white' }} />
                    <span className="text-xs">{project.images.length} images</span>
                  </div>
                )}
              </div>
            </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Project Modal */}
        {selectedProject && selectedProject.images && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
            onClick={handleCloseModal}
          >
            <div 
              className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact Header with All Info */}
              <div className="relative p-3 bg-gradient-to-r from-brand-muted to-white border-b">
                {/* Close Button - Inside Header */}
                <Button
                  onClick={handleCloseModal}
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
                        {selectedProject.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {selectedProject.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {selectedProject.date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 text-brand" />
                          <span>{selectedProject.date}</span>
                        </div>
                      )}
                      {selectedProject.status && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand text-brand-foreground rounded-full text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {selectedProject.status}
                        </div>
                      )}
                      {selectedProject.images.length > 1 && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {selectedProject.images.length} images
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedProject.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 text-brand" />
                      <span>{selectedProject.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation - At Top */}
              {selectedProject.images.length > 1 && (
                <div className="p-2 bg-gray-50 border-b">
                  <div className="flex gap-1.5 overflow-x-auto justify-center scrollbar-hide">
                    {selectedProject.images.map((img: string, idx: number) => (
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
                  src={selectedProject.images[currentImageIndex]}
                  alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                  width={1400}
                  height={1000}
                  className="max-w-[95%] max-h-full w-auto h-[26rem] object-contain rounded-lg shadow-lg"
                />

                {/* Navigation Arrows */}
                {selectedProject.images.length > 1 && (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
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
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 transition-all z-10"
                      variant="ghost"
                      size="icon"
                    >
                      <ChevronRight size={24} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View All Button */}
        <motion.div className="text-center mt-10" initial="hidden" whileInView="visible" variants={cardVariants}>
          <Button asChild className="bg-brand hover:bg-brand-hover text-brand-foreground">
            <Link href="/projects">View All Projects</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}