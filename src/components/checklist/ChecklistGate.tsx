"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ChecklistItems } from "./ChecklistItems";

type ChecklistData = {
  participantName: string;
  dealTitle: string;
  listingTitle: string | null;
  listingAddress: string | null;
  items: { name: string; received: boolean; comment: string | null }[];
};

// +7 предзаполнен и не удаляется руками (см. handlePhoneChange) — участнику
// остаётся только дописать оставшиеся цифры, курсор при заходе на страницу
// сразу стоит после префикса (см. useEffect ниже).
const PHONE_PREFIX = "+7 ";

// Токен из URL — не единственная проверка. Пока телефон не подтверждён,
// данные сделки не отрисованы на странице (verify их вообще не отдаёт при
// несовпадении) — форма ниже единственный путь к содержимому чек-листа.
export function ChecklistGate({ token }: { token: string }) {
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = phoneInputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Не даём стереть/испортить префикс — если пользователь его удалил
    // (например, выделил всё и начал печатать заново), просто
    // восстанавливаем "+7 " и считаем это пустым вводом.
    setPhone(value.startsWith("+7") ? value : PHONE_PREFIX);
  }

  const hasDigitsAfterPrefix = phone.trim().length > PHONE_PREFIX.trim().length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasDigitsAfterPrefix) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/checklist/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Не удалось проверить телефон");
        return;
      }
      setVerifiedPhone(phone);
      setData(json);
    } catch {
      setError("Не удалось связаться с сервером, попробуйте ещё раз");
    } finally {
      setLoading(false);
    }
  }

  if (data && verifiedPhone) {
    return (
      <ChecklistItems
        token={token}
        phone={verifiedPhone}
        participantName={data.participantName}
        dealTitle={data.dealTitle}
        listingTitle={data.listingTitle}
        listingAddress={data.listingAddress}
        initialItems={data.items}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[24px] font-extrabold">Чек-лист документов</h1>
      <p className="text-[14px] text-ink-secondary">
        Чтобы посмотреть список документов, подтвердите номер телефона, на который оформлена сделка.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={phoneInputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={handlePhoneChange}
          className="rounded-[3px] border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none focus-visible:border-accent"
        />
        {error ? <p className="text-[13.5px] text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !hasDigitsAfterPrefix}
          className="inline-flex items-center justify-center rounded-[3px] bg-accent px-6 py-3 text-[14px] font-bold text-accent-ink transition-colors hover:bg-[#e3ac6c] disabled:opacity-50"
        >
          {loading ? "Проверяем..." : "Показать чек-лист"}
        </button>
      </form>
    </div>
  );
}
