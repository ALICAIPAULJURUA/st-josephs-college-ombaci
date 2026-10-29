"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ApplyNow } from "@/components/floating/ApplyNow";
import { AssistantLauncher } from "@/components/floating/AssistantLauncher";
import {
  isChatMessage,
  stubReply,
  stubReplyWithoutWhatsApp,
  welcomeMessage,
  type ChatMessage,
} from "@/components/floating/chat";
import { WhatsAppButton } from "@/components/floating/WhatsAppButton";
import { siteSettings } from "@/content/site";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const AssistantPanel = dynamic(() => import("./AssistantPanel"), {
  ssr: false,
});

const STORAGE_KEY = "ombacian-assistant-conversation-v1";

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStoredMessages() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return null;

    const valid = parsed.filter(isChatMessage).slice(-30);

    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

export function FloatingActions() {
  const pathname = usePathname();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef(false);
  const replyTimerRef = useRef<number | null>(null);
  const hasLoadedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [isReplying, setIsReplying] = useState(false);

  const whatsappHref = buildWhatsAppHref(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );

  useEffect(() => {
    if (messages.length <= 1) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      return;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      event.preventDefault();
      returnFocusRef.current = true;
      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open || !returnFocusRef.current) return;

    returnFocusRef.current = false;
    launcherRef.current?.focus();
  }, [open]);

  const closePanel = useCallback(() => {
    returnFocusRef.current = true;
    setOpen(false);
  }, []);

  function togglePanel() {
    if (open) {
      closePanel();
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;

      const stored = readStoredMessages();

      if (stored) setMessages(stored);
    }

    trackEvent("assistant_open");
    setOpen(true);
  }

  function sendMessage(text: string) {
    const question = text.trim().slice(0, 1000);

    if (!question || isReplying) return;

    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", text: question },
    ]);
    setIsReplying(true);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: whatsappHref ? stubReply : stubReplyWithoutWhatsApp,
        },
      ]);
      setIsReplying(false);
      replyTimerRef.current = null;
    }, 550);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <>
      {pathname !== "/apply" ? <ApplyNow /> : null}

      <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-6 z-[100] flex flex-col items-end gap-3 max-[641px]:bottom-[calc(14px+env(safe-area-inset-bottom))] max-[641px]:right-3.5">
        <div className="relative">
          {open ? (
            <AssistantPanel
              messages={messages}
              isReplying={isReplying}
              onClose={closePanel}
              onSend={sendMessage}
              whatsappHref={whatsappHref}
              contactHref={siteSettings.contactHref}
            />
          ) : null}

          <AssistantLauncher
            buttonRef={launcherRef}
            expanded={open}
            onToggle={togglePanel}
            className={open ? "max-[641px]:invisible" : ""}
          />
        </div>

        {whatsappHref ? (
          <WhatsAppButton
            href={whatsappHref}
            className={open ? "max-[641px]:invisible" : ""}
          />
        ) : null}
      </div>
    </>
  );
}
