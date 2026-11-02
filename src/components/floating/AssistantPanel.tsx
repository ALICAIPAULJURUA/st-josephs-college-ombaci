"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  suggestedQuestions,
  type ChatMessage,
} from "@/components/floating/chat";
import { trackEvent } from "@/lib/analytics";

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className="size-5"
    >
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

function AssistantMessageText({ text }: { text: string }) {
  const linkPattern = /\[([^\]]+)\]\((\/[a-z0-9/-]+)\)/gi;
  const parts: ReactNode[] = [];
  let start = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    parts.push(text.slice(start, match.index));
    parts.push(
      <Link
        key={`${match.index}-${match[2]}`}
        href={match[2]}
        className="font-semibold underline underline-offset-2"
      >
        {match[1]}
      </Link>,
    );
    start = linkPattern.lastIndex;
  }

  parts.push(text.slice(start));
  return <>{parts}</>;
}

export default function AssistantPanel({
  messages,
  isReplying,
  onClose,
  onSend,
  whatsappHref,
  contactHref,
  phone,
  siteKey,
  assistantReady,
  needsChallenge,
  challengeToken,
  onChallengeToken,
  errorMessage,
}: {
  messages: ChatMessage[];
  isReplying: boolean;
  errorMessage: string;
  onClose: () => void;
  onSend: (text: string) => void;
  whatsappHref: string | null;
  contactHref: string;
  phone: string;
  siteKey: string;
  assistantReady: boolean;
  needsChallenge: boolean;
  challengeToken: string;
  onChallengeToken: (token: string) => void;
}) {
  const [value, setValue] = useState("");
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const showSuggestions = !messages.some((message) => message.role === "user");
  const canSend =
    assistantReady && (!needsChallenge || Boolean(challengeToken));
  const phoneNumber = phone.replace(/[^\d+]/g, "");
  const phoneHref = /^\+?\d{7,15}$/.test(phoneNumber)
    ? `tel:${phoneNumber}`
    : null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (
      !needsChallenge ||
      !scriptReady ||
      !siteKey ||
      !challengeRef.current ||
      !window.turnstile
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(challengeRef.current, {
      sitekey: siteKey,
      callback: onChallengeToken,
      "expired-callback": () => onChallengeToken(""),
      "error-callback": () => onChallengeToken(""),
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [needsChallenge, onChallengeToken, scriptReady, siteKey]);

  useEffect(() => {
    if (isReplying && challengeToken && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
      onChallengeToken("");
    }
  }, [challengeToken, isReplying, onChallengeToken]);

  useEffect(() => {
    const log = logRef.current;

    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isReplying]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = value.trim();

    if (!question || isReplying || !canSend) return;

    onSend(question);
    setValue("");
  }

  return (
    <div
      id="ombacian-assistant-panel"
      role="dialog"
      aria-labelledby="ombacian-assistant-title"
      aria-describedby="ombacian-assistant-subtitle"
      className="absolute bottom-[calc(100%+14px)] right-0 z-[100] flex max-h-[calc(100dvh-120px)] w-[370px] max-w-[calc(100vw-48px)] flex-col overflow-hidden border-[3px] border-navy bg-white text-navy shadow-[6px_6px_0_var(--navy)] max-[641px]:fixed max-[641px]:inset-x-0 max-[641px]:bottom-0 max-[641px]:h-[min(80dvh,560px)] max-[641px]:max-h-none max-[641px]:w-full max-[641px]:max-w-none max-[641px]:border-x-0 max-[641px]:border-b-0 max-[641px]:shadow-none"
    >
      {needsChallenge && siteKey ? (
        <Script
          onLoad={() => setScriptReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <Image
            src="/crest.png"
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="ombacian-assistant-title"
            className="font-body text-[17px] font-bold leading-tight normal-case"
          >
            OMBACIAN Assistant
          </h2>
          <p
            id="ombacian-assistant-subtitle"
            className="text-[13px] leading-tight text-soft"
          >
            Admissions, boarding, fees and visits
          </p>
        </div>
        <button
          type="button"
          aria-label="Close assistant"
          onClick={onClose}
          className="inline-flex size-11 shrink-0 items-center justify-center border-[2px] border-white text-white hover:bg-navy-2 focus-visible:outline-yellow"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {!assistantReady ? (
          <p
            role="status"
            className="border-b border-line bg-mist px-4 py-3 text-sm leading-relaxed"
          >
            The assistant is being set up. You can contact the school using the
            links below while its security check is configured.
          </p>
        ) : null}
        <div
          ref={logRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 max-h-[300px] max-[641px]:max-h-none"
        >
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="flex flex-col gap-2.5"
          >
            {messages.map((message) => (
              <p
                key={message.id}
                className={[
                  "max-w-[88%] px-3.5 py-2.5 text-[15px] leading-[1.45]",
                  message.role === "assistant"
                    ? "self-start bg-mist text-navy"
                    : "self-end bg-navy text-white",
                ].join(" ")}
              >
                <AssistantMessageText text={message.text} />
              </p>
            ))}

            {isReplying ? (
              <p className="assistant-typing self-start bg-mist px-3.5 py-2.5 text-[15px] text-navy">
                Assistant is typing...
              </p>
            ) : null}
          </div>

          {showSuggestions ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isReplying || !canSend}
                  onClick={() => onSend(question)}
                  className="border-2 border-navy bg-white px-3 py-1.5 text-left text-[13px] font-semibold text-navy hover:bg-yellow disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {needsChallenge ? (
          <div className="border-t border-line px-4 py-2">
            <p className="mb-1 text-[12px] font-semibold">
              Complete the security check before your first question.
            </p>
            <div aria-label="Security check" ref={challengeRef} role="group" />
          </div>
        ) : null}
        {errorMessage ? (
          <p
            role="alert"
            className="border-t border-line px-4 py-2 text-sm text-red"
          >
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="flex border-t-2 border-navy">
          <label htmlFor="ombacian-assistant-input" className="sr-only">
            Your question
          </label>
          <input
            ref={inputRef}
            id="ombacian-assistant-input"
            name="question"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={1000}
            autoComplete="off"
            placeholder="Type your question"
            disabled={!assistantReady}
            className="min-h-11 min-w-0 flex-1 border-0 px-4 py-3.5 text-[15px] outline-offset-[-3px]"
          />
          <button
            type="submit"
            disabled={
              !assistantReady || !value.trim() || isReplying || !canSend
            }
            className="min-h-11 shrink-0 border-l-2 border-navy bg-yellow px-5 text-[15px] font-extrabold uppercase tracking-[0.04em] text-navy hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>

        <div className="px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2">
          <p className="text-[12px] leading-[1.4] text-[#3A4B73]">
            Answers come from the school&apos;s published information. For
            anything urgent, call the school.
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click")}
                className="underline underline-offset-2 hover:text-navy-2"
              >
                Chat on WhatsApp
              </a>
            ) : null}
            {phoneHref ? (
              <a
                href={phoneHref}
                className="underline underline-offset-2 hover:text-navy-2"
              >
                Call the school
              </a>
            ) : null}
            <Link
              href={contactHref}
              className="underline underline-offset-2 hover:text-navy-2"
            >
              Contact the school
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
