"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  contactEnquirySchema,
  type ContactEnquiry,
} from "@/content/schemas/application-fields";

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ): string;
      remove(widgetId: string): void;
      reset(widgetId: string): void;
    };
  }
}

const emptyEnquiry: ContactEnquiry = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const fields = [
  { name: "name", label: "Your name", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "phone", label: "Phone number (optional)", type: "tel" },
  { name: "subject", label: "Subject", type: "text" },
] as const;

export function ContactForm({
  siteKey,
  introduction,
}: {
  siteKey: string;
  introduction: string;
}) {
  const [values, setValues] = useState(emptyEnquiry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [token, setToken] = useState("");
  const widget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scriptReady || !siteKey || !widget.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(widget.current, {
      sitekey: siteKey,
      callback: (value) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => {
        setToken("");
        setMessage("The security check did not load. Please try again.");
      },
    });
    return () => window.turnstile?.remove(widgetId);
  }, [scriptReady, siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    const validation = contactEnquirySchema.safeParse(values);
    if (!validation.success) {
      setErrors(
        Object.fromEntries(
          validation.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }
    if (!token) {
      setMessage("Complete the security check before sending your message.");
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: validation.data,
          turnstileToken: token,
        }),
      });
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("enquiryReceived" in result) ||
        result.enquiryReceived !== true
      ) {
        const serverMessage =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Your message could not be sent. Please try again.";
        throw new Error(serverMessage);
      }

      setValues(emptyEnquiry);
      setSuccess(true);
      setToken("");
      setMessage(
        "message" in result && typeof result.message === "string"
          ? result.message
          : "Thank you. Your message has been sent to the school.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Please try again.",
      );
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      {siteKey ? (
        <Script
          onLoad={() => setScriptReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}
      <h3 className="text-[clamp(28px,4vw,40px)]">Send a message</h3>
      <p className="mt-2">{introduction}</p>
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        {fields.map((field) => (
          <label className="grid gap-2 font-semibold" key={field.name}>
            {field.label}
            <input
              className="min-h-12 border-2 border-navy bg-white px-3 text-ink"
              maxLength={field.name === "subject" ? 160 : 254}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setValues((current) => ({
                  ...current,
                  [field.name]: value,
                }));
              }}
              required={field.name !== "phone"}
              type={field.type}
              value={values[field.name]}
            />
            {errors[field.name] ? (
              <span className="text-sm font-normal text-red" role="alert">
                {errors[field.name]}
              </span>
            ) : null}
          </label>
        ))}
        <label className="grid gap-2 font-semibold">
          Message
          <textarea
            className="min-h-36 border-2 border-navy bg-white px-3 py-2 text-ink"
            maxLength={3000}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setValues((current) => ({
                ...current,
                message: value,
              }));
            }}
            required
            value={values.message}
          />
          {errors.message ? (
            <span className="text-sm font-normal text-red" role="alert">
              {errors.message}
            </span>
          ) : null}
        </label>
        {siteKey ? (
          <div aria-label="Security check" ref={widget} role="group" />
        ) : (
          <p className="border-l-4 border-red bg-[#fff3f3] p-3">
            The security check is not configured. Please call the school.
          </p>
        )}
        {message ? (
          <p
            className={`border-l-4 p-3 ${
              success
                ? "border-navy bg-mist text-navy"
                : "border-red bg-[#fff3f3]"
            }`}
            role={success ? "status" : "alert"}
          >
            {message}
          </p>
        ) : null}
        <button
          className="min-h-12 w-fit border-[3px] border-navy bg-yellow px-5 font-bold uppercase text-navy disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy || !token}
          type="submit"
        >
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
