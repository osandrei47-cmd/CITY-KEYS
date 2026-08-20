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
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  ariaLabel?: string;
}) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("http");
    // tel:/mailto: — не новая вкладка (это не "уход с сайта" в смысле
    // target="_blank"), но и не внутренний маршрут для next/link.
    const isSpecialScheme = href.startsWith("tel:") || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          aria-label={ariaLabel}
        >
          {children}
        </a>
      );
    }
    if (isSpecialScheme) {
      return (
        <a href={href} className={classes} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
