import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonOwnProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonOwnProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

type ButtonAsLink = ButtonOwnProps & {
  href: string;
} & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "className" | "children" | "href"
  >;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary: "bg-yellow text-navy hover:bg-white",
  secondary:
    "border-[3px] border-navy bg-navy text-white hover:bg-navy-2 focus-visible:outline-yellow",
  outline:
    "border-[3px] border-navy bg-transparent text-navy hover:bg-navy hover:text-white",
};

function buttonClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex min-h-11 items-center justify-center gap-2 px-[30px] py-4 text-[17px] leading-[1.2] font-bold uppercase tracking-[0.06em]",
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const {
      href,
      variant = "primary",
      className,
      children,
      ...rest
    } = props as ButtonAsLink;

    return (
      <Link href={href} className={buttonClasses(variant, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    className,
    children,
    ...rest
  } = props as ButtonAsButton;

  return (
    <button
      type="button"
      className={buttonClasses(variant, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
