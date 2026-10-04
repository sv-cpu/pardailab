import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/site";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "PardAiLabs — практический искусственный интеллект",
    template: "%s — PardAiLabs",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.url }],
  creator: site.author,
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    title: "PardAiLabs — практический искусственный интеллект",
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "PardAiLabs — практический искусственный интеллект",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
