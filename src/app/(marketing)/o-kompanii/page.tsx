import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { contacts } from "@/lib/nav";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

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
};

const practicalPoints = [
  "Один номер телефона, один человек, который в курсе всей истории вашей сделки",
  "Никаких «передайте, пожалуйста, моему коллеге» и повторения ситуации с нуля",
  "Решения принимаются на месте, без согласований между отделами",
  "Личная ответственность за результат — не «агентство приносит извинения», а конкретный человек, который отвечает за сделку",
];

const partners = ["Банк", "Банк", "Банк", "Страховая", "Страховая", "Банк"];

export default function AboutPage() {
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
        <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-6">
          {partners.map((p, i) => (
            <div
              key={i}
              className="flex h-16 items-center justify-center rounded-[4px] border border-line bg-surface text-[11px] text-ink-secondary"
            >
              {p}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-ink-secondary">
          Логотипы банков и страховых компаний-партнёров подставим, как
          только получим их в векторном виде.
        </p>
      </Section>

      {/* Блок 6. Официально */}
      <Section>
        <Eyebrow>Официально</Eyebrow>
        <div className="mt-6 flex flex-col gap-1 text-[14px] leading-relaxed text-ink-secondary">
          <p>Индивидуальный предприниматель Осипов Андрей Владимирович</p>
          <p>Бренд CITY KEYS</p>
          <p>ИНН 470705914908</p>
          <p>ОГРНИП 317470400007509</p>
          <p>Кингисепп, ул. Октябрьская, д.18а/14, БЦ «Волна», 2 эт., оф.1</p>
          <p>E-mail: info@city-keys.ru</p>
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
