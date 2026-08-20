import type { Metadata, Viewport } from "next";
import { clashDisplay, satoshi, inter } from "./fonts";
import { Chrome } from "@/components/layout/Chrome";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "digital bouquet",
    "AI gift maker",
    "online greeting card",
    "virtual flowers",
    "digital gifts",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitter,
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFF4F8",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  slogan: site.tagline,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
