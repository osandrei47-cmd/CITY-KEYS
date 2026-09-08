import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { PartnerLogoGrid } from "@/components/ui/partner-logo-grid";
import { contacts } from "@/lib/nav";
import { getPayloadClient } from "@/lib/payload-client";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { banks, insurers } from "@/lib/partner-logos";
import type { Media } from "@/payload-types";

export const revalidate = 3600;

// Скан свидетельства на товарный знак грузится в коллекцию Media через
// админку. Привязки по id нет (страница свёрстана вручную, без CMS-записи),
// поэтому ищем по имени файла: загрузить с именем, содержащим эту строку
// (например «city-keys-trademark-1252865.jpg»). Пока файла нет — блок с
// текстом о регистрации показывается, картинка просто не рендерится.
const TRADEMARK_SCAN_FILENAME_MATCH = "city-keys-trademark-1252865";

async function getTrademarkScan(): Promise<Media | null> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "media",
      where: { filename: { like: TRADEMARK_SCAN_FILENAME_MATCH } },
      limit: 1,
    });
    const doc = docs[0] as Media | undefined;
    return doc?.url ? doc : null;
  } catch {
    return null;
  }
}

const TITLE = "О компании — CITY KEYS";
const DESCRIPTION =
  "Здесь нет менеджеров, которые передают сделку друг другу. Один человек ведёт её от первого звонка до ключей и отвечает за результат лично.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/o-kompanii",
    image: {
      url: "/images/andrey-office-suit.JPG",
      width: 4176,
      height: 2784,
      alt: "Андрей Осипов в кабинете, за ноутбуком",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/o-kompanii"),
};

const practicalPoints = [
  "Один номер телефона, один человек, который в курсе всей истории вашей сделки",
  "Никаких «передайте, пожалуйста, моему коллеге» и повторения ситуации с нуля",
  "Решения принимаются на месте, без согласований между отделами",
  "Личная ответственность за результат — не «агентство приносит извинения», а конкретный человек, который отвечает за сделку",
];

export default async function AboutPage() {
  const trademarkScan = await getTrademarkScan();

  return (
    <>
      {/* Блок 1. Hero */}
      <PageBannerHero
        eyebrow="О компании"
        title="CITY KEYS — агентство, а не конвейер"
        subtitle="Здесь нет менеджеров, которые передают вашу сделку друг другу. Есть один человек, который ведёт её от первого звонка до получения ключей — и отвечает за результат лично."
        photoSrc="/images/andrey-office-suit.JPG"
        photoAlt="Андрей Осипов в кабинете, за ноутбуком"
        photoPosition="50% 20%"
      />

      {/* Блок 2. Почему бутик-формат, а не большая команда */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] font-extrabold">
              В типовом агентстве недвижимости вашей сделкой может заниматься
              три разных человека
            </h2>
            <p className="text-[14.5px] leading-relaxed text-ink-secondary">
              Один принимает заявку, второй показывает объект, третий
              сопровождает документы. Информация теряется между ними, а
              спросить «как дела с моей сделкой» часто некому — все
              ссылаются друг на друга.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] font-extrabold">В CITY KEYS всё иначе</h2>
            <p className="text-[14.5px] leading-relaxed text-ink-secondary">
              Я сознательно не выстраиваю агентство по принципу «чем больше
              агентов, тем больше сделок». Каждую сделку веду лично — от
              первого разговора до подписания. Вы всегда знаете, к кому
              обратиться, и разговариваете с человеком, который реально в
              курсе вашей ситуации, а не сверяется с CRM.
            </p>
            <p className="text-[14.5px] italic leading-relaxed text-ink-secondary">
              Это не значит «агентство маленькое» — это значит «у сделки есть
              один ответственный, и это принципиально».
            </p>
          </div>
        </div>
      </Section>

      {/* Блок 3. Что это даёт вам на практике */}
      <Section>
        <Eyebrow>Что это даёт вам на практике</Eyebrow>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {practicalPoints.map((point) => (
            <li
              key={point}
              className="flex gap-3 rounded-[4px] border border-line bg-surface p-5 text-[14px] leading-relaxed text-ink-secondary"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {point}
            </li>
          ))}
        </ul>
      </Section>

      {/* Блок 4. Чем мы занимаемся */}
      <Section>
        <div className="flex flex-col gap-5">
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
            CITY KEYS сопровождает сделки с недвижимостью в Кингисеппе,
            Ленинградской области и Санкт-Петербурге — покупка, продажа,
            аренда, подбор ипотеки, юридическая проверка объектов. Подробнее —
            на странице услуг.
          </p>
          <div>
            <Button href="/uslugi" variant="ghost">
              Смотреть услуги
            </Button>
          </div>
        </div>
      </Section>

      {/* Блок 5. Партнёры */}
      <Section>
        <Eyebrow>Партнёры</Eyebrow>
        <div className="mt-6">
          <PartnerLogoGrid partners={[...banks, ...insurers]} />
        </div>
      </Section>

      {/* Блок 6. Официально */}
      <Section>
        <Eyebrow>Официально</Eyebrow>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-[14px] leading-relaxed text-ink-secondary">
              <p>Индивидуальный предприниматель Осипов Андрей Владимирович</p>
              <p>Бренд CITY KEYS</p>
              <p>ИНН 470705914908</p>
              <p>ОГРНИП 317470400007509</p>
              <p>Кингисепп, ул. Октябрьская, д.18а/14, БЦ «Волна», 2 эт., оф.1</p>
              <p>E-mail: info@city-keys.ru</p>
            </div>

            <div className="flex flex-col gap-2 rounded-[4px] border border-line bg-surface p-5">
              <h3 className="text-[14.5px] font-bold">
                Товарный знак CITY KEYS<span className="align-super text-[9px] font-bold">®</span>
              </h3>
              <p className="text-[13.5px] leading-relaxed text-ink-secondary">
                Название и знак CITY KEYS зарегистрированы как товарный знак. Роспатент внёс
                его в Государственный реестр товарных знаков 13 августа 2026 года —
                свидетельство № 1252865, правообладатель Осипов Андрей Владимирович,
                классы МКТУ 35 и 36 (реклама и маркетинг, услуги в сфере недвижимости).
                Регистрация действует до 27 февраля 2036 года.
              </p>
            </div>
          </div>

          {trademarkScan ? (
            <figure className="flex flex-col gap-2">
              <Image
                src={trademarkScan.url as string}
                alt={
                  trademarkScan.alt ||
                  "Свидетельство Роспатента на товарный знак CITY KEYS № 1252865"
                }
                width={trademarkScan.width ?? 900}
                height={trademarkScan.height ?? 1270}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="h-auto w-full rounded-[4px] border border-line bg-surface"
              />
              <figcaption className="text-[12px] text-ink-secondary/80">
                Свидетельство № 1252865, Роспатент
              </figcaption>
            </figure>
          ) : null}
        </div>
      </Section>

      {/* Блок 7. Переход к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Хотите обсудить свою ситуацию?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Напишите или позвоните — отвечаю лично, без промежуточных звеньев.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/kontakty">Оставить заявку</Button>
            <Button
              href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
              variant="ghost"
              ariaLabel="Позвонить"
            >
              Позвонить
            </Button>
            <Button href={contacts.telegram} variant="ghost">
              Telegram
            </Button>
            <Button href={contacts.max} variant="ghost">
              MAX
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
