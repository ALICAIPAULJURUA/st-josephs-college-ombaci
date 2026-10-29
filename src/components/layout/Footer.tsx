import Link from "next/link";

import { Placeholder } from "@/components/ui/Placeholder";
import { footerExplore } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="bg-footer px-10 pb-[130px] pt-14 text-white max-[821px]:px-5">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-14 gap-y-9">
        <div className="flex-[2_1_300px]">
          <div className="font-display text-[34px] font-black uppercase leading-none">
            St. Joseph&apos;s College, Ombaci
          </div>
          <div className="mt-2 italic text-yellow">Primus inter pares</div>
        </div>

        <div className="flex-1 basis-[200px] text-[15px] leading-[1.8]">
          <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
            Visit
          </h4>
          Ombaci, Ayivu Division
          <br />
          Arua City, West Nile, Uganda
        </div>

        <div className="flex-1 basis-[200px] text-[15px] leading-[1.8]">
          <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
            Contact
          </h4>
          <div>
            <Placeholder>School phone</Placeholder>
          </div>
          <div className="mt-2">
            <Placeholder>School email</Placeholder>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="flex-1 basis-[200px] text-[15px] leading-[1.8]"
        >
          <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-soft">
            Explore
          </h4>
          {footerExplore.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className="hover:text-yellow focus-visible:outline-yellow"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
