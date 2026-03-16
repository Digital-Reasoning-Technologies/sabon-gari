"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/contexts/site-config";

export default function Chairman() {
  const config = useSiteConfig();
  const chairman = config.chairman ?? {};
  const sectionTitle = chairman.sectionTitle ?? "Message from the Chairman";
  const name = chairman.name ?? "Hon. Dauda Ilya Abba";
  const image = chairman.image ?? "/chairman.png";
  const messageParagraphs = chairman.messageParagraphs ?? [
    "I warmly welcome you to explore our community's rich heritage and promising future.",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.5 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <div className="py-16 bg-brand-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          <motion.div className="order-1 md:order-1" variants={itemVariants}>
            <Image
              src={image}
              alt={`${name} - Chairman`}
              width={350}
              height={200}
              className="rounded-lg shadow-lg mx-auto hover:shadow-2xl transition-shadow duration-300 w-full object-cover"
            />
          </motion.div>

          <motion.div className="order-2 md:order-2" variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-brand-dark mb-4">{name}</h3>
            {messageParagraphs.map((p, i) => (
              <p key={i} className="text-gray-700 mb-4">
                {p}
              </p>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
