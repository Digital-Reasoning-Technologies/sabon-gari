/**
 * Site config types for multi-LGA support.
 * All content and theme can be overridden per deployment via JSON config.
 */

export interface ThemeColors {
  brand?: string; // HSL e.g. "142 76% 36%"
  brandHover?: string;
  brandDark?: string;
  brandMuted?: string;
  brandForeground?: string;
  brandMutedForeground?: string;
}

export interface NavLink {
  name: string;
  href: string;
}

export interface NavbarConfig {
  logo?: string; // path or URL, e.g. "/logo.png"
  logoAlt?: string;
  navLinks?: NavLink[];
  contactButtonLabel?: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  image: string; // path or URL
}

export interface HeroConfig {
  slides?: HeroSlide[];
}

export interface AboutSectionConfig {
  sectionTitle?: string;
  generalInfoHeading?: string;
  paragraphs?: string[];
  readMoreHref?: string;
  mapEmbedUrl?: string;
}

export interface ChairmanConfig {
  sectionTitle?: string;
  name?: string;
  image?: string; // path or URL
  messageParagraphs?: string[];
}

export interface AgricultureCard {
  title: string;
  description: string;
  image?: string;
  subtitle?: string;
}

export interface AgricultureSectionConfig {
  sectionTitle?: string;
  sectionImage?: string;
  cards?: AgricultureCard[];
  learnMoreText?: string;
  learnMoreHref?: string;
}

export interface NewsSectionConfig {
  sectionTitle?: string;
  subtitle?: string;
}

export interface ProjectsSectionConfig {
  sectionTitle?: string;
}

export interface GallerySectionConfig {
  sectionTitle?: string;
}

export interface ContactDetail {
  icon: string; // "phone" | "mail" | "mapPin"
  text: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string; // "facebook" | "twitter" | "instagram" | "linkedin" | "youtube"
}

export interface QuickLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  logo?: string;
  logoAlt?: string;
  headquarters?: string;
  contact?: ContactDetail[];
  socialLinks?: SocialLink[];
  quickLinks?: QuickLink[];
  copyright?: string;
}

export interface AboutPageTab {
  general?: { leadership?: string[]; location?: string[]; demographics?: string[]; economy?: string[] };
  history?: { paragraphs?: string[] };
  culture?: { paragraphs?: string[]; tribes?: string[]; languages?: string[] };
}

export interface AboutPageConfig {
  hero?: { title?: string; subtitle?: string; image?: string };
  tabs?: AboutPageTab;
  geographyEconomy?: { title?: string; location?: string; climate?: string; mainActivities?: string[] };
  imagePaths?: Record<string, string>;
}

export interface LeadershipItem {
  name: string;
  title: string;
  image?: string;
}

export interface ElectoralWard {
  ward: string;
  councillor: string;
  image: string;
  position?: string;
}

export interface GovernmentPageConfig {
  hero?: { title?: string; subtitle?: string; image?: string };
  structure?: { intro?: string; executive?: string[]; legislative?: string[]; departments?: string[] };
  leadership?: LeadershipItem[];
  electoralWards?: ElectoralWard[];
  traditionalInstitution?: {
    sectionTitle?: string;
    emirateHeading?: string;
    districtsHeading?: string;
    roleHeading?: string;
    intro?: string;
    chiefdoms?: string[];
    role?: string;
  };
}

export interface ProjectsPageConfig {
  metadata?: { title?: string; description?: string };
  hero?: { title?: string; subtitle?: string; image?: string };
  introParagraph?: string;
}

export interface AgriculturePageConfig {
  metadata?: { title?: string; description?: string };
  hero?: { title?: string; subtitle?: string; image?: string };
  overview?: string;
  initiatives?: { title: string; description: string; items?: string[] }[];
  majorCrops?: { title: string; description: string; image?: string }[];
}

export interface NewsPageConfig {
  metadata?: { title?: string; description?: string };
  hero?: { title?: string; subtitle?: string; image?: string };
}

export interface ContactPageConfig {
  hero?: { title?: string; subtitle?: string; image?: string };
  contactDetails?: ContactDetail[];
  officeHours?: string;
  mapEmbedUrl?: string;
  directionsText?: string;
  successMessage?: string;
}

export interface GalleryPageConfig {
  metadata?: { title?: string; description?: string };
  hero?: { title?: string; subtitle?: string; image?: string };
}

export interface UploadConfig {
  defaultFolder?: string;
}

export interface SiteConfig {
  siteName?: string;
  metadata?: { title?: string; description?: string };
  favicon?: string;

  navbar?: NavbarConfig;
  hero?: HeroConfig;
  about?: AboutSectionConfig;
  chairman?: ChairmanConfig;
  agriculture?: AgricultureSectionConfig;
  news?: NewsSectionConfig;
  projects?: ProjectsSectionConfig;
  gallery?: GallerySectionConfig;
  footer?: FooterConfig;

  aboutPage?: AboutPageConfig;
  governmentPage?: GovernmentPageConfig;
  projectsPage?: ProjectsPageConfig;
  agriculturePage?: AgriculturePageConfig;
  newsPage?: NewsPageConfig;
  contactPage?: ContactPageConfig;
  galleryPage?: GalleryPageConfig;

  upload?: UploadConfig;
  theme?: { colors?: ThemeColors };
  dashboard?: { adminLabel?: string };
}
