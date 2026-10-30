const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();

  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("#") && !trimmed.startsWith("#javascript")) return true;

  try {
    const url = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function safeHref(
  href: string | null | undefined,
  fallback = "/",
): string {
  if (!href) return fallback;
  return isSafeHref(href) ? href.trim() : fallback;
}
