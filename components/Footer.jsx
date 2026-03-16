"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Linkedin, Youtube } from "lucide-react";
import { useSiteConfig } from "@/contexts/site-config";

const iconMap = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
const contactIconMap = { phone: Phone, mail: Mail, mapPin: MapPin };

const SectionHeader = ({ title }) => (
  <h3 className="text-xl font-bold mb-4">{title}</h3>
);

export default function Footer() {
  const config = useSiteConfig();
  const footer = config.footer ?? {};
  const siteName = config.siteName ?? "Kudan";
  const logo = footer.logo;
  const logoAlt = footer.logoAlt ?? `${siteName} LGA Logo`;
  const headquarters = footer.headquarters ?? `Headquarters: ${siteName} Secretariat\nKaduna State, Nigeria`;
  const contactDetails = footer.contact ?? [
    { icon: "phone", text: "+234 7011 404 040" },
    { icon: "mail", text: `General: info@${siteName.toLowerCase()}lga.gov.ng | Support: support@${siteName.toLowerCase()}lga.gov.ng` },
    { icon: "mapPin", text: `${siteName} Secretariat, Kaduna State` },
  ];
  const socialLinks = footer.socialLinks ?? [
    { name: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
    { name: "Twitter", href: "https://x.com/", icon: "twitter" },
    { name: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { name: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { name: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
  ];
  const quickLinks = footer.quickLinks ?? [
    { label: "Home", href: "/" },
    { label: `About ${siteName}`, href: "/about" },
    { label: "Government", href: "/government" },
    { label: "Projects", href: "/projects" },
    { label: "Agriculture", href: "/agriculture" },
    { label: "News & Events", href: "/news" },
  ];
  const copyright = footer.copyright ?? `${siteName} Local Government Area. All rights reserved.`;

  return (
    <footer className="bg-brand-dark text-brand-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            {logo ? (
              <Image
                src={logo}
                alt={logoAlt}
                width={70}
                height={70}
                className="mb-4 bg-white rounded-full"
              />
            ) : (
              <div className="mb-4 text-2xl font-bold bg-white text-brand-dark px-4 py-2 rounded-full">{siteName} LGA</div>
            )}
            <p className="text-sm mb-4 whitespace-pre-line">{headquarters}</p>
          </div>

          <div>
            <SectionHeader title="Contact Us" />
            <ul className="space-y-2">
              {contactDetails.map((detail, index) => {
                const Icon = contactIconMap[detail.icon] || Phone;
                return (
                  <li key={index} className="flex items-center">
                    <Icon size={16} />
                    <span className="ml-2">{detail.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <SectionHeader title="Follow Us" />
            <div className="flex flex-col space-y-3">
              {socialLinks.map((social, index) => {
                const Icon = iconMap[social.icon] || Facebook;
                return (
                  <Link
                    key={index}
                    href={social.href}
                    className="hover:text-brand-muted-foreground transition-colors flex items-center space-x-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                    <span>{social.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader title="Quick Links" />
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-brand-muted-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {copyright}</p>
        </div>
      </div>
    </footer>
  );
}
