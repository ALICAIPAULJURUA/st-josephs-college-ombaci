import { siteSettings } from "@/content/site";

export function buildWhatsAppHref(
  number: string | undefined,
  message: string = siteSettings.whatsappMessage,
): string | null {
  const digits = number?.replace(/\D/g, "") ?? "";

  if (!digits) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
