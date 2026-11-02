"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import {
  isChatMessage,
  welcomeMessage,
  type ChatMessage,
} from "@/components/floating/chat";
import type { SiteSettings } from "@/content/defaults/site";

const AssistantPanel = dynamic(() => import("./AssistantPanel"), {
  ssr: false,
});

const STORAGE_KEY = "ombacian-assistant-conversation-v1";
const VERIFIED_STORAGE_KEY = "ombacian-assistant-verified-v1";
const serviceUnavailableMessage =
  "I can't answer right now. Please call the school or contact us online.";

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

function readVerifiedState() {
  try {
    return sessionStorage.getItem(VERIFIED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function storeVerifiedState(verified: boolean) {
  try {
    if (verified) {
      sessionStorage.setItem(VERIFIED_STORAGE_KEY, "true");
    } else {
      sessionStorage.removeItem(VERIFIED_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

async function readAssistantStream(
  response: Response,
  onText: (text: string) => void,
) {
  if (!response.body) throw new Error("The assistant returned no response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let complete = false;

  function readLine(line: string) {
    if (!line.startsWith("data:")) return false;
    const data = line.slice(5).trim();
    if (data === "[DONE]") return true;
    const text: unknown = JSON.parse(data);
    if (typeof text !== "string") {
      throw new Error("The assistant returned an invalid response.");
    }
    onText(text);
    return false;
  }

  try {
    while (!complete) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (readLine(line)) {
          complete = true;
          break;
        }
      }
    }
    if (buffer.trim()) readLine(buffer);
  } finally {
    reader.releaseLock();
  }
}

export function AssistantChat({
  open,
  onClose,
  settings,
  whatsappHref,
  assistantReady,
  turnstileSiteKey,
}: {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
  whatsappHref: string | null;
  assistantReady: boolean;
  turnstileSiteKey: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => readStoredMessages() ?? [welcomeMessage],
  );
  const [isReplying, setIsReplying] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [hasVerified, setHasVerified] = useState(readVerifiedState);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    if (messages.length <= 1) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      return;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  async function sendMessage(text: string) {
    const question = text.trim().slice(0, 1000);
    if (!question || isReplying) return;

    if (!assistantReady) {
      setChatError(
        "The assistant is visible, but its security check is not configured yet. Please use WhatsApp or contact the school.",
      );
      return;
    }

    if (!hasVerified && !challengeToken) {
      setChatError("Complete the security check before asking a question.");
      return;
    }

    const userMessage = {
      id: createMessageId(),
      role: "user" as const,
      text: question,
    };
    const answerId = createMessageId();
    const conversation = [
      ...messages.filter((message) => message.id !== "welcome"),
      userMessage,
    ].slice(-10);
    setMessages((current) => [
      ...current,
      userMessage,
      { id: answerId, role: "assistant", text: "" },
    ]);
    setChatError("");
    setIsReplying(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map(({ role, text: content }) => ({
            role,
            content,
          })),
          ...(!hasVerified ? { turnstileToken: challengeToken } : {}),
        }),
      });

      if (!response.ok) {
        let errorMessage = "The assistant is temporarily unavailable.";
        try {
          const result: unknown = await response.json();
          if (
            result &&
            typeof result === "object" &&
            "error" in result &&
            typeof result.error === "string"
          ) {
            errorMessage = result.error;
          }
        } catch {
          setChatError(errorMessage);
        }

        if (errorMessage.toLowerCase().includes("security check")) {
          setHasVerified(false);
          storeVerifiedState(false);
          setChallengeToken("");
        }
        throw new Error(errorMessage);
      }

      setHasVerified(true);
      storeVerifiedState(true);
      setChallengeToken("");

      let answer = "";
      await readAssistantStream(response, (textChunk) => {
        answer += textChunk;
        setMessages((current) =>
          current.map((message) =>
            message.id === answerId ? { ...message, text: answer } : message,
          ),
        );
      });

      if (!answer.trim()) throw new Error("The assistant returned no answer.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "The assistant is temporarily unavailable.";
      setChatError(errorMessage);
      setMessages((current) =>
        current.map((message) =>
          message.id === answerId
            ? {
                ...message,
                text: serviceUnavailableMessage,
              }
            : message,
        ),
      );
    } finally {
      setIsReplying(false);
    }
  }

  if (!open) return null;

  return (
    <AssistantPanel
      messages={messages}
      isReplying={isReplying}
      errorMessage={chatError}
      onClose={onClose}
      onSend={sendMessage}
      whatsappHref={whatsappHref}
      contactHref={settings.contactHref}
      phone={settings.phone}
      siteKey={turnstileSiteKey}
      assistantReady={assistantReady}
      needsChallenge={assistantReady && !hasVerified}
      challengeToken={challengeToken}
      onChallengeToken={setChallengeToken}
    />
  );
}
