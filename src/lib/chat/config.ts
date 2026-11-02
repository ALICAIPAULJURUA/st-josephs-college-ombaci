export const OPENROUTER_ENDPOINT =
  "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";

export function getOpenRouterApiKey() {
  return process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
}

export function isChatProviderConfigured() {
  return Boolean(getOpenRouterApiKey() && process.env.SESSION_SECRET);
}

export function isChatConfigured() {
  return Boolean(
    isChatProviderConfigured() &&
      process.env.TURNSTILE_SITE_KEY &&
      process.env.TURNSTILE_SECRET_KEY,
  );
}

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
}
