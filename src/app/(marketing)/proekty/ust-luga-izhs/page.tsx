import type { Metadata } from "next";
import Image from "next/image";
import { Route, Layers, Zap, Rocket, Factory, TrendingUp } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatRow } from "@/components/ui/stat";
import { InvestorForm } from "@/components/ust-luga-izhs/investor-form";
import { contacts } from "@/lib/nav";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import { buildUstLugaIzhsJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

const TITLE = "Инвестиции в загородный модульный кластер ИЖС — Усть-Луга | CITY KEYS";
const DESCRIPTION =
  "500 соток в частной собственности у порта Усть-Луга: 90 дней до первой выручки, доходность 20–22% годовых. Готовая юридическая основа и инфраструктура.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/proekty/ust-luga-izhs",
    image: {
      url: "/api/media/file/2026-08-07_16-33-31.png",
      width: 1136,
      height: 766,
      alt: "Аэрообзор участка и порта Усть-Луга с обозначением ключевых объектов",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
};

const landPoints = [
  {
    title: "Общая площадь",
    text: "500 соток, земли населённых пунктов, ИЖС.",
  },
  {
    title: "Полезная площадь ИЖС",
    text: "407 соток: 21 участок от 12,5 до 25 соток.",
  },
  {
    title: "Гибкость межевания",
    text: "Готовый опцион доразмежевания до 42 участков.",
  },
  {
    title: "Территория общего пользования",
    text: "93 сотки ЗОП в частной собственности, не переданы на баланс администрации.",
  },
  {
    title: "Приватность",
    text: "Возможность единого периметрального забора, КПП и шлагбаумов.",
  },
];

const infrastructure = [
  {
    title: "Внутренние дороги",
    text: "990 п.м. проездов вдоль всех участков.",
    Icon: Route,
  },
  {
    title: "Качество покрытия",
    text: "3 700 м³ бута и щебня, круглогодичный проезд.",
    Icon: Layers,
  },
  {
    title: "Электроснабжение",
    text: "Опоры на 3/4 массива, заведено 15 кВт, поданы заявки на льготное присоединение остальных.",
    Icon: Zap,
  },
];

const firstStageStats = [
  { value: "15–25 млн ₽", label: "Инвестиции в 1-й этап (закупка и монтаж 3–5 модулей)" },
  { value: "90 дней", label: "Срок до первой выручки" },
  { value: "80–100 тыс ₽/мес", label: "Арендная ставка (корп. сегмент), либо 6 000–8 000 ₽/сутки" },
  { value: "20–22%", label: "Доходность на капитал, годовых" },
];

const timeline = [
  {
    period: "Месяц 1",
    text: "Согласование генплана, запуск производства модулей на заводе, установка свайно-винтовых фундаментов.",
  },
  {
    period: "Месяц 2",
    text: "Подведение сетей, доставка модулей, сборка на участке за 3–5 дней.",
  },
  {
    period: "Месяц 3",
    text: "Финишная комплектация, декор, маркетинг, заезд первых арендаторов.",
  },
];

const riskStrategy = [
  {
    title: "Тестирование",
    text: "Запуск 3–5 модулей, проверка загрузки, экономики и арендного потока.",
    Icon: Rocket,
  },
  {
    title: "Работа с заводом",
    text: "Контракт с производителем на спец-условиях при подтверждении показателей.",
    Icon: Factory,
  },
  {
    title: "Масштабирование",
    text: "Поэтапная застройка оставшихся участков массива, до 42 юнитов.",
    Icon: TrendingUp,
  },
];

const fullPotentialStats = [
  { value: "3,5–4,2 млн ₽/мес", label: "Совокупный арендный поток при полном освоении" },
  { value: "4,5–5,5 лет", label: "Срок окупаемости всего проекта" },
  { value: "Капитальная защита", label: "Инвестиции зафиксированы в ликвидном земельном активе ИЖС с готовой инфраструктурой" },
];

export default function UstLugaIzhsPage() {
  return (
    <>
      <JsonLd data={buildUstLugaIzhsJsonLd()} />

      {/* Блок 1. Hero */}
      <PageHero
        eyebrow="Инвестиционный проект"
        title="Загородный модульный кластер ИЖС"
        subtitle="Масштаб: 500 соток в частной собственности. Быстрый запуск первой очереди за 90 дней с выходом на операционную выручку и прозрачным масштабированием. Формат — закрытый загородный посёлок / арендный комплекс бизнес-класса."
        photoSrc="/api/media/file/2026-08-07_16-33-31.png"
        photoAlt="Аэрообзор участка и порта Усть-Луга с обозначением ключевых объектов"
        ctas={[{ label: "Скачать презентацию", href: "#download" }]}
      />
      <Container className="pb-16 pt-8">
        <StatRow
          stats={[
            { value: "90 дней", label: "до первой выручки" },
            { value: "500 соток", label: "в частной собственности" },
            { value: "до 42", label: "участков потенциал" },
          ]}
        />
      </Container>

      {/* Видео-презентация — сразу после хедлайна, до деталей по земле и
          инфраструктуре: короткий эмоциональный обзор перед цифрами. Видео
          не зарегистрировано в коллекции Media (как и PDF), src — прямая
          ссылка на S3, poster — уже загруженное фото id=9 (спутниковая
          карта участка), так как ffmpeg для извлечения кадра из видео на
          этой машине не установлен. */}
      <Section>
        <Eyebrow>Видео</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">Кратко о проекте на видео</h2>
        <div className="mt-6 overflow-hidden rounded-[4px] border-2 border-accent bg-surface">
          <video
            controls
            preload="none"
            poster="/api/media/file/1.jpg"
            className="aspect-video w-full"
          >
            <source
              src="https://s3.twcstorage.ru/city-keys-media/videos/ust-luga-izhs/ust-luga-izhs-presentation.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </Section>

      {/* Блок 2. Земля и юридический статус */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6">
            <div>
              <Eyebrow>Земля</Eyebrow>
              <h2 className="mt-3 text-[20px] font-extrabold">
                Готовая юридическая и межевая основа
              </h2>
            </div>
            <ul className="flex flex-col gap-4">
              {landPoints.map((point) => (
                <li key={point.title}>
                  <p className="text-[14.5px] font-bold">{point.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-secondary">{point.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] md:order-2">
            <Image
              src="/api/media/file/2.jpg"
              alt="Схема межевания массива, 500 соток — 21 участок от 12,5 до 25 соток"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Блок 3. Готовая инфраструктура */}
      <Section>
        <Eyebrow>Инфраструктура</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">
          Капитальные вложения в участок уже выполнены
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {infrastructure.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-6"
            >
              <item.Icon className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-accent opacity-[0.12]" />
              <div className="relative flex flex-col gap-2">
                <h3 className="text-[15px] font-bold">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-ink-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 4. Экономика 1-й очереди */}
      <Section>
        <Eyebrow>Экономика</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">
          Пилотный блок: быстрый запуск, понятная модель
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {firstStageStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1.5 rounded-[4px] border border-line bg-surface p-5"
            >
              <span className="text-[22px] font-extrabold tabular-nums tracking-tight text-accent">
                {stat.value}
              </span>
              <span className="text-[12.5px] leading-snug text-ink-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 5. Технология и график запуска */}
      <Section>
        <Eyebrow>90 дней</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">
          Параллельные процессы вместо долгостроя
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {timeline.map((step) => (
            <div key={step.period} className="rounded-[4px] border border-line bg-surface p-6">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-accent">
                {step.period}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 6. Стратегия минимизации рисков */}
      <Section>
        <Eyebrow>Риски</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">Пошаговое освоение массива</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {riskStrategy.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-6"
            >
              <item.Icon className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-accent opacity-[0.12]" />
              <div className="relative flex flex-col gap-2">
                <h3 className="text-[15px] font-bold">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-ink-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 7. Потенциал всего массива */}
      <Section>
        <Eyebrow>Масштаб</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">
          Масштабируемый арендный бизнес на 500 сотках
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {fullPotentialStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1.5 rounded-[4px] border border-line bg-surface p-5"
            >
              <span className="text-[20px] font-extrabold tracking-tight text-accent">
                {stat.value}
              </span>
              <span className="text-[12.5px] leading-snug text-ink-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 8. Форма заявки + скачивание презентации */}
      <Section id="download" className="scroll-mt-24 pb-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
              Давайте обсудим детали и выедем на объект
            </h2>
            <InvestorForm />
          </div>
          <div className="flex flex-col gap-3 text-[14px] text-ink-secondary md:pt-16">
            <p>
              <span className="text-ink-secondary/70">Телефон</span>
              <br />
              <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-ink">
                {contacts.phone}
              </a>
            </p>
            <p>
              <span className="text-ink-secondary/70">Сайт</span>
              <br />
              <span className="font-semibold text-ink">city-keys.ru</span>
            </p>
            <p>
              <span className="text-ink-secondary/70">E-mail</span>
              <br />
              <a href={`mailto:${contacts.email}`} className="font-semibold text-ink">
                {contacts.email}
              </a>
            </p>
            <p>
              <span className="text-ink-secondary/70">Адрес офиса</span>
              <br />
              <span className="font-semibold text-ink">{contacts.address}</span>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
