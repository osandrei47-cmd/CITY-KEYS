import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-[3px] px-6 py-3 text-[14px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-[#e3ac6c]",
  ghost:
    "bg-transparent text-ink border border-ink/30 hover:border-ink/60",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
