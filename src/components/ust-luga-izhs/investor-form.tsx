"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Status = "idle" | "submitting" | "success" | "error";

// Прогрессивно форматирует ввод в "+7 (___) ___-__-__" по мере набора,
// отбрасывая ведущую "7"/"8" (её всегда подставляет сам префикс "+7").
function formatPhoneInput(rawValue: string): string {
  let digits = rawValue.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (!digits) return "";

  let result = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) result += ")";
  if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`;
  return result;
}

export function InvestorForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || status === "submitting") return;

    const formData = new FormData(event.currentTarget);
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/ust-luga-izhs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          honeypot: formData.get("company"),
          consentGiven: consent,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.startsWith("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setStatus("success");

        // Сразу стартуем скачивание — кнопка "Скачать презентацию" остаётся
        // на странице как запасной вариант, если браузер заблокировал
        // автоскачивание или человек закрыл системный диалог сохранения.
        const link = document.createElement("a");
        link.href = url;
        link.download = "ust-luga-izhs-presentation.pdf";
        link.click();
        return;
      }

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setMessage(data.error || "Не получилось отправить заявку, попробуйте ещё раз");
        setStatus("error");
        return;
      }

      // success: true без PDF — заявка от бота (honeypot, боту это не
      // видно) либо лид создан, но скачивание из S3 не удалось.
      setStatus("success");
      if (data.downloadFailed) {
        setMessage("Заявка принята, но скачать презентацию сейчас не получилось — пришлём её вам отдельно.");
      }
    } catch {
      setMessage("Не получилось отправить заявку, попробуйте ещё раз");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex max-w-[440px] flex-col gap-3 rounded-[4px] border border-line bg-surface p-6">
        <p className="text-[15px] font-bold">Заявка отправлена</p>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            download="ust-luga-izhs-presentation.pdf"
            className="rounded-[3px] bg-accent px-6 py-3 text-center text-[14px] font-bold text-accent-ink"
          >
            Скачать презентацию (PDF)
          </a>
        ) : (
          <p className="text-[13.5px] text-ink-secondary">
            {message || "Свяжемся с вами в течение дня, обычно быстрее."}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[440px] flex-col gap-4 rounded-[4px] border border-line bg-surface p-6"
    >
      <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
        Имя (необязательно)
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          placeholder="+7 (___) ___-__-__"
          className="rounded-[3px] border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus-visible:border-accent"
        />
      </label>

      {/* Honeypot: обычные посетители его не видят и не заполняют — не
          display:none/hidden, чтобы простые боты, игнорирующие такие поля,
          всё равно его заполнили. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      />

      <div className="flex items-start gap-2 text-[12px] leading-snug text-ink-secondary">
        <input
          type="checkbox"
          id="ust-luga-consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-accent"
        />
        <label htmlFor="ust-luga-consent">
          Нажимая кнопку, я соглашаюсь с{" "}
          <Link href="/privacy-policy" className="underline">
            политикой обработки персональных данных
          </Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={!consent || status === "submitting"}
        className="rounded-[3px] bg-accent px-6 py-3 text-[14px] font-bold text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Отправляю…" : "Получить презентацию PDF"}
      </button>

      {status === "error" ? <p className="text-[12px] text-accent">{message}</p> : null}
    </form>
  );
}
