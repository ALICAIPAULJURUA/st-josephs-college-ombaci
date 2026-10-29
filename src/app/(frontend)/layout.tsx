import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";

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

export const metadata: Metadata = {
  title: "St. Joseph's College, Ombaci",
  description:
    "Official website of St. Joseph's College, Ombaci, a Catholic boys' boarding school in Arua City, Uganda.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${barlow.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
