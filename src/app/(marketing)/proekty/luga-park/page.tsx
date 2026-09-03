import type { Metadata } from "next";
import { Waves, Ship, Factory, Zap, Route, TreePine, Percent, Banknote, Landmark } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatRow } from "@/components/ui/stat";
import { ComingSoonNote } from "@/components/ui/coming-soon-note";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { LugaParkForm } from "@/components/luga-park/luga-park-form";
import { LugaParkLotCard } from "@/components/luga-park/lot-card";
import { getPayloadClient } from "@/lib/payload-client";
import { contacts } from "@/lib/nav";
import { LUGA_PARK_LOTS, LUGA_PARK_PROJECT_SLUG } from "@/lib/luga-park";
import { lugaParkPresentationExists } from "@/lib/luga-park-s3";
import { lugaParkVideoExists, lugaParkVideoUrl } from "@/lib/luga-park-video";
import { isMediaDoc } from "@/lib/listing-types";
import { buildCanonical, buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";
import { buildLugaParkJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import type { Listing, Project } from "@/payload-types";

export const dynamic = "force-dynamic";

const TITLE =
  "Луга Парк — коттеджный посёлок вблизи реки Луга, участки ИЖС от 820 000 ₽ | CITY KEYS";
const DESCRIPTION =
  "Продажа участков ИЖС в коттеджном посёлке Луга Парк, д. Новое Куземкино. 1-я очередь: от 12,5 соток, вблизи реки Луга, рассрочка и ипотека.";

// Обложку проекта (запись Projects, поле coverPhoto) переиспользуем и в
// герое страницы, и в OG-картинке — редактируется в админке без правок кода.
async function getLugaParkProject(): Promise<Project | null> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "projects",
      where: { slug: { equals: LUGA_PARK_PROJECT_SLUG } },
      depth: 1,
      limit: 1,
    });
    return (docs[0] as unknown as Project | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const project = await getLugaParkProject();
  const cover = project && isMediaDoc(project.coverPhoto) ? project.coverPhoto : null;
  const image: OgImage = cover?.url
    ? {
        url: cover.url,
        width: cover.width ?? undefined,
        height: cover.height ?? undefined,
        alt: cover.alt || "Коттеджный посёлок «Луга Парк»",
      }
    : DEFAULT_OG_IMAGE;

  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: buildOpenGraph({
      title: TITLE,
      description: DESCRIPTION,
      path: "/proekty/luga-park",
      image,
    }),
    twitter: buildTwitter({ title: TITLE, description: DESCRIPTION, image }),
    alternates: buildCanonical("/proekty/luga-park"),
  };
}

const massifFacts = [
  {
    title: "Общая площадь массива",
    text: "500 соток, земли населённых пунктов, ИЖС.",
  },
  {
    title: "Полезная площадь под ИЖС",
    text: "407 соток — потенциально до 42 участков.",
  },
  {
    title: "Собственность",
    text: "Участки в собственности, назначение — ИЖС.",
  },
  {
    title: "Территория общего пользования",
    text: "93 сотки ЗОП в частной собственности.",
  },
  {
    title: "Приватность",
    text: "Возможность периметрального забора, КПП и шлагбаумов.",
  },
];

const locationStats = [
  { value: "Река Луга", label: "рядом с посёлком", Icon: Waves },
  { value: "25 км", label: "до порта Усть-Луга", Icon: Ship },
  { value: "20 км", label: "до ГПЗ и БХК", Icon: Factory },
];

const infrastructure = [
  {
    title: "Дороги",
    text: "Внутренние проезды укатаны щебнем (3 700 м³), круглогодичный проезд. В ближайшее время — укладка асфальтовой крошки по проездам.",
    Icon: Route,
  },
  {
    title: "Электричество",
    text: "ЛЭП по границам всех участков. Подключение оформляется отдельно.",
    Icon: Zap,
  },
  {
    title: "Окружение",
    text: "Вблизи реки Луга, лес по соседству, тихая деревня Новое Куземкино в стороне от трасс.",
    Icon: TreePine,
  },
];

const paymentOptions = [
  {
    title: "Рассрочка",
    text: "Прямая рассрочка от продавца на этапе 1-й очереди — график согласуем индивидуально.",
    Icon: Banknote,
  },
  {
    title: "Ипотека",
    text: "Ипотека на земельный участок ИЖС через банки-партнёров. Детали и ставки уточняются.",
    Icon: Percent,
  },
  {
    title: "100% оплата",
    text: "Полная оплата с оформлением сделки и переходом права в Росреестре.",
    Icon: Landmark,
  },
];

async function getLotListings(): Promise<Map<string, Listing>> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "listings",
      where: {
        title: { in: LUGA_PARK_LOTS.map((lot) => lot.title) },
      },
      depth: 0,
      limit: 50,
    });
    return new Map((docs as unknown as Listing[]).map((doc) => [doc.title, doc]));
  } catch {
    return new Map();
  }
}

export default async function LugaParkPage() {
  const [lotListings, hasPresentation, hasVideo, project] = await Promise.all([
    getLotListings(),
    lugaParkPresentationExists(),
    lugaParkVideoExists(),
    getLugaParkProject(),
  ]);

  const heroPhoto = project && isMediaDoc(project.coverPhoto) ? project.coverPhoto : null;
  const gallery = (project?.gallery ?? []).filter(isMediaDoc);
  const zoneA = LUGA_PARK_LOTS.filter((lot) => lot.zone === "А").length;
  const zoneB = LUGA_PARK_LOTS.filter((lot) => lot.zone === "Б").length;

  return (
    <>
      <JsonLd data={buildLugaParkJsonLd()} />

      {/* Блок 1. Герой */}
      <PageHero
        eyebrow="Коттеджный посёлок"
        title="Луга Парк"
        subtitle="Закрытый посёлок на 500 сотках у д. Новое Куземкино, вблизи реки Луга. Готовая инфраструктура, участки от 12,5 соток. Участки ИЖС — 1-я очередь в продаже."
        photoSrc={heroPhoto?.url || undefined}
        photoAlt={heroPhoto?.alt || "Коттеджный посёлок «Луга Парк» вблизи реки Луга"}
        photoAssetHint="аэрофото массива «Луга Парк» вблизи реки Луга"
        ctas={[
          { label: "Смотреть участки 1-й очереди", href: "#lots" },
          { label: "Оставить заявку", href: "#contact", variant: "ghost" },
        ]}
      />
      <Container className="pb-16 pt-8">
        <StatRow
          stats={[
            { value: "500 соток", label: "общая площадь массива" },
            { value: "от 12,5 соток", label: "площадь участка" },
            { value: "6 лотов", label: "1-я очередь в продаже" },
          ]}
        />
      </Container>

      {/* Блок 2. О массиве */}
      <Section>
        <Eyebrow>О массиве</Eyebrow>
        <h2 className="mt-3 max-w-[24ch] text-[20px] font-extrabold md:text-[24px]">
          500 соток вблизи реки Луга, д. Новое Куземкино
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {massifFacts.map((fact) => (
            <div key={fact.title} className="rounded-[4px] border border-line bg-surface p-6">
              <p className="text-[14.5px] font-bold">{fact.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">{fact.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Блок 3. Локация и инфраструктура */}
      <Section>
        <Eyebrow>Локация и инфраструктура</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold md:text-[24px]">Рядом со всем важным</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {locationStats.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-[4px] border border-line bg-surface p-6"
            >
              <item.Icon className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-accent opacity-[0.12]" />
              <div className="relative">
                <p className="text-[22px] font-extrabold tracking-tight text-accent">{item.value}</p>
                <p className="mt-1 text-[13px] text-ink-secondary">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

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

      {/* Блок 4. Участки 1-й очереди */}
      <Section id="lots" className="scroll-mt-24">
        <Eyebrow>Участки 1-й очереди</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold md:text-[24px]">
          {zoneA} участка типа А + {zoneB} участка типа Б
        </h2>
        <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-ink-secondary">
          Каждый лот — отдельный участок со своей страницей: характеристики, кадастровый
          номер, статус и печать в один лист. Цена указана без подключения электричества
          и с подключением.
        </p>

        <div className="mt-8">
          <ComingSoonNote>
            Интерактивная схема разбивки 1-й очереди появится здесь — с наведением
            на участок и его актуальным статусом. Пока участки представлены карточками
            ниже.
          </ComingSoonNote>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LUGA_PARK_LOTS.map((lot) => (
            <LugaParkLotCard key={lot.title} lot={lot} listing={lotListings.get(lot.title)} />
          ))}
        </div>

        <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-secondary">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Электричество — ЛЭП по границе участка, подключение отдельно.
        </p>
      </Section>

      {/* Блок 5. Условия покупки */}
      <Section>
        <Eyebrow>Условия покупки</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold md:text-[24px]">Удобные условия оплаты</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {paymentOptions.map((item) => (
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
        <p className="mt-4 text-[12.5px] text-ink-secondary">
          Детали банков-партнёров и графиков рассрочки — по запросу.
        </p>
      </Section>

      {/* Блок 6. Территория (галерея) */}
      <Section>
        <Eyebrow>Территория</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold md:text-[24px]">Как выглядит посёлок</h2>
        {gallery.length ? null : (
          <p className="mt-3 text-[14px] text-ink-secondary">
            Фото и видео с площадки добавим по мере готовности.
          </p>
        )}

        {gallery.length ? (
          <div className="mt-8">
            <PhotoLightbox
              photos={gallery}
              containerClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              sizes="(min-width: 768px) 33vw, 100vw"
              fallbackAlt="Территория посёлка «Луга Парк»"
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "аэрофото массива, вид на реку Луга",
              "река Луга рядом с посёлком",
              "внутренние проезды, укатанный щебень",
              "ЛЭП по границе участков",
              "деревня Новое Куземкино, окружение",
              "общий вид 1-й очереди",
            ].map((hint) => (
              <PhotoPlaceholder
                key={hint}
                className="aspect-[4/3] rounded-[4px] border border-line"
                assetHint={hint}
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          {hasVideo ? (
            <div className="overflow-hidden rounded-[4px] border-2 border-accent bg-surface">
              <video
                controls
                preload="none"
                poster={heroPhoto?.url || undefined}
                className="aspect-video w-full"
              >
                <source src={lugaParkVideoUrl()} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-[4px] border-2 border-dashed border-line bg-surface text-[13px] text-ink-secondary">
              Видео-обзор посёлка появится здесь
            </div>
          )}
        </div>
      </Section>

      {/* Блок 7. PDF-презентация с лид-гейтом */}
      <Section>
        <Eyebrow>Презентация</Eyebrow>
        <h2 className="mt-3 text-[20px] font-extrabold md:text-[24px]">
          Полная презентация «Луга Парк»
        </h2>
        <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-ink-secondary">
          {hasPresentation
            ? "Оставьте имя и телефон — пришлём PDF-презентацию посёлка с планом 1-й очереди и условиями."
            : "Финальная PDF-презентация готовится. Оставьте имя и телефон — вышлем её вам, как только она будет готова."}
        </p>
        <div className="mt-6">
          <LugaParkForm mode="presentation" />
        </div>
      </Section>

      {/* Блок 8. Форма заявки */}
      <Section id="contact" className="scroll-mt-24 pb-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="max-w-[36ch] text-[24px] font-extrabold leading-tight md:text-[26px]">
              Оставьте заявку — подберём участок и ответим на вопросы
            </h2>
            <LugaParkForm mode="application" />
          </div>
          <div className="flex flex-col gap-3 text-[14px] text-ink-secondary md:pt-4">
            <p>
              <span className="text-ink-secondary/70">Телефон</span>
              <br />
              <a
                href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
                className="font-semibold text-ink"
              >
                {contacts.phone}
              </a>
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
