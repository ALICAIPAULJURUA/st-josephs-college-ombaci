import type { ReactNode } from "react";

import { FloatingActions } from "@/components/floating/FloatingActions";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NoticeBar } from "@/components/layout/NoticeBar";
import { getSiteSettings } from "@/lib/content";
import {
  isChatConfigured,
  isChatProviderConfigured,
} from "@/lib/chat/config";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSiteSettings();
  const notice =
    settings.notice.enabled && settings.notice.text?.trim()
      ? {
          id: `${settings.notice.text}:${settings.notice.href ?? ""}`,
          text: settings.notice.text,
          ...(settings.notice.href ? { href: settings.notice.href } : {}),
          dismissLabel: settings.notice.dismissLabel,
        }
      : undefined;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:bg-yellow focus:px-5 focus:py-3 focus:font-bold focus:uppercase focus:text-navy"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <NoticeBar notice={notice} />
        <Header settings={settings} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
      </div>
      <FloatingActions
        settings={settings}
        assistantAvailable={isChatProviderConfigured()}
        assistantReady={isChatConfigured()}
        turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? ""}
      />
    </>
  );
}
