"use client";

import Link from "next/link";
import { useState } from "react";

import { primaryNavigation } from "@/lib/navigation";

function submenuId(label: string) {
  return `nav-${label.toLowerCase().replace(/\s+/g, "-")}`;
}

export function HeaderNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeAll() {
    setOpenDropdown(null);
    setMobileOpen(false);
  }

  return (
    <nav
      aria-label="Main"
      className="ml-auto flex items-center"
      onKeyDown={(event) => {
        if (event.key === "Escape") closeAll();
      }}
    >
      <button
        type="button"
        className="inline-flex min-h-11 items-center border-[3px] border-white px-4 py-2 text-[15px] font-semibold uppercase tracking-[0.08em] hover:border-yellow focus-visible:outline-yellow min-[821px]:hidden"
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? "Close" : "Menu"}
      </button>

      <ul className="hidden items-center gap-x-[26px] gap-y-1 min-[821px]:flex">
        {primaryNavigation.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openDropdown === item.label;
          const id = submenuId(item.label);

          return (
            <li
              key={item.href}
              className="relative"
              onMouseEnter={() => {
                if (hasChildren) setOpenDropdown(item.label);
              }}
              onMouseLeave={() => {
                if (hasChildren) setOpenDropdown(null);
              }}
              onFocus={() => {
                if (hasChildren) setOpenDropdown(item.label);
              }}
              onBlur={(event) => {
                if (
                  hasChildren &&
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  setOpenDropdown(null);
                }
              }}
            >
              <Link
                href={item.href}
                className="nav-link block py-2 text-[15px] font-semibold focus-visible:outline-yellow"
                aria-haspopup={hasChildren ? "true" : undefined}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-controls={hasChildren ? id : undefined}
              >
                {item.label}
              </Link>

              {hasChildren ? (
                <div
                  className={`absolute left-0 top-full z-30 pt-2 ${
                    isOpen ? "block" : "hidden"
                  }`}
                >
                  <ul
                    id={id}
                    className="min-w-[220px] border-[3px] border-navy bg-white py-2 text-navy"
                  >
                    {item.children?.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 text-[15px] font-semibold hover:bg-yellow focus-visible:bg-yellow"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div
        id="mobile-navigation"
        className={`absolute left-0 right-0 top-full z-30 border-y-[3px] border-navy bg-white text-navy min-[821px]:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <ul>
          {primaryNavigation.map((item) => (
            <li
              key={item.href}
              className="border-b-2 border-line last:border-b-0"
            >
              <Link
                href={item.href}
                className="block px-5 py-4 font-display text-[28px] font-extrabold uppercase leading-none"
                onClick={closeAll}
              >
                {item.label}
              </Link>

              {item.children ? (
                <ul className="border-t border-line bg-mist px-5 py-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block py-2 text-[15px] font-semibold"
                        onClick={closeAll}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
