import Link from "next/link";

import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ContentItem } from "@/lib/content";

function value(fields: Record<string, unknown>, key: string) {
  const field = fields[key];
  return typeof field === "string" ? field : "";
}

export function NewsStrip({
  items,
  label,
  heading,
}: {
  items: readonly ContentItem[];
  label: string;
  heading: string;
}) {
  const featured = items.filter((item) => item.fields.featured === true);
  if (featured.length === 0) return null;

  return (
    <section className="bg-white py-16 max-[821px]:py-12">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel className="mb-3.5">{label}</SectionLabel>
        <h2 className="text-[clamp(42px,5vw,68px)] leading-[0.9]">{heading}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {featured.map((item) => (
            <article className="border-t-[3px] border-navy py-5" key={item.id}>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-navy-2">
                {value(item.fields, "date")}
              </p>
              <h3 className="mt-2 text-[32px] leading-none">
                <Link className="hover:underline" href={`/news/${item.slug}`}>
                  {value(item.fields, "title")}
                </Link>
              </h3>
              <p className="mt-3 leading-[1.5]">
                {value(item.fields, "summary")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
