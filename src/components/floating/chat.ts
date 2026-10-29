export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hello, I can answer questions about admissions, boarding, fees and visiting the school. What would you like to know?",
};

export const suggestedQuestions = [
  "How do I apply for Senior One?",
  "What does a boarder bring?",
  "When can I visit?",
] as const;

export const stubReply =
  "The live assistant is not connected yet. Please use the school contact page or WhatsApp for help.";

export const stubReplyWithoutWhatsApp =
  "The live assistant is not connected yet. Please use the school contact page for help.";

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<ChatMessage>;

  return (
    typeof message.id === "string" &&
    (message.role === "assistant" || message.role === "user") &&
    typeof message.text === "string"
  );
}
