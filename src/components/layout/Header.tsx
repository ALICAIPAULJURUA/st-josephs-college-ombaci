import Image from "next/image";
import Link from "next/link";

import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 bg-navy px-10 py-3.5 text-white max-[821px]:px-5">
      <Link
        href="/"
        className="flex items-center gap-3.5 focus-visible:outline-yellow"
      >
        <span className="block bg-white px-[7px] py-[5px]">
          <Image
            src="/crest.png"
            alt="St. Joseph's College Ombaci crest"
            width={40}
            height={47}
            loading="eager"
            className="block h-[47px] w-10 object-contain"
          />
        </span>
        <span>
          <b className="block font-display text-[26px] font-extrabold uppercase leading-none">
            St. Joseph&apos;s College
          </b>
          <small className="text-xs font-semibold tracking-[0.2em] text-yellow">
            OMBACI · ARUA CITY
          </small>
        </span>
      </Link>

      <HeaderNav />
    </header>
  );
}
