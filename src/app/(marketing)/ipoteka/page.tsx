import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { PartnerLogoGrid, type Partner } from "@/components/ui/partner-logo-grid";
import { MortgageCalculator } from "@/components/ui/mortgage-calculator";
import {
  IconPercent,
  IconHandshake,
  IconLaptop,
  IconStar,
  IconKey,
  IconRefresh,
} from "@/components/ui/icons";
import { contacts } from "@/lib/nav";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";

const TITLE = "Ипотека — CITY KEYS";
const DESCRIPTION =
  "Работаю больше чем с 10 банками и не отправляю заявку в первый попавшийся — сравниваю условия и нахожу ставку, которая реально выгодна вам.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/ipoteka",
    image: {
      url: "/images/andrey-ipoteka-hero-bw.jpg",
      width: 6000,
      height: 4000,
      alt: "Андрей Осипов, чёрно-белый портрет в полный рост",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/ipoteka"),
};

const featuredPrograms = [
  {
    title: "Господдержка",
    text: "Льготная ставка от государства на новостройки — актуальные условия зависят от банка и меняются, уточняю на момент обращения.",
    Icon: IconPercent,
  },
  {
    title: "Семейная ипотека",
    text: "Для семей с детьми — часто самая выгодная ставка из доступных программ, если у вас есть право на неё.",
    Icon: IconHandshake,
  },
];

const compactPrograms = [
  { title: "IT-ипотека", Icon: IconLaptop },
  { title: "Военная ипотека", Icon: IconStar },
  { title: "Вторичное жильё", Icon: IconKey },
  { title: "Рефинансирование", Icon: IconRefresh },
];

const banks: Partner[] = [
  { name: "Сбербанк", src: "/images/banks/SBER_LOGO_RUS_H_COL_RGB-dlya-sayta.png" },
  { name: "ВТБ", src: "/images/banks/2560px_VTB_Logo_2018.svg.png" },
  { name: "Альфа-Банк", src: "/images/banks/Alfa-bank.png" },
  { name: "Т-Банк", src: "/images/banks/T-Bank_RU_logo.svg.png" },
  { name: "Газпромбанк", src: "/images/banks/img1993961_Gazprombank_upolnomochenyiy_RAO_GAZPROM.jpg" },
  { name: "Совкомбанк", src: "/images/banks/logo-sovkombank.png" },
  { name: "Россельхозбанк", src: "/images/banks/Логотип_Россельхозбанк.svg.png" },
  { name: "ДОМ.РФ", src: "/images/banks/Domrf-Bank-Logo-Vector.svg-.png" },
  { name: "Абсолют Банк", src: "/images/banks/absolut-bank.jpg" },
];

const applicantDocuments = [
  "Паспорт РФ — все страницы, включая страницу с пропиской",
  "СНИЛС",
  "Второй документ, удостоверяющий личность — загранпаспорт, водительское удостоверение или военный билет (требуют не все банки, но лучше иметь под рукой)",
  "Справка о доходах — 2-НДФЛ или по форме банка, либо выписка по зарплатному счёту",
  "Заверенная копия трудовой книжки или трудового договора — либо выписка из электронной трудовой книжки",
  "Для ИП и самозанятых — налоговая декларация за последний период и документы, подтверждающие доход",
  "Свидетельство о браке или о расторжении брака — если применимо",
  "Брачный договор — если есть",
  "Свидетельства о рождении детей — если участвует материнский капитал или оформляется семейная ипотека",
  "Военный билет — для мужчин призывного возраста",
  "Тот же комплект документов на созаёмщика или поручителя — если он участвует в сделке",
  "Анкета-заявление банка — заполняется непосредственно при подаче заявки",
];

const faq = [
  {
    q: "Можно ли получить ипотеку с плохой кредитной историей?",
    a: "Зависит от банка и конкретной ситуации — у разных банков разные требования к истории. Расскажите о своей ситуации, подскажу, у кого шансы выше.",
  },
  {
    q: "Что будет, если банк откажет?",
    a: "Отказ одного банка не значит отказ всех — я работаю больше чем с 10 банками и знаю, у кого сейчас более гибкие требования именно к вашей ситуации.",
  },
  {
    q: "Сколько времени занимает одобрение?",
    a: "Зависит от банка и программы — обычно от нескольких дней. Точный срок скажу после разговора с банком по вашей ситуации.",
  },
  {
    q: "Нужен ли первоначальный взнос обязательно?",
    a: "По большинству программ — да, но минимальный процент отличается в зависимости от программы и банка.",
  },
  {
    q: "Что выгоднее — новостройка или вторичка при текущих ставках?",
    a: "Зависит от программы, на которую вы претендуете, и конкретного объекта — однозначного ответа на все случаи нет, разберём вашу ситуацию отдельно.",
  },
];

export default function MortgagePage() {
  return (
    <>
      {/* Блок 1. Hero — фото + затемнение */}
      <PageBannerHero
        eyebrow="Ипотека"
        title="Ипотека, которая работает на вас, а не на банк"
        subtitle="Я работаю больше чем с 10 банками и не отправляю заявку в первый попавшийся — я сравниваю условия и нахожу ставку, которая реально выгодна именно вам."
        ctas={[
          { label: "Рассчитать платёж", href: "#calculator" },
          { label: "Узнать свою ставку", href: "/kontakty", variant: "ghost" },
        ]}
        photoSrc="/images/andrey-ipoteka-hero-bw.jpg"
        photoAlt="Андрей Осипов, чёрно-белый портрет в полный рост"
        photoPosition="30% 20%"
        overlayOpacity={50}
      />

      {/* Блок 2. Ипотечный калькулятор */}
      <Section as="div" id="calculator" className="scroll-mt-24">
        <Eyebrow>Калькулятор</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold">
          Посчитайте примерный платёж и переплату
        </h2>
        <div className="mt-6">
          <MortgageCalculator />
        </div>
        <p className="mt-4 max-w-[70ch] rounded-[3px] border border-line bg-surface-2 px-5 py-4 text-[13px] leading-relaxed text-ink-secondary">
          Расчёт выше предварительный и не является одобрением банка. Точную
          ставку и сумму банк называет после проверки заявки — для этого
          нужно предоставить пакет документов по заявителю.
        </p>
        <details className="group mt-4 rounded-[4px] border border-line bg-surface p-5">
          <summary className="cursor-pointer list-none text-[14.5px] font-bold marker:content-none">
            Какие документы понадобятся для заявки
          </summary>
          <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-relaxed text-ink-secondary">
            {applicantDocuments.map((doc) => (
              <li key={doc} className="flex gap-2">
                <span className="text-accent">—</span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </details>
      </Section>

      {/* Блок 4. Почему через меня, а не напрямую в банк */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] font-extrabold">
              Банк предложит вам одну ставку. Я — сравню десять.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-ink-secondary">
              Когда вы приходите в банк напрямую, вам предложат стандартные
              условия этого банка. Я работаю больше чем с 10 банками
              одновременно и точно знаю, у кого сейчас более гибкие
              требования к доходу, у кого ниже ставка по вашей программе, а у
              кого быстрее одобрение.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-[20px] font-extrabold">
              Я веду сделку с банком, а не просто передаю документы
            </h2>
            <p className="text-[14.5px] leading-relaxed text-ink-secondary">
              Отказ по ипотеке — это часто не про доход клиента, а про то,
              как оформлена заявка. Я знаю, на что смотрит каждый банк, и
              готовлю документы так, чтобы избежать типичных причин отказа.
            </p>
          </div>
        </div>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[4px] border border-line bg-surface p-6">
            <h2 className="text-[18px] font-extrabold">Сколько стоят мои услуги</h2>
            <p className="text-[14px] text-ink-secondary">
              Здесь всё зависит от ситуации, и я говорю об этом сразу, а не
              после сделки:
            </p>
            <ul className="flex flex-col gap-3 text-[14px] leading-relaxed text-ink-secondary">
              <li>
                <strong className="text-ink">
                  Покупаете в новостройке у застройщика
                </strong>{" "}
                (за наличные или в ипотеку) — для вас это бесплатно. Комиссию
                платит застройщик.
              </li>
              <li>
                <strong className="text-ink">
                  Нужна помощь с одобрением ипотеки
                </strong>{" "}
                — если вы не уверены, что банк одобрит заявку, или банк уже
                отказал на сделке — я беру на себя одобрение и сопровождение
                сделки. Комиссия — от 70 000 рублей, точная сумма зависит от
                формы сделки (в том числе если используется материнский
                капитал, жилищные сертификаты, участвуют дети).
              </li>
              <li>
                <strong className="text-ink">Продажа или обмен недвижимости</strong>{" "}
                — комиссия от 2% от суммы сделки.
              </li>
            </ul>
            <p className="text-[13px] text-ink-secondary">
              Точную сумму я всегда называю до начала работы, исходя из вашей
              конкретной ситуации — без сюрпризов на финальном этапе.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
            <Image
              src="/images/andrey-phone.jpg"
              alt="Андрей на связи с клиентом"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Блок 5. Программы ипотеки — асимметричная сетка */}
      <Section>
        <Eyebrow>Программы ипотеки</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {featuredPrograms.map((prog) => (
            <div
              key={prog.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-8"
            >
              <prog.Icon className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-accent opacity-[0.12]" />
              <div className="relative flex flex-col gap-3">
                <h3 className="text-[17px] font-bold">{prog.title}</h3>
                <p className="max-w-[42ch] text-[14px] leading-relaxed text-ink-secondary">
                  {prog.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {compactPrograms.map((prog) => (
            <div
              key={prog.title}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-5 text-[14px] font-bold"
            >
              <prog.Icon className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-accent opacity-[0.12]" />
              <span className="relative">{prog.title}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-ink-secondary">
          Актуальные ставки по каждой программе подключим отдельно — они
          требуют регулярного обновления, устаревшие цифры на странице про
          ипотеку быстрее всего убивают доверие.
        </p>
      </Section>

      {/* Блок 6. Банки-партнёры */}
      <Section>
        <Eyebrow>Работаю с партнёрами</Eyebrow>
        <div className="mt-6">
          <PartnerLogoGrid partners={banks} />
        </div>
      </Section>

      {/* Блок 7. Частые вопросы */}
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

      {/* Блок 8. Переход к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Хотите узнать, на какую ставку можете рассчитывать именно вы?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Расскажите о своей ситуации — посчитаю варианты по всем
            банкам-партнёрам и отвечу лично.
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
