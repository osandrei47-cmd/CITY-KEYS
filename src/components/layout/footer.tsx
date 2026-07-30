import Link from "next/link";
import { Container } from "./container";
import { mainNav, legalNav, contacts } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-sans text-[16px] font-extrabold tracking-tight">
            CITY KEYS
          </span>
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            {contacts.address}
          </p>
          <p className="text-[13px] text-ink-secondary">
            {contacts.phone} · {contacts.email}
          </p>
          <div className="mt-1 flex gap-4 text-[13px] font-semibold">
            <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="text-accent">
              Telegram
            </a>
            <a href={contacts.max} target="_blank" rel="noopener noreferrer" className="text-accent">
              MAX
            </a>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] text-ink-secondary hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          {legalNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] text-ink-secondary underline hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Container>

      <Container className="border-t border-line py-6">
        <p className="text-[11.5px] text-ink-secondary/70">
          © CITY KEYS · ИП Осипов Андрей Владимирович · ИНН 470705914908 · ОГРНИП 317470400007509
        </p>
      </Container>
    </footer>
  );
}
