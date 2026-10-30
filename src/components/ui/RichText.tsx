import type { ReactNode } from "react";

import { safeHref } from "@/lib/links";

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  format?: number;
  url?: string;
  listType?: string;
  fields?: {
    url?: string;
    newTab?: boolean;
    linkType?: string;
  };
  children?: LexicalNode[];
  root?: LexicalNode;
};

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_UNDERLINE = 8;
const IS_CODE = 16;

function headingTag(tag: string | undefined): "h2" | "h3" | "h4" | "h5" | "h6" {
  switch (tag) {
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    default:
      return "h2";
  }
}

function linkUrl(node: LexicalNode): string | undefined {
  return node.fields?.url ?? node.url;
}

function renderText(node: LexicalNode, index: number): ReactNode {
  const format = typeof node.format === "number" ? node.format : 0;
  let content: ReactNode = node.text ?? "";

  if (format & IS_BOLD) content = <strong>{content}</strong>;
  if (format & IS_ITALIC) content = <em>{content}</em>;
  if (format & IS_UNDERLINE) content = <u>{content}</u>;
  if (format & IS_CODE) content = <code>{content}</code>;

  return <span key={index}>{content}</span>;
}

function renderChildren(children: LexicalNode[] | undefined): ReactNode {
  if (!children?.length) return null;
  return children.map((child, index) => renderNode(child, index));
}

function renderNode(node: LexicalNode, index: number): ReactNode {
  switch (node.type) {
    case "root":
      return <div key={index}>{renderChildren(node.children)}</div>;
    case "paragraph":
      return (
        <p key={index} className="mb-4 last:mb-0 leading-[1.5]">
          {renderChildren(node.children)}
        </p>
      );
    case "heading": {
      const Tag = headingTag(node.tag);
      return (
        <Tag key={index} className="mb-4 leading-[1.15]">
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "list": {
      const Tag = node.listType === "number" || node.tag === "ol" ? "ol" : "ul";
      return (
        <Tag
          key={index}
          className="mb-4 list-inside list-disc leading-[1.5] last:mb-0"
        >
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "listitem":
    case "list-item":
      return (
        <li key={index} className="leading-[1.5]">
          {renderChildren(node.children)}
        </li>
      );
    case "quote":
      return (
        <blockquote
          key={index}
          className="mb-4 border-l-4 border-navy pl-4 italic leading-[1.5] last:mb-0"
        >
          {renderChildren(node.children)}
        </blockquote>
      );
    case "link":
    case "autolink": {
      const href = safeHref(linkUrl(node), "");
      if (!href) return <span key={index}>{renderChildren(node.children)}</span>;
      const newTab = Boolean(node.fields?.newTab);
      return (
        <a
          key={index}
          href={href}
          className="underline underline-offset-2"
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {renderChildren(node.children)}
        </a>
      );
    }
    case "linebreak":
      return <br key={index} />;
    case "text":
      return renderText(node, index);
    default:
      return <span key={index}>{renderChildren(node.children)}</span>;
  }
}

export function RichText({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  if (!value || typeof value !== "object") return null;

  const node = value as LexicalNode;
  const root = node.root ?? (node.type === "root" ? node : null);
  if (!root) return null;

  return <div className={className}>{renderNode(root, 0)}</div>;
}
