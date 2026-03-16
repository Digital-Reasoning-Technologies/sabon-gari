"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/contexts/site-config";

export default function GovernmentPage() {
  const pathname = usePathname();
  const config = useSiteConfig();
  const siteName = config.siteName ?? "Kudan";
  const gp = config.governmentPage ?? {};
  const hero = gp.hero ?? { title: "Government", subtitle: `Learn about the structure, leadership, and governance of ${siteName} Local Government.`, image: "/bg1.png" };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const structure = gp.structure ?? {};
  const leadership = gp.leadership ?? [];
  const electoralWards = gp.electoralWards ?? [];
  const traditional = gp.traditionalInstitution ?? {};
  const tabActive = "bg-brand text-brand-foreground";
  const tabDefault = "bg-brand-muted text-brand-dark hover:bg-brand hover:text-brand-foreground transition-colors duration-300";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={`${siteName} Government`}
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

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="structure" className={pathname === "/government/structure" ? tabActive : tabDefault}>
                Government Structure
              </TabsTrigger>
              <TabsTrigger value="wards" className={pathname === "/government/wards" ? tabActive : tabDefault}>
                Electoral Wards
              </TabsTrigger>
            </TabsList>

            {/* Government Structure Tab */}
            <TabsContent value="structure">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-bold text-brand-dark mb-6">
                    Government Structure
                  </h2>

                  <div className="prose max-w-none text-gray-700">
                    {structure.intro && <p className="mb-4">{structure.intro}</p>}
                    {structure.executive && structure.executive.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Executive Arm</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {structure.executive.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {structure.legislative && structure.legislative.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Legislative Arm</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {structure.legislative.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {structure.departments && structure.departments.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Administrative Departments</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          {structure.departments.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {leadership.length > 0 && (
                    <h3 className="text-xl font-semibold text-brand-dark mb-4">Current Leadership</h3>
                  )}
                  {leadership.map((person, i) => (
                    <div key={i} className="bg-brand-muted p-6 rounded-lg shadow-md mb-6">
                      <div className="flex flex-col items-center">
                        {person.image && (
                          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                            <Image
                              src={person.image}
                              alt={person.name}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="text-lg font-medium text-brand-dark">{person.name}</h4>
                        <p className="text-gray-600">{person.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </TabsContent>

            {/* Electoral Wards Tab */}
            <TabsContent value="wards">
              <div>
                <h2 className="text-3xl font-bold text-brand-dark mb-6">
                  Electoral Wards
                </h2>

                <p className="text-gray-700 mb-8 max-w-3xl">
                  {siteName} Local Government Area is represented by elected councillors, each serving their respective wards.
                </p>

                {/* Speaker at the top center */}
                <div className="mb-12 flex justify-center">
                  {electoralWards[0] && (
                    <Card 
                      className={`w-full max-w-sm hover:shadow-md transition-shadow border-2 border-brand`}
                    >
                      <CardHeader className="bg-brand-muted pb-3">
                        <div className="flex items-center justify-center gap-2">
                          <CardTitle className="text-brand-dark text-center">{electoralWards[0].ward}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-2 border-brand/30 flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
                            <Image
                              src={electoralWards[0].image}
                              alt={`${electoralWards[0].councillor} - ${electoralWards[0].ward}`}
                              width={192}
                              height={192}
                              className="w-full h-full object-cover"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-brand-dark mb-1 text-center">
                            {electoralWards[0].councillor}
                          </h3>
                          {electoralWards[0].position && (
                            <Badge className="bg-brand text-white text-xs px-2 py-1">
                              <span className="block truncate">{electoralWards[0].position}</span>
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Rest of the wards in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {electoralWards.slice(1).map((ward) => (
                    <Card 
                      key={ward.ward} 
                      className={`hover:shadow-md transition-shadow`}
                    >
                      <CardHeader className="bg-brand-muted pb-3">
                        <div className="flex items-center justify-center gap-2">
                          <CardTitle className="text-brand-dark text-center text-sm sm:text-base md:text-lg">{ward.ward}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col items-center">
                          <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-brand/30 flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
                            <Image
                              src={ward.image}
                              alt={`${ward.councillor} - ${ward.ward}`}
                              width={160}
                              height={160}
                              className="w-full h-full object-cover"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-brand-dark mb-1 text-center line-clamp-2">
                            {ward.councillor}
                          </h3>
                          {ward.position && (
                            <Badge className="bg-brand text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                              <span className="block truncate">{ward.position}</span>
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Traditional Institution Section */}
      {(traditional.intro || (traditional.chiefdoms?.length) || traditional.role) ? (
        <section className="py-16 bg-brand-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                {traditional.sectionTitle ?? "Traditional Institution"}
              </h2>
              <div className="w-24 h-1 bg-brand mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                {traditional.intro ? (
                  <>
                    <h3 className="text-xl font-semibold text-brand-dark mb-4">
                      {traditional.emirateHeading ?? "Emirate Council"}
                    </h3>
                    <p className="text-gray-700 mb-4">{traditional.intro}</p>
                  </>
                ) : null}
                {traditional.chiefdoms && traditional.chiefdoms.length > 0 ? (
                  <>
                    <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">
                      {traditional.districtsHeading ?? "Districts"}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      {traditional.chiefdoms.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <div>
                {traditional.role ? (
                  <div className="bg-brand-muted p-6 rounded-lg shadow-md border border-brand/10">
                    <h4 className="text-lg font-medium text-brand-dark mb-2">
                      {traditional.roleHeading ?? "Role of Traditional Leaders"}
                    </h4>
                    <p className="text-gray-700">{traditional.role}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}