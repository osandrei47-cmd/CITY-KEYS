"use client";

import { useId, useMemo, useState } from "react";

const PRICE_MIN = 1_000_000;
const PRICE_MAX = 50_000_000;
const PRICE_STEP = 100_000;

const DOWN_PAYMENT_MIN = 15;
const DOWN_PAYMENT_MAX = 90;

const TERM_MIN = 1;
const TERM_MAX = 30;

const RATE_MIN = 15;
const RATE_MAX = 25;
const RATE_STEP = 0.1;

const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

function formatRub(value: number) {
  return `${rub.format(Math.round(value))} ₽`;
}

function formatYears(years: number) {
  const mod10 = years % 10;
  const mod100 = years % 100;
  let word = "лет";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "год";
    else if (mod10 >= 2 && mod10 <= 4) word = "года";
  }
  return `${years} ${word}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabel,
  fillMin,
  fillMax,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueLabel: string;
  fillMin?: number;
  fillMax?: number;
}) {
  const id = useId();
  const percent = ((value - (fillMin ?? min)) / ((fillMax ?? max) - (fillMin ?? min))) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-bold text-ink-secondary">
          {label}
        </label>
        <span className="text-[15px] font-bold text-ink">{valueLabel}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--accent) ${percent}%, var(--line) ${percent}%)`,
        }}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-accent"
      />
    </div>
  );
}

export function MortgageCalculator() {
  const [price, setPrice] = useState(6_000_000);
  const [priceInput, setPriceInput] = useState(rub.format(price));
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(18);

  const { monthlyPayment, totalPayments, overpayment, downPaymentAmount, principal } =
    useMemo(() => {
      const downPaymentAmount = price * (downPaymentPercent / 100);
      const principal = Math.max(price - downPaymentAmount, 0);
      const monthlyRate = rate / 100 / 12;
      const n = years * 12;
      const monthlyPayment =
        principal *
        ((monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
      const totalPayments = monthlyPayment * n;
      const overpayment = totalPayments - principal;
      return { monthlyPayment, totalPayments, overpayment, downPaymentAmount, principal };
    }, [price, downPaymentPercent, years, rate]);

  function commitPriceInput(raw: string) {
    const digits = raw.replace(/\D/g, "");
    const parsed = digits ? clamp(Number(digits), PRICE_MIN, PRICE_MAX) : PRICE_MIN;
    setPrice(parsed);
    setPriceInput(rub.format(parsed));
  }

  return (
    <div className="grid gap-6 rounded-[4px] border border-line bg-surface p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <label className="text-[13px] font-bold text-ink-secondary">Стоимость объекта</label>
            <input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={(e) => commitPriceInput(e.target.value)}
              className="w-[160px] rounded-[3px] border border-line bg-surface-2 px-2.5 py-1.5 text-right text-[15px] font-bold text-ink outline-none focus-visible:border-accent"
            />
          </div>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={price}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPrice(next);
              setPriceInput(rub.format(next));
            }}
            style={{
              background: `linear-gradient(to right, var(--accent) ${
                ((price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
              }%, var(--line) ${((price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-accent"
          />
        </div>

        <Slider
          label="Первый взнос"
          value={downPaymentPercent}
          min={DOWN_PAYMENT_MIN}
          max={DOWN_PAYMENT_MAX}
          step={1}
          onChange={setDownPaymentPercent}
          valueLabel={`${downPaymentPercent}% · ${formatRub(downPaymentAmount)}`}
        />

        <Slider
          label="Срок кредита"
          value={years}
          min={TERM_MIN}
          max={TERM_MAX}
          step={1}
          onChange={setYears}
          valueLabel={formatYears(years)}
        />

        <Slider
          label="Процентная ставка"
          value={rate}
          min={RATE_MIN}
          max={RATE_MAX}
          step={RATE_STEP}
          onChange={setRate}
          valueLabel={`${rate.toFixed(1)}%`}
        />

        <p className="text-[12px] leading-relaxed text-ink-secondary">
          Расчёт по аннуитетной схеме — платёж одинаковый на весь срок.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-5 rounded-[4px] bg-surface-2 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-ink-secondary">Ежемесячный платёж</span>
          <span className="text-[30px] font-extrabold leading-none text-accent">
            {formatRub(monthlyPayment)}
          </span>
        </div>
        <div className="h-px bg-line" />
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-ink-secondary">Сумма кредита</span>
          <span className="text-[17px] font-bold text-ink">{formatRub(principal)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-ink-secondary">Переплата за весь срок</span>
          <span className="text-[17px] font-bold text-ink">{formatRub(overpayment)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-ink-secondary">Итоговая сумма выплат</span>
          <span className="text-[17px] font-bold text-ink">{formatRub(totalPayments)}</span>
        </div>
      </div>
    </div>
  );
}
