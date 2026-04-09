import type { Metadata } from 'next';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const ep = config.economyPage ?? {};
  const economy = config.economy ?? {};
  return {
    title: ep.metadata?.title ?? `Economy | ${siteName} Local Government`,
    description: ep.metadata?.description ?? economy.sectionTitle ?? `Explore the economy and economic development of ${siteName} Local Government Area.`,
  };
}

export default function EconomyPage() {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const ep = config.economyPage ?? {};
  const economy = config.economy ?? {};
  const hero = ep.hero ?? {
    title: `Economy of ${siteName}`,
    subtitle: economy.sectionTitle ?? `Discover the economic drivers and development of ${siteName} Local Government Area.`,
    image: "/bg1.png",
  };
  const heroImage = hero.image ?? config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const overview = ep.overview ?? "";
  const sectors = ep.sectors ?? economy.cards ?? [];

  return (
    <div className="min-h-screen">
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={`Economy of ${siteName}`}
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

      {overview && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Economic Overview</h2>
              <p className="text-gray-700">{overview}</p>
            </div>
          </div>
        </section>
      )}

      {sectors.length > 0 && (
        <section className="py-16 bg-brand-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">
              {economy.sectionTitle ?? "Economic Sectors"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sectors.map((sector, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-brand-dark">{sector.title}</CardTitle>
                    {sector.subtitle && <CardDescription>{sector.subtitle}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-1">
                    {sector.image && (
                      <Image
                        src={sector.image}
                        alt={sector.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        unoptimized
                      />
                    )}
                    <p className="text-gray-700">{sector.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
