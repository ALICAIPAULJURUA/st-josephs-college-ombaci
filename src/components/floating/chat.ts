export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hello, I can help with questions about the school. What would you like to know?",
};

export const suggestedQuestions = [
  "How do I apply for Senior One?",
  "What does a boarder bring?",
  "When can I visit?",
] as const;

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    value.id.length <= 100 &&
    "role" in value &&
    (value.role === "assistant" || value.role === "user") &&
    "text" in value &&
    typeof value.text === "string" &&
    value.text.length <= 5000
  );
}
