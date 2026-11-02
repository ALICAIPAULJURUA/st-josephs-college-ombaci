"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ApplyNow } from "@/components/floating/ApplyNow";
import { AssistantLauncher } from "@/components/floating/AssistantLauncher";
import { WhatsAppButton } from "@/components/floating/WhatsAppButton";
import type { SiteSettings } from "@/content/defaults/site";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const AssistantChat = dynamic(
  () => import("./AssistantChat").then((module) => module.AssistantChat),
  { ssr: false },
);

export function FloatingActions({
  settings,
  assistantAvailable,
  assistantReady,
  turnstileSiteKey,
}: {
  settings: SiteSettings;
  assistantAvailable: boolean;
  assistantReady: boolean;
  turnstileSiteKey: string;
}) {
  const pathname = usePathname();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const whatsappHref = buildWhatsAppHref(
    settings.whatsappNumber,
    settings.whatsappMessage,
  );
  const showAssistant = settings.assistantEnabled && assistantAvailable;

  useEffect(() => {
    if (open || !returnFocusRef.current) return;

    returnFocusRef.current = false;
    launcherRef.current?.focus();
  }, [open]);

  function closePanel() {
    returnFocusRef.current = true;
    setOpen(false);
  }

  function togglePanel() {
    if (open) {
      closePanel();
      return;
    }

    setHasOpened(true);
    setOpen(true);
    trackEvent("assistant_open");
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <>
      {pathname !== "/apply" ? <ApplyNow settings={settings} /> : null}

      <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-6 z-[100] flex flex-col items-end gap-3 max-[641px]:bottom-[calc(14px+env(safe-area-inset-bottom))] max-[641px]:right-3.5">
        {showAssistant ? (
          <div className="relative">
            {hasOpened ? (
              <AssistantChat
                open={open}
                onClose={closePanel}
                settings={settings}
                whatsappHref={whatsappHref}
                assistantReady={assistantReady}
                turnstileSiteKey={turnstileSiteKey}
              />
            ) : null}

            <AssistantLauncher
              buttonRef={launcherRef}
              expanded={open}
              onToggle={togglePanel}
              label={settings.assistantLabel}
              className={open ? "max-[641px]:invisible" : ""}
            />
          </div>
        ) : null}

        {whatsappHref ? (
          <WhatsAppButton
            href={whatsappHref}
            label={settings.whatsappLabel}
            className={open ? "max-[641px]:invisible" : ""}
          />
        ) : null}
      </div>
    </>
  );
}
