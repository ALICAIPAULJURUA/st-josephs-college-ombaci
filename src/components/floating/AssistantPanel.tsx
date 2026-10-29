"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

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

export default function AssistantPanel({
  messages,
  isReplying,
  onClose,
  onSend,
  whatsappHref,
  contactHref,
}: {
  messages: ChatMessage[];
  isReplying: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  whatsappHref: string | null;
  contactHref: string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const showSuggestions = !messages.some((message) => message.role === "user");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const log = logRef.current;

    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isReplying]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = value.trim();

    if (!question || isReplying) return;

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
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <Image
            src="/crest.png"
            alt=""
            width={24}
            height={28}
            className="h-7 w-6 object-contain"
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
                {message.text}
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
                  disabled={isReplying}
                  onClick={() => onSend(question)}
                  className="border-2 border-navy bg-white px-3 py-1.5 text-left text-[13px] font-semibold text-navy hover:bg-yellow disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}
        </div>

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
            className="min-h-11 min-w-0 flex-1 border-0 px-4 py-3.5 text-[15px] outline-offset-[-3px]"
          />
          <button
            type="submit"
            disabled={!value.trim() || isReplying}
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
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click")}
              className="mt-1 inline-block text-[13px] font-semibold underline underline-offset-2 hover:text-navy-2"
            >
              Chat on WhatsApp instead
            </a>
          ) : (
            <Link
              href={contactHref}
              className="mt-1 inline-block text-[13px] font-semibold underline underline-offset-2 hover:text-navy-2"
            >
              Contact the school instead
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
