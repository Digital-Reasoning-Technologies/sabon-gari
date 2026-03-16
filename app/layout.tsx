import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSiteConfig } from "@/lib/site-config";
import { ThemeVarsStyle } from "@/components/ThemeVarsStyle";
import { SiteConfigProvider } from "@/contexts/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: config.metadata?.title ?? "Kudan Local Government",
    description: config.metadata?.description ?? "Official website of Kudan Local Government Area, Kaduna State",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getSiteConfig();
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/logo.png" type="image/x-icon" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeVarsStyle colors={config.theme?.colors} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteConfigProvider config={config}>
            <Toaster />
            {children}
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
