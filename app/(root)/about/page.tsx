"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteConfig } from "@/contexts/site-config";

export default function AboutPage() {
  const pathname = usePathname();
  const config = useSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const ap = config.aboutPage ?? {};
  const hero = ap.hero ?? { title: `About ${siteName}`, subtitle: `Learn about our history, culture, and the people of ${siteName}.`, image: "/bg1.png" };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const tabs = ap.tabs ?? {};
  const general = tabs.general ?? {};
  const history = tabs.history ?? {};
  const culture = tabs.culture ?? {};
  const geo = ap.geographyEconomy ?? { title: "Geography & Economy", location: "", climate: "", mainActivities: [] };

  const tabActive = "bg-brand text-brand-foreground";
  const tabDefault = "bg-brand-muted text-brand-dark hover:bg-brand-muted/80";

  return (
    <div className="min-h-screen">
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={`${siteName} Local Government`}
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
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general" className={pathname === "/about" ? tabActive : tabDefault}>
                General Information
              </TabsTrigger>
              <TabsTrigger value="history" className={pathname === "/about/history" ? tabActive : tabDefault}>
                Brief History
              </TabsTrigger>
              <TabsTrigger value="culture" className={pathname === "/about/culture" ? tabActive : tabDefault}>
                Culture & Heritage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-bold text-brand-dark mb-6">General Information</h2>
                  <div className="space-y-6">
                    {general.leadership && general.leadership.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">Leadership</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {general.leadership.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {general.location && general.location.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">Location & Geography</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {general.location.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {general.demographics && general.demographics.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">Demographics</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {general.demographics.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {general.economy && general.economy.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">Economy & Climate</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {general.economy.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Image
                    src="/bg1.png"
                    alt={`${siteName} Local Government Area`}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg mb-6"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Image src="/Agric/agro.png" alt="Landscape" width={300} height={200} className="rounded-lg shadow-md" />
                    <Image src="/AboutKudan/GeoEconomy/gov.png" alt="Community" width={300} height={200} className="rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-bold text-brand-dark mb-6">Brief History</h2>
                  <div className="prose max-w-none text-gray-700">
                    {history.paragraphs?.map((p, i) => (
                      <p key={i} className="mb-4">{p}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <Image
                      src="/bg1.png"
                    alt="Historical"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg mb-6"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="culture">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-bold text-brand-dark mb-6">Culture & Heritage</h2>
                  <div className="prose max-w-none text-gray-700">
                    {culture.paragraphs?.map((p, i) => (
                      <p key={i} className="mb-4">{p}</p>
                    ))}
                    {culture.tribes && culture.tribes.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Major Tribes</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                          {culture.tribes.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {culture.languages && culture.languages.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Languages Spoken</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                          {culture.languages.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Image
                    src="https://th.bing.com/th/id/R.946cba39f029274a31caec7ff9ccc9bf?rik=XPODj6wfTAa0HQ&pid=ImgRaw&r=0"
                    alt="Cultural Celebration"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg mb-6"
                  />
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Image src="https://th.bing.com/th/id/OIP.48OQJDMDFyyvhyrDeHzLdwHaE-?rs=1&pid=ImgDetMain" alt="Music" width={300} height={200} className="rounded-lg shadow-md" />
                    <Image src="https://th.bing.com/th/id/OIP.Z7LeGgl8m2RfMrsrsyxIzQAAAA?rs=1&pid=ImgDetMain" alt="Crafts" width={300} height={200} className="rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-brand-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">{geo.title}</h2>
            <div className="w-24 h-1 bg-brand mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-medium text-brand-dark mt-6 mb-2">Location</h4>
              <p className="text-gray-700 mb-4">{geo.location}</p>
              <h4 className="text-xl font-medium text-brand-dark mt-6 mb-2">Climate</h4>
              <p className="text-gray-700 mb-4">{geo.climate}</p>
              {geo.mainActivities && geo.mainActivities.length > 0 && (
                <>
                  <h4 className="text-xl font-medium text-brand-dark mt-6 mb-2">Main Economic Activities</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    {geo.mainActivities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div>
              <Image src="/bg2.png" alt="Landscape" width={600} height={400} className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
