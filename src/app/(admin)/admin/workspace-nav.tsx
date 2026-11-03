"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminRole, AdminUser } from "@/lib/admin/auth";
import { logoutAction } from "./login/actions";

type NavigationItem = {
  label: string;
  href: string;
  roles: readonly AdminRole[];
  available?: boolean;
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Pages",
    href: "/admin/pages",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "News",
    href: "/admin/news",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Notices",
    href: "/admin/notices",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Events",
    href: "/admin/events",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "People",
    href: "/admin/people",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Study and facilities",
    href: "/admin/facilities",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Sports",
    href: "/admin/sports",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Achievements",
    href: "/admin/achievements",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Old Boys",
    href: "/admin/old-boys",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Questions (FAQs)",
    href: "/admin/faqs",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "History milestones",
    href: "/admin/timeline",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Subjects",
    href: "/admin/subjects",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Clubs",
    href: "/admin/clubs",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Extra pages",
    href: "/admin/extra-pages",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    roles: ["admin", "admissions"],
    available: true,
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    roles: ["admin", "admissions"],
    available: true,
  },
  {
    label: "Photos and files",
    href: "/admin/media",
    roles: ["admin", "editor"],
    available: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    roles: ["admin"],
    available: true,
  },
  { label: "Users", href: "/admin/users", roles: ["admin"], available: true },
  {
    label: "Help",
    href: "/admin/help",
    roles: ["admin", "editor"],
    available: true,
  },
];

function NavigationLink({
  item,
  pathname,
}: {
  item: NavigationItem;
  pathname: string;
}) {
  if (!item.available) {
    return (
      <span aria-disabled="true" className="admin-nav-link admin-nav-disabled">
        <span>{item.label}</span>
        <span className="admin-coming-soon">Later</span>
      </span>
    );
  }

  const active =
    pathname === item.href ||
    (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`admin-nav-link${active ? " admin-nav-active" : ""}`}
      href={item.href}
    >
      {item.label}
    </Link>
  );
}

function roleLabel(role: AdminRole) {
  if (role === "admin") return "Administrator";
  if (role === "admissions") return "Admissions";
  return "Editor";
}

export function WorkspaceNav({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const items = navigation.filter((item) => item.roles.includes(user.role));
  const availableItems = items.filter((item) => item.available);
  const mobileItems = availableItems.slice(0, 5);
  const moreMobileItems = availableItems.slice(5);

  return (
    <>
      <aside aria-label="School office navigation" className="admin-sidebar">
        <Link
          className="admin-brand"
          href={user.role === "admissions" ? "/admin/applications" : "/admin"}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="admin-brand-mark"
            height={42}
            priority
            src="/crest.png"
            width={42}
          />
          <span>
            <strong>School office</strong>
            <small>St. Joseph&apos;s College, Ombaci</small>
          </span>
        </Link>
        <form action={logoutAction} className="admin-mobile-signout">
          <button className="admin-signout" type="submit">
            Sign out
          </button>
        </form>
        <nav className="admin-nav">
          {items.map((item) => (
            <NavigationLink item={item} key={item.href} pathname={pathname} />
          ))}
        </nav>
        <div className="admin-account">
          <span className="admin-account-name">{user.email}</span>
          <span className="admin-account-role">{roleLabel(user.role)}</span>
          <form action={logoutAction}>
            <button className="admin-signout" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <nav aria-label="Quick navigation" className="admin-mobile-nav">
        {mobileItems.map((item) => (
          <NavigationLink item={item} key={item.href} pathname={pathname} />
        ))}
        {moreMobileItems.length > 0 ? (
          <details className="admin-mobile-more">
            <summary>More</summary>
            <div className="admin-mobile-more-menu">
              {moreMobileItems.map((item) => (
                <NavigationLink
                  item={item}
                  key={item.href}
                  pathname={pathname}
                />
              ))}
            </div>
          </details>
        ) : null}
      </nav>
    </>
  );
}
