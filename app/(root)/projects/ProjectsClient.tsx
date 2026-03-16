"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, X, ChevronLeft, ChevronRight, Images, Calendar } from "lucide-react";
import { useSiteConfig } from "@/contexts/site-config";

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

interface ProjectsClientProps {
  projects: ProjectData[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const config = useSiteConfig();
  const pp = config.projectsPage ?? {};
  const hero = pp.hero ?? { title: "Projects", subtitle: "Building a Better Community Together - Explore our infrastructure development initiatives.", image: "/bg1.png" };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const introParagraph = pp.introParagraph ?? "We believe in transparency and community engagement. This page showcases our completed and ongoing infrastructure projects.";
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleProjectClick = (project: ProjectData) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images!.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Projects"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{hero.title}</h1>
          <p className="text-xl max-w-3xl">{hero.subtitle}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-700 text-lg">{introParagraph}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">Recent Infrastructure Projects</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p>No projects available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {projects.map((project: ProjectData) => (
                  <Card 
                    key={project.id || project._id} 
                    className="hover:shadow-lg transition-shadow overflow-hidden cursor-pointer h-full flex flex-col"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="relative h-40 sm:h-48 md:h-56 w-full group aspect-square">
                      <Image 
                        src={project.image || "/bg4.jpg"} 
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <Badge className="bg-brand text-white flex items-center gap-1 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                          <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="text-xs sm:text-sm">{project.status || "Completed"}</span>
                        </Badge>
                      </div>
                      {/* View Images Icon Overlay */}
                      {project.images && project.images.length > 1 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col items-center gap-1 sm:gap-2 text-white">
                            <Images size={20} className="sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-sm md:text-base font-semibold text-center px-2">
                              View {project.images.length} Images
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-brand-dark text-sm sm:text-base md:text-lg lg:text-xl line-clamp-2">{project.title}</CardTitle>
                      {project.location && (
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 mt-1 sm:mt-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm line-clamp-1">{project.location}</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0 flex-grow">
                      <p className="text-gray-700 text-xs sm:text-sm md:text-base line-clamp-3">{project.description}</p>
                      {project.images && project.images.length > 1 && (
                        <div className="mt-2 sm:mt-4 flex items-center gap-1 sm:gap-2 text-brand">
                          <Images size={12} className="sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {project.images.length} images
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                              <Badge className="bg-brand text-white flex items-center gap-1 text-xs px-2 py-0.5">
                                <CheckCircle2 className="h-3 w-3" />
                                {selectedProject.status}
                              </Badge>
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}

