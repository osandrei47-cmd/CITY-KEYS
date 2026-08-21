import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";
import { HouseArrowsIcon, HouseCalendarIcon, HouseGearIcon } from "@/components/ui/mesh-icons";
import {
  IconScale,
  IconShieldCheck,
  IconHandshake,
  IconFileCheck,
  IconPercent,
  IconUmbrella,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { contacts } from "@/lib/nav";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";

const TITLE = "Услуги — CITY KEYS";
const DESCRIPTION =
  "От юридической проверки объекта до страховки и безопасных расчётов — беру на себя всё, что обычно приходится собирать самому по разным конторам.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/uslugi",
    image: {
      url: "/images/andrey-desk-laptop.JPG",
      width: 4176,
      height: 2784,
      alt: "Андрей за рабочим столом с ноутбуком",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/uslugi"),
};

const propertyServices = [
  {
    title: "Продажа и покупка недвижимости",
    text: "Полное сопровождение — от подбора объекта или поиска покупателя до подписания договора.",
    icon: HouseArrowsIcon,
    variant: 0,
  },
  {
    title: "Аренда жилой и коммерческой недвижимости",
    text: "Подбор арендатора или объекта, проверка условий, сопровождение сделки.",
    icon: HouseCalendarIcon,
    variant: 1,
  },
  {
    title: "Управление недвижимостью",
    text: "Сдаю и обслуживаю жилую и коммерческую недвижимость от лица собственника — без его постоянного участия.",
    icon: HouseGearIcon,
    variant: 2,
  },
];

const expertiseServices = [
  {
    title: "Юридическая проверка недвижимости и продавца",
    text: "Проверяю объект и продавца перед сделкой, в том числе на признаки банкротства.",
    Icon: IconShieldCheck,
  },
  {
    title: "Рыночная оценка недвижимости",
    text: "Реальная рыночная стоимость объекта — для продажи, покупки, ипотеки или раздела имущества.",
    Icon: IconScale,
  },
  {
    title: "Безопасные расчёты при сделках",
    text: "Провожу расчёты между сторонами так, чтобы деньги и документы переходили без риска для обеих сторон.",
    Icon: IconHandshake,
  },
  {
    title: "Электронная регистрация сделок",
    text: "Оформление перехода права собственности в Росреестре в электронном виде.",
    Icon: IconFileCheck,
  },
];

const financeServices = [
  {
    title: "Ипотечное кредитование",
    text: "Работаю более чем с 10 банками из топа рынка — подбираю ставку, которая выгодна именно вам.",
    Icon: IconPercent,
    href: "/ipoteka",
  },
  {
    title: "Страхование",
    text: "Ипотечное страхование, ОСАГО, КАСКО, титульное страхование — от 10 ведущих страховых компаний.",
    Icon: IconUmbrella,
    href: "/strahovanie",
  },
];

function IconCard({
  title,
  text,
  Icon,
  href,
}: {
  title: string;
  text: string;
  Icon: (props: { className?: string }) => React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-6">
      <Icon />
      <h3 className="text-[15px] font-bold">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-ink-secondary">{text}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="transition-colors hover:bg-surface-2 rounded-[4px]">
      {content}
    </Link>
  ) : (
    content
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageBannerHero
        eyebrow="Услуги"
        title="Не риелтор, а сопровождение сделки от и до"
        subtitle="От юридической проверки объекта до страховки и безопасных расчётов — беру на себя всё, что обычно приходится собирать самому по разным конторам."
        photoSrc="/images/andrey-desk-laptop.JPG"
        photoAlt="Андрей за рабочим столом с ноутбуком"
        photoPosition="50% 15%"
      />

      <Section>
        <Eyebrow>Сделки с недвижимостью</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {propertyServices.map((s) => (
            <div key={s.title} className="group flex flex-col gap-3">
              <MeshGradientCard
                icon={s.icon}
                variant={s.variant}
                iconSize={40}
                className="aspect-[4/3] rounded-[4px]"
              />
              <h3 className="text-[15px] font-bold">{s.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-secondary">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Экспертиза и безопасность сделки</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {expertiseServices.map((s) => (
            <IconCard key={s.title} {...s} />
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Финансы</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {financeServices.map((s) => (
            <IconCard key={s.title} {...s} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-[680px]">
          <h2 className="mb-3 text-[22px] font-extrabold leading-snug">
            Почему все услуги — у одного человека
          </h2>
          <p className="text-[14.5px] leading-relaxed text-ink-secondary">
            Каждая из этих услуг обычно означает поход в отдельную контору —
            к юристу, оценщику, в банк, в страховую. Я собираю всё это вокруг
            одной сделки, чтобы вам не пришлось самому связывать между собой
            разных специалистов и объяснять ситуацию заново каждому из них.
          </p>
        </div>
      </Section>

      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Не уверены, какая услуга нужна именно вам?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Расскажите о ситуации — подскажу, с чего начать, без лишних
            формальностей.
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
