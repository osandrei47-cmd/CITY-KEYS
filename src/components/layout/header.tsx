"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "./container";
import { mainNav } from "@/lib/nav";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-sans text-[16px] font-extrabold tracking-tight"
          onClick={() => setOpen(false)}
        >
          CITY KEYS
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-[5px] p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="sr-only">Меню</span>
          <span
            className={`block h-[2px] w-5 bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-[2px] w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-[2px] w-5 bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </Container>

      <nav
        id="main-nav"
        className={`overflow-hidden border-t border-line bg-bg transition-[max-height] duration-300 ${
          open ? "max-h-[500px]" : "max-h-0 border-t-0"
        }`}
      >
        <Container className="flex flex-col gap-1 py-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-[3px] px-2 py-2.5 text-[15px] text-ink-secondary hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </nav>
    </header>
  );
}
