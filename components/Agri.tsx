"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/contexts/site-config";

export default function Agri() {
  const config = useSiteConfig();
  const agri = config.agriculture ?? {};
  const siteName = config.siteName ?? "Kudan";
  const sectionTitle = agri.sectionTitle ?? "Agriculture - Farming is our Pride";
  const cards = agri.cards ?? [
    { title: "Potatoes", subtitle: "High-quality produce", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: `${siteName}'s farmers are celebrated for producing high-quality potatoes.` },
    { title: "Grapes", subtitle: "Gaining recognition", image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "We account for approximately 85% of Nigeria's grape production." },
    { title: "Other Crops", subtitle: "Diverse products", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Cabbage, carrots, and tomatoes contribute to agricultural diversity." },
  ];
  const learnMoreText = agri.learnMoreText ?? "Learn More About Our Agriculture";
  const learnMoreHref = agri.learnMoreHref ?? "/agriculture";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="py-16 bg-white">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: i * 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-brand-dark">{card.title}</CardTitle>
                  {card.subtitle && <CardDescription>{card.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      unoptimized
                    />
                  )}
                  <p className="text-gray-700">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-10"
        >
          <Button asChild className="bg-brand hover:bg-brand-hover text-brand-foreground">
            <Link href={learnMoreHref}>{learnMoreText}</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
