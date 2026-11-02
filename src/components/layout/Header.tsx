import Image from "next/image";
import Link from "next/link";

import type { SiteSettings } from "@/content/defaults/site";

import { HeaderNav } from "./HeaderNav";

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 bg-navy px-10 py-3.5 text-white max-[821px]:px-5">
      <Link
        href="/"
        className="flex items-center gap-3.5 focus-visible:outline-yellow"
      >
        <span className="block bg-white px-[7px] py-[5px]">
          {settings.logo.src ? (
            <Image
              src={settings.logo.src}
              alt={settings.logo.alt}
              width={40}
              height={40}
              loading="eager"
              className="block size-10 object-contain"
            />
          ) : null}
        </span>
        <span>
          <b className="block font-display text-[26px] font-extrabold uppercase leading-none">
            {settings.schoolName}
          </b>
          <small className="text-xs font-semibold tracking-[0.2em] text-yellow">
            {settings.headerLocation}
          </small>
        </span>
      </Link>

      <HeaderNav
        items={settings.navigation.primary}
        menuLabel={settings.menuLabel}
        closeLabel={settings.closeLabel}
      />
    </header>
  );
}
