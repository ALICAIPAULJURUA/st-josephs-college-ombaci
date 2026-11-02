import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../globals.css";

import styles from "./admin.module.css";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "School office",
    template: "%s | School office",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={styles.adminBody}>{children}</body>
    </html>
  );
}
