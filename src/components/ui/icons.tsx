type IconProps = { className?: string };

const base = "h-6 w-6 text-accent";

// Если передан свой className — он полностью заменяет base (а не дополняет),
// чтобы конфликтующие утилиты (например, размер) не боролись за приоритет в каскаде.
function iconClassName(className: string) {
  return className || base;
}

export function IconScale({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M12 3v18M7 21h10M5 7l3.5-1.5L12 7M19 7l-3.5-1.5L12 7M5 7l-3 6a3 3 0 0 0 6 0l-3-6ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShieldCheck({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHandshake({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M2 12l4-3 4 3 2-2 2 2 4-3 4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9v6M18 9v6M9 13l-2 2a1.5 1.5 0 0 0 2 2l1-1M15 13l2 2a1.5 1.5 0 0 1-2 2l-1-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFileCheck({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M7 3h7l4 4v14H7V3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v4h4M10 14l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPercent({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M6 18L18 6M7.5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM16.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUmbrella({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M12 3C7 3 3 7.5 3 11h18c0-3.5-4-8-9-8ZM12 11v8a2 2 0 1 1-4 0M12 3v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLaptop({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M4 5h16v10H4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17.5h20L20.5 20h-17L2 17.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8l-2 2 2 2M14.5 8l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStar({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path
        d="M12 3l2.47 5.14 5.53.8-4 3.9.94 5.5L12 15.9l-4.94 2.44.94-5.5-4-3.9 5.53-.8L12 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconKey({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <circle cx="8" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 11l9 9M16 14l2.5 2.5M19 11l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRefresh({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHouse({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v10h12V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-6h4v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSteeringWheel({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v6M6.3 15.8l4.2-3.4M17.7 15.8l-4.2-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCarShield({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClassName(className)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h6M9.3 13.3h5.4l-.8-2H10.1l-.8 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.8" cy="15" r="0.7" />
      <circle cx="14.2" cy="15" r="0.7" />
    </svg>
  );
}
