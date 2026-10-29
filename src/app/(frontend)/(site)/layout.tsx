import type { ReactNode } from "react";

import { FloatingActions } from "@/components/floating/FloatingActions";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NoticeBar } from "@/components/layout/NoticeBar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:bg-yellow focus:px-5 focus:py-3 focus:font-bold focus:uppercase focus:text-navy"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <NoticeBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <FloatingActions />
    </>
  );
}
