import Link from "next/link";

import type { SiteSettings } from "@/content/defaults/site";
import { safeHref } from "@/lib/links";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-footer px-10 pb-[130px] pt-14 text-white max-[821px]:px-5">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-14 gap-y-9">
        <div className="flex-[2_1_300px]">
          <div className="font-display text-[34px] font-black uppercase leading-none">
            {settings.schoolName}
          </div>
          <div className="mt-2 italic text-yellow">{settings.motto}</div>
        </div>

        <div className="flex-1 basis-[200px] text-[15px] leading-[1.8]">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
            {settings.visitHeading}
          </h2>
          {settings.address}
          <br />
          {settings.city}, {settings.district}, {settings.country}
        </div>

        <div className="flex-1 basis-[200px] text-[15px] leading-[1.8]">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
            {settings.contactHeading}
          </h2>
          <div>{settings.phone}</div>
          <div className="mt-2">{settings.email}</div>
        </div>

        {settings.navigation.footer.map((group) => (
          <nav
            aria-label={group.title}
            className="flex-1 basis-[200px] text-[15px] leading-[1.8]"
            key={group.title}
          >
            <h2 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
              {group.title}
            </h2>
            {group.links.map((link) => (
              <div key={link.href}>
                <Link
                  href={safeHref(link.href)}
                  className="hover:text-yellow focus-visible:outline-yellow"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
