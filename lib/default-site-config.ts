import type { SiteConfig } from "./site-config.types";

/**
 * Default site config (Kudan LGA). Used when SITE_CONFIG_JSON_FILE is not set or file is missing.
 */
export const defaultSiteConfig: SiteConfig = {
  siteName: "Kudan",
  metadata: {
    title: "Kudan Local Government",
    description: "Official website of Kudan Local Government Area, Kaduna State",
  },

  navbar: {
    logo: "/logo.png",
    logoAlt: "Kudan Logo",
    navLinks: [
      { name: "About Kudan", href: "/about" },
      { name: "Government", href: "/government" },
      { name: "Projects", href: "/projects" },
      { name: "Agriculture", href: "/agriculture" },
      { name: "News", href: "/news" },
      { name: "Gallery", href: "/gallery" },
    ],
    contactButtonLabel: "Contact Us",
  },

  hero: {
    slides: [
      {
        image: "/bg1.png",
        title: "Welcome to Kudan Local Government",
        subtitle:
          "Farming is our source of pride. Our vibrant community thrives on agricultural excellence, producing maize, millet, and groundnuts in abundance. With fertile lands and hardworking farmers, Kudan continues to lead in food security and sustainability.",
      },
      {
        image: "/bg1.png",
        title: "Kudan is not just about agriculture",
        subtitle:
          "It's a community of unity and progress. Our local economy flourishes through trade, education, and infrastructural development, reflecting our commitment to growth and modernization.",
      },
      {
        image: "/bg1.png",
        title: "Our heritage runs deep",
        subtitle:
          "From colorful festivals to traditional crafts, Kudan embraces cultural diversity and proudly promotes youth empowerment, education, and social welfare for all residents.",
      },
    ],
  },

  about: {
    sectionTitle: "About Kudan",
    generalInfoHeading: "General Information",
    paragraphs: [
      "Kudan Local Government Area is located in Kaduna State with its headquarters in Hunkuyi. Spanning an area of 345.4 km², Kudan is led by Hon. Dauda Ilya Abba (Chairman) and Usman Abbas Likoro (Vice Chairman).",
      "The major tribes are Hausa and Fulani, with Hausa and Fulfulde being the predominant languages. The main economic activities include farming, livestock rearing, and trading.",
    ],
    readMoreHref: "/about",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d130412.4717321086!2d7.786765501681929!3d11.262539404798725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11b27fc3df7cf997%3A0x7f813ac2a29bec28!2sKudan%2C%20Kaduna%2C%20Nigeria!5e1!3m2!1sen!2sus!4v1741206962840!5m2!1sen!2sus",
  },

  chairman: {
    sectionTitle: "Message from the Chairman",
    name: "Hon. Dauda Ilya Abba",
    image: "/chairman.png",
    messageParagraphs: [
      "I warmly welcome you to explore our community's rich heritage and promising future. This website is your window into our agricultural achievements, community projects, and cultural heritage. Our administration is committed to transparent governance, sustainable development, and improving the quality of life for all residents of Kudan.",
      "While we provide informative content about our ongoing projects and initiatives, we invite you to contact us for any further details or collaborative opportunities.",
      "Thank you for visiting, and I look forward to sharing the remarkable journey of Kudan with you.",
    ],
  },

  agriculture: {
    sectionTitle: "Agriculture - Farming is our Pride",
    sectionImage: "/bg2.png",
    cards: [
      {
        title: "Potatoes",
        subtitle: "High-quality produce",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description:
          "Kudan's farmers are celebrated for producing high-quality potatoes that are distributed across the Country.",
      },
      {
        title: "Grapes",
        subtitle: "Gaining recognition",
        image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description:
          "We proudly account for approximately 85% of Nigeria's grape production, with over 80 vineyards yielding high-quality grapes.",
      },
      {
        title: "Other Crops",
        subtitle: "Diverse agricultural products",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description:
          "Other prominent crops include cabbage, carrots, and tomatoes, contributing to the region's agricultural diversity.",
      },
    ],
    learnMoreText: "Learn More About Our Agriculture",
    learnMoreHref: "/agriculture",
  },

  news: {
    sectionTitle: "Latest News",
    subtitle: "Stay in Touch with Us",
  },

  projects: {
    sectionTitle: "Projects",
  },

  gallery: {
    sectionTitle: "Our Gallery",
  },

  footer: {
    logo: "/logo.png",
    logoAlt: "Kudan LGA Logo",
    headquarters: "Headquarters: Secretariat, Zaria Road, Hunkuyi\nKaduna State, Nigeria",
    contact: [
      { icon: "phone", text: "+234 7011 404 040" },
      { icon: "mail", text: "kudanlg@gmail.com" },
      { icon: "mapPin", text: "Secretariat, Zaria Road, Hunkuyi" },
    ],
    socialLinks: [
      { name: "Facebook", href: "https://www.facebook.com/kudanlg/", icon: "facebook" },
      { name: "Twitter", href: "https://x.com/Kudan_LG", icon: "twitter" },
      { name: "Instagram", href: "https://www.instagram.com/kudan_lg/", icon: "instagram" },
      { name: "LinkedIn", href: "https://www.linkedin.com/company/kudan-lga/posts/?feedView=all", icon: "linkedin" },
      { name: "YouTube", href: "https://www.youtube.com/@KudanLG", icon: "youtube" },
    ],
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "About Kudan", href: "/about" },
      { label: "Government", href: "/government" },
      { label: "Projects", href: "/projects" },
      { label: "Agriculture", href: "/agriculture" },
      { label: "News & Events", href: "/news" },
    ],
    copyright: "Kudan Local Government Area. All rights reserved.",
  },

  aboutPage: {
    hero: {
      title: "About Kudan",
      subtitle: "Learn about our history, culture, and the people of Kudan.",
      image: "/bg1.png",
    },
    tabs: {
      general: {
        leadership: [
          "Chairman: Hon. Dauda Ilya Abba",
          "Vice Chairman: Usman Abbas Likoro",
        ],
        location: [
          "Location: Kaduna State",
          "Headquarters: Hunkuyi",
          "Area: 345.4 km²",
          "Neighboring Locations: Bordering Makarfi, Soba, Sabon Gari LGAs, Giwa and parts of Katsina (Danja LGA) and Kano (Sundu LGA)",
        ],
        demographics: [
          "Major Tribes: Hausa, Fulani",
          "Languages: Hausa, Fulfulde",
        ],
        economy: [
          "Main Economic Activities: Farming, livestock rearing, trading",
          "Climate: Tropical savanna with distinct dry (November–March) and wet (April–October) seasons",
        ],
      },
      history: {
        paragraphs: [
          "Kudan Local Government Area was established in 1996 in Kaduna State. The name \"Kudan\" is derived from Kudandariya, a founding figure whose legacy spans over 600 years.",
          "Today, our administrative headquarters is located in Hunkuyi, the center of local governance and community life. Kudan is led by an elected Chairman and Vice Chairman and comprises 10 electoral wards, each represented by an elected councilor, with village heads providing grassroots support.",
          "Over the decades, Kudan has maintained its deep-rooted agricultural traditions while steadily embracing modern development and progress.",
        ],
      },
      culture: {
        paragraphs: [
          "Kudan is known for its rich cultural traditions that celebrate a way of life centered around farming and community. Residents take pride in traditional festivals, music, dance, and crafts that have been passed down through generations.",
          "These cultural expressions not only bind the community together but also highlight our strong connection to the land.",
        ],
        tribes: ["Hausa", "Fulani"],
        languages: [
          "Primary: Hausa",
          "Secondary: English (official language), Fulfulde, and Nigerian Pidgin",
        ],
      },
    },
    geographyEconomy: {
      title: "Geography & Economy",
      location:
        "Kudan Local Government is strategically located in Kaduna State, sharing borders with neighboring LGAs such as Makarfi, Soba, Sabon Gari LGAs, Giwa and parts of Katsina (Danja LGA), Kano (Sundu LGA) States. This prime location, coupled with fertile lands, has made agriculture the backbone of our economy.",
      climate:
        "Tropical savanna with distinct dry (November–March) and wet (April–October) seasons.",
      mainActivities: [
        "Farming (irrigation-based cultivation of crops)",
        "Livestock rearing",
        "Trading",
      ],
    },
  },

  governmentPage: {
    hero: {
      title: "Government",
      subtitle: "Learn about the structure, leadership, and governance of Kudan Local Government.",
      image: "/bg1.png",
    },
    structure: {
      intro:
        "Kudan LGA is governed by an integrated leadership structure that combines modern electoral representation with traditional authority under the Zazzau Emirate.",
      executive: [
        "Chairman: Hon. Dauda Ilya Abba",
        "Vice Chairman: Usman Abbas Likoro",
        "Secretary to the Local Government: Mohammed Sani Zubair",
        "Supervisory Councilors & Special Advisors: Consists of members appointed by the Government",
      ],
      legislative: [
        "Speaker of the Legislative Council: Hon. DanAzumi Gaba Kauran Wali",
        "Members of the Council: 10 elected councillors representing each ward",
      ],
      departments: [
        "Admin & Finance Department",
        "Agriculture & Forestry Department",
        "Social Development Department",
        "Works & Infrastructure Department",
        "Local Government Education Authority",
        "Primary Health Care Authority",
      ],
    },
    leadership: [
      { name: "Senator Uba Sani", title: "Governor", image: "/uba.jpeg" },
      { name: "Hon. Sadiq Mamman Lagos", title: "Commissioner Ministry for Local Government and Chieftaincy Affairs", image: "/commissioner.PNG" },
      { name: "Hon. Dauda Ilya Abba", title: "Chairman", image: "/chairman.png" },
      { name: "Usman Abbas Likoro", title: "Vice Chairman", image: "/vice.jpg" },
    ],
    electoralWards: [
      { ward: "Kauran Wali South Ward", councillor: "Hon. Dan Azumi Garba", image: "/ELECTORAL WARDS/DAN AZUMI GARBA - Speaker.jpg", position: "Speaker" },
      { ward: "Doka Ward", councillor: "Hon. Ibrahim Yusuf", image: "/ELECTORAL WARDS/IBRAHIM SHU'AIBU.jpg", position: "Majority Leader" },
      { ward: "Hunkuyi Ward", councillor: "Hon. Hussain Musa Kallamu", image: "/ELECTORAL WARDS/HUSSAINI KALLAU.jpg", position: "Deputy Speaker" },
      { ward: "Kudan Ward", councillor: "Hon. Yau Kabiru", image: "/ELECTORAL WARDS/YA'U KABIRU (MAI TAKI).jpg", position: "Chief Whip" },
      { ward: "Garu Ward", councillor: "Hon. Zubairu Idris", image: "/ELECTORAL WARDS/ZUBAIRU IDRIS.jpg", position: "Deputy Majority Leader" },
      { ward: "Likoro Ward", councillor: "Hon. Musa Shittu Likoro", image: "/ELECTORAL WARDS/MUSA SHITU LIKORO.jpg", position: "Chairman General Purpose Committee" },
      { ward: "Sabon Gari Ward", councillor: "Hon. Hussain Ismail", image: "/ELECTORAL WARDS/HUSSAINI ISMA'IL.jpg", position: "Chairman Social Services Committee" },
      { ward: "Zabi Ward", councillor: "Hon. Abdullahi Ali", image: "/ELECTORAL WARDS/ABDULLAHI ALI.jpg", position: "Deputy Chairman Committee Social Services" },
      { ward: "Taban Sani Ward", councillor: "Hon. Nasiru Sirajo", image: "/ELECTORAL WARDS/NASIRU SIRAJO.jpg", position: "Chairman Economic Matters Committee" },
      { ward: "Kauran Wali North Ward", councillor: "Hon. Mu'azu Abdullahi", image: "/ELECTORAL WARDS/MU'AZU ABDULLAHI.jpg", position: "Deputy Chairman Committee Economic Matters" },
    ],
    traditionalInstitution: {
      intro:
        "Kudan falls under the Zazzau Emirate (based in Zaria). Traditional leadership plays an integral role in preserving Kudan's cultural identity and complementing modern governance.",
      chiefdoms: [
        "Kudan District: Headed by Alhaji Halliru Mahmud Tukuran Zazzau, who collaborates closely with the local government to foster community cohesion and preserve cultural continuity.",
        "Hunkuyi District: Serving as the administrative and cultural center, it is headed by Alhaji Aminu Muhammad Ashiru.",
      ],
      role: "A total of 27 village heads operate under these districts, ensuring that traditional practices and community customs are preserved. These traditional structures help maintain a balance between age-old customs and contemporary administrative practices, ensuring that Kudan's heritage remains vibrant and respected.",
    },
  },

  projectsPage: {
    metadata: {
      title: "Projects | Kudan Local Government",
      description:
        "Discover ongoing and completed projects developed by Kudan Local Government Area",
    },
    hero: {
      title: "Projects",
      subtitle: "Building a Better Community Together - Explore our projects infrastructure development initiatives.",
      image: "/bg1.png",
    },
    introParagraph:
      "At Kudan Local Government, we believe in transparency and community engagement. This page showcases our completed infrastructure projects that have been designed to improve local infrastructure and community services. We're committed to working closely with our citizens to ensure that every initiative meets the needs of our community.",
  },

  agriculturePage: {
    metadata: {
      title: "Agriculture | Kudan Local Government",
      description: "Explore agriculture initiatives and projects in Kudan Local Government Area",
    },
    hero: {
      title: "Agriculture in Kudan",
      subtitle:
        "Discover our agricultural heritage, modern farming practices, and the crops that make Kudan a major agricultural hub.",
      image: "/bg1.png",
    },
    overview:
      "Kudan Local Government is a major agricultural hub in Kaduna State, blessed with fertile land, irrigation systems, and a favorable climate that supports both wet and dry season farming. The area's farming activities range from staple food production to cash crops and livestock rearing, making it a key contributor to food security and economic development in the State and beyond. Kudan benefits from three major dams which facilitate year-round irrigation farming.",
    initiatives: [
      {
        title: "Kudan Agro-Development Initiative (KADI)",
        description:
          "KADI is a strategic program aimed at modernizing agriculture in Kudan by improving productivity, supporting agribusiness, and ensuring sustainability. The initiative provides farmers with:",
        items: [
          "Access to modern farming techniques",
          "Irrigation systems",
          "Storage facilities",
          "Financial support",
          "Agricultural extension services",
        ],
      },
      {
        title: "Kudan Agro-Development Company (KADCO)",
        description:
          "As the commercial and implementation arm of KADI, KADCO is responsible for:",
        items: [
          "Creating market linkages",
          "Facilitating agro-processing",
          "Driving large-scale agricultural investments",
          "Enabling value addition through processing facilities",
          "Ensuring better market access for farmers",
        ],
      },
    ],
    majorCrops: [
      {
        title: "Grapes",
        description:
          "Kudan is gaining recognition for its expanding grape farms, particularly in the Hunkuyi and Sabon Gari wards. We proudly account for approximately 85% of Nigeria's grape production, with over 80 vineyards yielding high-quality grapes that offer great potential for both local consumption and export, owing to our fertile soil, favorable climate, and the dedication of our local farmers.",
        image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Irish Potatoes",
        description:
          "Kudan is widely recognized as a major center for potato production, notably of Irish potatoes, owing to its rich, fertile soils and ideal climatic conditions that consistently yield high-quality crops. This longstanding reputation reinforces our pivotal role in Nigeria's agricultural sector.",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Tomatoes",
        description:
          "Tomato farming is a cornerstone of Kudan's agriculture, with advanced irrigation systems enabling year-round cultivation and ensuring a steady supply of high-quality tomatoes to markets across Kaduna State and beyond. Additionally, Kudan is home to a tomato paste factory, with further potential for investment in agro-processing, such as dried tomato production.",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Cabbage & Carrots",
        description:
          "Kudan LGA is well-known as one of the leading large-scale producers of cabbage and carrots, with farmers producing high volumes for both local markets and distribution across various states. These vegetables are key sources of income for small and large-scale farmers alike.",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Sugarcane",
        description:
          "Sugarcane farming is a major agricultural activity in Kauran Wali and Likoro wards. The region's climate and soil conditions support large-scale sugarcane production, which is processed into products like jaggery and syrup. The potential for establishing sugar processing plants in Kudan presents a significant economic opportunity.",
        image: "https://www.dayoadetiloye.com/wp-content/uploads/2017/10/SUGARCANE-FARMING-BUSINESS-PLAN-IN-NIGERIA-1-1024x1024.jpg",
      },
      {
        title: "Livestock Farming",
        description:
          "Beyond crop farming, Kudan has a strong tradition of livestock rearing, including cattle, goats, and poultry. Many households engage in animal husbandry as a primary or secondary source of income.",
        image: "/Agric/bg3.jpeg",
      },
      {
        title: "Agro-Processing & Value Addition",
        description:
          "In addition to raw agricultural production, Kudan is home to various agro-processing activities, including the production of kuli-kuli (groundnut cake), rice milling, local dairy products, and processed grains.",
        image: "/Agric/agro.png",
      },
    ],
  },

  newsPage: {
    metadata: { title: "News | Kudan Local Government", description: "Latest news and events" },
    hero: {
      title: "Latest News",
      subtitle: "Stay updated with the latest news, announcements, and upcoming events from Kudan Local Government.",
      image: "/news/newsHero.png",
    },
  },

  contactPage: {
    hero: {
      title: "Contact Us",
      subtitle:
        "We're here to help and answer any questions you might have. We look forward to hearing from you.",
      image: "/bg1.png",
    },
    contactDetails: [
      { icon: "mapPin", text: "Kudan Local Government Secretariat, Hunkuyi, Kaduna State, Nigeria" },
      { icon: "phone", text: "Main Office: +234 7011404040 | Customer Service: 07011404040" },
      { icon: "mail", text: "General: info@kudanlga.gov.ng | Support: support@kudanlga.gov.ng" },
    ],
    officeHours: "Monday - Friday: 8:00 AM - 4:00 PM\nSaturday & Sunday: Closed",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d130412.4717321086!2d7.786765501681929!3d11.262539404798725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11b27fc3df7cf997%3A0x7f813ac2a29bec28!2sKudan%2C%20Kaduna%2C%20Nigeria!5e1!3m2!1sen!2sus!4v1741206962840!5m2!1sen!2sus",
    successMessage:
      "Thank you for contacting Kudan Local Government. We will get back to you soon.",
  },

  galleryPage: {
    metadata: { title: "Gallery | Kudan Local Government", description: "Gallery" },
    hero: {
      title: "Discover the Art of Kudan",
      subtitle: "A visual journey through the moments, stories, and creativity that shape the Kudan Local Government experience.",
      image: "/bg1.png",
    },
  },

  upload: {
    defaultFolder: "kudan/news",
  },

  theme: {
    colors: {
      brand: "142 76% 36%",
      brandHover: "142 76% 42%",
      brandDark: "142 61% 26%",
      brandMuted: "142 40% 96%",
      brandForeground: "0 0% 100%",
      brandMutedForeground: "142 40% 70%",
    },
  },

  dashboard: {
    adminLabel: "Kudan Admin",
  },
};
