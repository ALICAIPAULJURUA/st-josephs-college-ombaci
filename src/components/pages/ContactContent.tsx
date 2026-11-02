import type { SiteSettings } from "@/content/defaults/site";

import { PublicClientFeature } from "./PublicClientFeature";

export function ContactContent({
  settings,
  formIntro,
}: {
  settings: SiteSettings;
  formIntro: string;
}) {
  const confirmedEmail =
    settings.email && !settings.email.startsWith("SAMPLE ONLY");
  const confirmedMapPin =
    settings.mapPin && !settings.mapPin.startsWith("SAMPLE ONLY");
  const confirmedPhone =
    settings.phone && !settings.phone.startsWith("SAMPLE ONLY");
  const whatsappNumber = settings.whatsappNumber ?? "";
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const whatsappNumberIsUsable =
    /^\+?[\d\s()-]+$/.test(whatsappNumber) && whatsappDigits.length > 0;

  return (
    <section className="mx-auto grid max-w-[1000px] gap-8 px-10 py-12 md:grid-cols-2 max-[821px]:px-5">
      <div>
        <h2 className="text-[clamp(32px,5vw,56px)]">Visit</h2>
        <address className="mt-4 not-italic leading-7">
          {settings.address}
          <br />
          {settings.city}, {settings.district}
          <br />
          {settings.country}
        </address>
        <p className="mt-4">Office hours: {settings.officeHours}</p>
        <p className="mt-2">
          Map:{" "}
          {confirmedMapPin ? (
            <a
              className="font-semibold underline"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapPin)}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open the confirmed school location
            </a>
          ) : (
            settings.mapPin
          )}
        </p>
      </div>
      <div>
        <h2 className="text-[clamp(32px,5vw,56px)]">Contact</h2>
        <p className="mt-4">
          Phone:{" "}
          {confirmedPhone ? (
            <a
              className="font-semibold underline"
              href={`tel:${settings.phone}`}
            >
              {settings.phone}
            </a>
          ) : (
            settings.phone
          )}
        </p>
        <p className="mt-2">
          Email:{" "}
          {confirmedEmail ? (
            <a
              className="font-semibold underline"
              href={`mailto:${settings.email}`}
            >
              {settings.email}
            </a>
          ) : (
            settings.email
          )}
        </p>
        {whatsappNumber ? (
          <p className="mt-2">
            WhatsApp:{" "}
            {whatsappNumberIsUsable ? (
              <a
                className="font-semibold underline"
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(settings.whatsappMessage)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {settings.whatsappLabel}
              </a>
            ) : (
              whatsappNumber
            )}
          </p>
        ) : null}
        <PublicClientFeature
          feature="contact"
          introduction={formIntro}
          siteKey={process.env.TURNSTILE_SITE_KEY ?? ""}
        />
      </div>
    </section>
  );
}
