"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  listingId,
  listingLabel,
}: {
  listingId?: number;
  listingLabel?: string;
}) {
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          message: formData.get("comment"),
          source: listingId ? "katalog-obyekt" : "kontakty-form",
          consentGiven: true,
          ...(listingId ? { listing: listingId } : {}),
        }),
      });

      if (!res.ok) throw new Error("request failed");

      setStatus("success");
      form.reset();
      setConsent(false);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex max-w-[440px] flex-col gap-2 rounded-[4px] border border-line bg-surface p-6">
        <p className="text-[15px] font-bold">Заявка отправлена</p>
        <p className="text-[13.5px] text-ink-secondary">
          Отвечаю в течение дня, обычно быстрее.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[440px] flex-col gap-4 rounded-[4px] border border-line bg-surface p-6"
    >
      {listingLabel ? (
        <p className="rounded-[3px] bg-surface-2 px-3 py-2 text-[12.5px] text-ink-secondary">
          Заявка по объекту: <span className="font-semibold text-ink">{listingLabel}</span>
        </p>
      ) : null}
      <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
        Имя
        <input
          type="text"
          name="name"
          required
          placeholder="Как к вам обращаться"
          className="rounded-[3px] border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus-visible:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
        Телефон
        <input
          type="tel"
          name="phone"
          required
          placeholder="+7 ___ ___-__-__"
          className="rounded-[3px] border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus-visible:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
        Комментарий (необязательно)
        <textarea
          name="comment"
          rows={3}
          className="rounded-[3px] border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus-visible:border-accent"
        />
      </label>

      <div className="flex items-start gap-2 text-[12px] leading-snug text-ink-secondary">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-accent"
        />
        <label htmlFor="consent">
          Нажимая кнопку «Оставить заявку», я соглашаюсь с{" "}
          <Link href="/privacy-policy" className="underline">
            политикой обработки персональных данных
          </Link>{" "}
          и даю{" "}
          <Link href="/personal-data-consent" className="underline">
            согласие на обработку персональных данных
          </Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={!consent || status === "submitting"}
        className="rounded-[3px] bg-accent px-6 py-3 text-[14px] font-bold text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Отправляю…" : "Оставить заявку"}
      </button>

      {status === "error" ? (
        <p className="text-[12px] text-accent">
          Не получилось отправить — попробуйте ещё раз или напишите в Telegram/MAX.
        </p>
      ) : (
        <p className="text-[11px] text-ink-secondary/70">
          Отвечаю в течение дня, обычно быстрее.
        </p>
      )}
    </form>
  );
}
