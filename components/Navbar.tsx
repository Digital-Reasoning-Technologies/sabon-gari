"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSiteConfig } from "@/contexts/site-config";

const Navbar = () => {
  const config = useSiteConfig();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = config.navbar?.navLinks ?? [
    { name: "About Kudan", href: "/about" },
    { name: "Government", href: "/government" },
    { name: "Projects", href: "/projects" },
    { name: "Agriculture", href: "/agriculture" },
    { name: "News", href: "/news" },
    { name: "Gallery", href: "/gallery" },
  ];
  const siteName = config.siteName ?? "Kudan";
  const logo = config.navbar?.logo;
  const logoAlt = config.navbar?.logoAlt ?? `${siteName} Logo`;
  const contactLabel = config.navbar?.contactButtonLabel ?? "Contact Us";

  return (
    <nav className="bg-brand-dark text-brand-foreground sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              {logo ? (
                <Image
                  src={logo}
                  alt={logoAlt}
                  width={80}
                  height={80}
                  className="rounded-full bg-white w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 hover:opacity-90 transition-opacity"
                  priority
                />
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-white text-brand-dark px-4 py-2 rounded-full">
                  {siteName} LGA
                </span>
              )}
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm lg:text-base font-semibold text-white relative hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-white hover:after:transition-all hover:after:duration-300 ${
                    pathname === link.href
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white"
                      : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Button
              asChild
              className="bg-brand hover:bg-brand-hover text-brand-foreground text-sm lg:text-base px-6 py-3 rounded-md transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              <Link href="/contact">{contactLabel}</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-white hover:bg-brand h-10 w-10 rounded-md transition-colors duration-300"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-brand-dark pb-4">
            <div className="px-2 pt-2 pb-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-semibold text-white relative hover:after:absolute hover:after:bottom-2 hover:after:left-4 hover:after:w-[calc(100%-2rem)] hover:after:h-[2px] hover:after:bg-white hover:after:transition-all hover:after:duration-300 ${
                    pathname === link.href
                      ? "after:absolute after:bottom-2 after:left-4 after:w-[calc(100%-2rem)] after:h-[2px] after:bg-white"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                asChild
                className="w-full mt-2 bg-brand hover:bg-brand-hover text-brand-foreground py-3 text-base font-semibold rounded-md transition-colors duration-300"
              >
                <Link href="/contact">{contactLabel}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
