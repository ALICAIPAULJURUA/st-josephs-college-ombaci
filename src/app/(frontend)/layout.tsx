import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import Script from "next/script";
import { headers } from "next/headers";

import { getSiteSettings } from "@/lib/content";

import "../globals.css";

const bigShoulders = localFont({
  src: "../../fonts/big-shoulders-display-latin.woff2",
  weight: "600 900",
  style: "normal",
  variable: "--font-big-shoulders",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    title: {
      default: settings.metaTitle || settings.schoolName,
      template: `%s | ${settings.schoolName}`,
    },
    description: settings.metaDescription,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    icons: [{ rel: "icon", type: "image/png", url: "/crest.png" }],
    openGraph: {
      type: "website",
      siteName: settings.schoolName,
      title: settings.metaTitle || settings.schoolName,
      description: settings.metaDescription,
      images: [{ url: "/crest.png", alt: `${settings.schoolName} crest` }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.metaTitle || settings.schoolName,
      description: settings.metaDescription,
      images: ["/crest.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const analyticsDomain = process.env.PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${barlow.variable}`}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        {children}
        {analyticsDomain ? (
          <Script
            data-domain={analyticsDomain}
            nonce={nonce}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
