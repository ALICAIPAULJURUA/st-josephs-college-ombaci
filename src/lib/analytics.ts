export type AnalyticsEvent =
  "apply_click" | "whatsapp_click" | "assistant_open";

type Plausible = (
  event: string,
  options?: { props?: Record<string, string> },
) => void;

declare global {
  interface Window {
    plausible?: Plausible;
    umami?: { track: Plausible };
  }
}

export function trackEvent(name: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  window.plausible?.(name);
  window.umami?.track(name);
}
