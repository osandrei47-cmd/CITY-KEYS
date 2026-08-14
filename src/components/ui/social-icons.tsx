type IconProps = { className?: string };

const base = "h-5 w-5";

export function IconPhone({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.9 21 3 12.1 3 1c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.2 1.1L6.6 10.8Z" />
    </svg>
  );
}

export function IconTelegram({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.85 6.8-1.65 7.78c-.12.56-.46.7-.93.43l-2.57-1.9-1.24 1.19c-.14.14-.25.25-.51.25l.18-2.6 4.74-4.28c.21-.18-.05-.29-.32-.11l-5.86 3.69-2.52-.79c-.55-.17-.56-.55.12-.81l9.84-3.79c.46-.17.86.11.72.94z" />
    </svg>
  );
}

export function IconWhatsapp({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.86 14.06c-.25.7-1.24 1.29-2.02 1.46-.55.12-1.26.21-3.66-.79-2.98-1.23-4.9-4.24-5.05-4.44-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.15.28.68 1.13 1.47 1.83 1.01.9 1.87 1.18 2.14 1.31.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.64.78 1.92.92.28.14.46.21.53.33.07.12.07.68-.18 1.38z" />
    </svg>
  );
}

export function IconVk({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <text x="12" y="16" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="currentColor" fontFamily="Arial, sans-serif">
        VK
      </text>
    </svg>
  );
}

export function IconMax({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <text x="12" y="16" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="currentColor" fontFamily="Arial, sans-serif">
        M
      </text>
    </svg>
  );
}
