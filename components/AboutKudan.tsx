"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/contexts/site-config";

export default function AboutKudan() {
  const config = useSiteConfig();
  const about = config.about ?? {};
  const siteName = config.siteName ?? "Kudan";
  const sectionTitle = about.sectionTitle ?? `About ${siteName}`;
  const generalInfoHeading = about.generalInfoHeading ?? "General Information";
  const paragraphs = about.paragraphs ?? [
    `${siteName} Local Government Area is located in Kaduna State.`,
    "The area is home to diverse communities.",
  ];
  const readMoreHref = about.readMoreHref ?? "/about";
  const mapEmbedUrl = about.mapEmbedUrl ?? "";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.5 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-brand-dark mb-4">{sectionTitle}</h2>
          <div className="w-24 h-1 bg-brand mx-auto"></div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-brand-dark mb-4">{generalInfoHeading}</h3>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-gray-700 mb-4">
                {p}
              </p>
            ))}
            <Button asChild className="bg-brand hover:bg-brand-hover text-brand-foreground">
              <Link href={readMoreHref}>
                Read More <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            {mapEmbedUrl ? (
              <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="aspect-video w-full">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                      title="Map"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
