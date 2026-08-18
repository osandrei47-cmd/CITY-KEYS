import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { PartnerLogoGrid, type Partner } from "@/components/ui/partner-logo-grid";
import { IconShieldCheck, IconHouse, IconSteeringWheel, IconCarShield } from "@/components/ui/icons";
import { contacts } from "@/lib/nav";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

const TITLE = "Страхование — CITY KEYS";
const DESCRIPTION =
  "Работаю с 10 ведущими страховыми компаниями и подбираю полис так, чтобы вы не переплачивали — часто со скидкой от действующих на рынке цен.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/strahovanie",
    image: {
      url: "/images/andrey-office-suit.JPG",
      width: 4176,
      height: 2784,
      alt: "Рабочий момент — оформление документов за ноутбуком",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
};

const featuredInsurance = [
  {
    title: "Титульное страхование",
    text: "Защита права собственности при сделках с недвижимостью — на случай, если сделку в будущем попытаются оспорить (например, если у объекта в прошлом были проблемные собственники).",
    Icon: IconShieldCheck,
  },
  {
    title: "Страхование при ипотеке",
    text: "Обязательный полис при ипотечной сделке — подбираю условия, которые не задирают ежемесячный платёж сверху.",
    Icon: IconHouse,
  },
];

const compactInsurance = [
  {
    title: "ОСАГО",
    text: "Оформление и продление полиса без очередей в страховой.",
    Icon: IconSteeringWheel,
  },
  {
    title: "КАСКО",
    text: "Подбор условий по вашему автомобилю среди партнёрских страховых компаний.",
    Icon: IconCarShield,
  },
];

const insurers: Partner[] = [
  { name: "Ингосстрах", src: "/images/insurance/Ingosstrakh_New_Logo.svg.png" },
  { name: "Ренессанс страхование", src: "/images/insurance/Logo_renessans.svg.png" },
  { name: "Росгосстрах", src: "/images/insurance/RGS_logo_cmyk_Red.png" },
  { name: "СОГАЗ", src: "/images/insurance/Логотип_компании_СОГАЗ.svg.png" },
  { name: "РЕСО-Гарантия", src: "/images/insurance/Обновленный_логотип_РЕСО_-_2019.svg.png" },
  { name: "АльфаСтрахование", src: "/images/insurance/1eb06969e32ca0c847fae8166fe7639c.jpg" },
  { name: "Астро-Волга", src: "/images/insurance/3034cd01296f71564219310fa108657d.jpg" },
  { name: "Югория", src: "/images/insurance/75a2e7cda9824ac27d35a8d7a26d3947_L.jpg" },
  { name: "ВСК", src: "/images/insurance/gjm4oh5iaxb8j8892ddxcg70xgf1h0s1.jpg" },
];

const faq = [
  {
    q: "Обязательно ли титульное страхование при покупке вторички?",
    a: "Не обязательно по закону, но рекомендую в ситуациях, где у объекта была сложная история собственников — расскажу, нужно ли оно в вашем случае.",
  },
  {
    q: "Можно ли сэкономить на страховании при ипотеке, не теряя в защите?",
    a: "Да — сравниваю условия нескольких партнёрских страховых и подбираю полис, который устроит и вас, и банк, без лишней переплаты.",
  },
  {
    q: "Что делать, если срок действующего полиса ОСАГО/КАСКО ещё не закончился?",
    a: "Присылайте текущий полис — посчитаю, есть ли смысл переоформить его на более выгодных условиях уже сейчас или дождаться окончания срока.",
  },
  {
    q: "Как быстро оформляется полис?",
    a: "В большинстве случаев — в течение одного дня после того, как определимся с условиями.",
  },
];

export default function InsurancePage() {
  return (
    <>
      {/* Блок 1. Hero — фото + затемнение */}
      <PageBannerHero
        eyebrow="Страхование"
        title="Страховка, которая экономит, а не просто формальность для сделки"
        subtitle="Работаю с 10 ведущими страховыми компаниями и подбираю полис так, чтобы вы не переплачивали — часто с ощутимой скидкой от действующих на рынке цен."
        ctas={[{ label: "Подобрать полис", href: "/kontakty" }]}
        photoSrc="/images/andrey-office-suit.JPG"
        photoAlt="Рабочий момент — оформление документов за ноутбуком"
        photoPosition="50% 30%"
      />

      {/* Блок 2. Какое страхование оформляем — асимметричная сетка */}
      <Section>
        <Eyebrow>Какое страхование оформляем</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {featuredInsurance.map((t) => (
            <div
              key={t.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-8"
            >
              <t.Icon className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-accent opacity-[0.12]" />
              <div className="relative flex flex-col gap-3">
                <h3 className="text-[17px] font-bold">{t.title}</h3>
                <p className="max-w-[42ch] text-[14px] leading-relaxed text-ink-secondary">
                  {t.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {compactInsurance.map((t) => (
            <div
              key={t.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-5"
            >
              <t.Icon className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-accent opacity-[0.12]" />
              <h3 className="relative text-[14.5px] font-bold">{t.title}</h3>
              <p className="relative mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 3. Почему через меня, а не напрямую в страховой */}
      <Section>
        <div className="flex flex-col gap-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">
                Сравниваю, а не продаю один полис
              </h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                У меня нет задачи продать полис конкретной компании — я
                сравниваю условия у 10 ведущих страховых и подбираю то, что
                выгодно вам по цене и по покрытию.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">
                Экономия, которую видно сразу
              </h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                По ряду продуктов условия выгоднее, чем при обращении в
                страховую напрямую, — это результат работы напрямую с
                партнёрскими компаниями без посредников. Конкретный процент
                экономии зависит от компании и продукта — называю точную
                цифру после расчёта по вашей ситуации.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">
                Без беготни между разными конторами
              </h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                Если страхование нужно в рамках сделки по недвижимости или
                ипотеки, я оформляю его в том же процессе — не нужно отдельно
                ехать в страховую компанию.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] md:aspect-[4/3]">
              <Image
                src="/images/andrey-phone.jpg"
                alt="Андрей на связи с клиентом"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Блок 4. Страховые компании-партнёры */}
      <Section>
        <Eyebrow>Работаю с партнёрами</Eyebrow>
        <div className="mt-6">
          <PartnerLogoGrid partners={insurers} />
        </div>
      </Section>

      {/* Блок 5. Частые вопросы */}
      <Section>
        <Eyebrow>Частые вопросы</Eyebrow>
        <div className="mt-6 flex flex-col gap-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-[4px] border border-line bg-surface p-5"
            >
              <summary className="cursor-pointer list-none text-[14.5px] font-bold marker:content-none">
                {item.q}
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* Блок 6. Переход к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Хотите узнать, сколько можно сэкономить на вашей страховке?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Пришлите действующий полис или расскажите ситуацию — посчитаю
            варианты по всем партнёрам.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/kontakty">Оставить заявку</Button>
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
