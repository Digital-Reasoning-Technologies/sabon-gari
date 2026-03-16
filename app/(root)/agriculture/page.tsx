import type { Metadata } from 'next';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const ap = config.agriculturePage ?? {};
  return {
    title: ap.metadata?.title ?? `Agriculture | ${siteName} Local Government`,
    description: ap.metadata?.description ?? `Explore agriculture initiatives and projects in ${siteName} Local Government Area.`,
  };
}

function withSiteName(text: string, siteName: string): string {
  if (!text || siteName === "Kudan") return text;
  return text.replace(/\bKudan\b/g, siteName);
}

export default function AgriculturePage() {
  const config = getSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const ap = config.agriculturePage ?? {};
  const hero = ap.hero ?? {
    title: `Agriculture in ${siteName}`,
    subtitle: `Discover our agricultural heritage and the crops that make ${siteName} a major agricultural hub.`,
    image: "/bg1.png",
  };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const overview = ap.overview ?? "";
  const initiatives = ap.initiatives ?? [];
  const majorCrops = ap.majorCrops ?? [];

  return (
    <div className="min-h-screen">
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={`Agriculture in ${siteName}`}
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
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Agricultural Excellence</h2>
              <p className="text-gray-700">{overview}</p>
            </div>
          </div>
        </section>
      )}

      {initiatives.length > 0 && (
        <section className="py-16 bg-brand-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {initiatives.map((init, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-brand-dark">{withSiteName(init.title, siteName)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{withSiteName(init.description, siteName)}</p>
                    {init.items && init.items.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        {init.items.map((item, j) => (
                          <li key={j}>{withSiteName(item, siteName)}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {majorCrops.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">Major Crops in {siteName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {majorCrops.map((crop, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-brand-dark">{crop.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {crop.image && (
                      <Image
                        src={crop.image}
                        alt={crop.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        unoptimized
                      />
                    )}
                    <p className="text-gray-700">{crop.description}</p>
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