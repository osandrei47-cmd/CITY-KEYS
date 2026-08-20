import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Quote } from "@/components/ui/quote";
import { Button } from "@/components/ui/button";
import { contacts } from "@/lib/nav";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";

const TITLE = "Отзывы — CITY KEYS";
const DESCRIPTION =
  "Рейтинг 5,0 на Авито, 4,5 на Яндексе и 5,0 на Домклик — отзывы клиентов о работе с CITY KEYS в Кингисеппе.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/otzyvy",
    image: {
      url: "/images/andrey-otzyvy-hero-banner.jpg",
      width: 3729,
      height: 1678,
      alt: "Андрей Осипов улыбается на фоне жилых домов",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/otzyvy"),
};

const reviews = [
  {
    author: "Елизавета Ф.",
    source: "Яндекс",
    text: "Обращались в агентство, когда планировали покупку квартиры. Вопросов было много, на каждый получили подробный ответ с разъяснением норм законодательства. Сделка состоялась быстро, качественно.",
  },
  {
    author: "Елена И.",
    source: "Яндекс",
    text: "Провели сделку в сопровождении Андрея Осипова. Грамотная подготовка документов, чёткая организация всего процесса, доброжелательное, спокойное общение.",
  },
  {
    author: "Марина С.",
    source: "Яндекс",
    text: "Я живу в Астрахани, и на расстоянии этот добрый, отзывчивый и, главное, грамотный специалист помог мне продать квартиру.",
  },
  {
    author: "Ульяна Г.",
    source: "Яндекс",
    text: "Хочу выразить огромную благодарность риелтору Андрею Осипову за помощь в продаже комнаты. Андрей — очень добрый, отзывчивый и понимающий человек, с которым было легко и приятно работать.",
  },
  {
    author: "Дмитрий К.",
    source: "Яндекс",
    text: "Обратились в агентство недвижимости CITY KEYS за бесплатной юридической проверкой продавца и выбранной нами квартиры. Проверка была проведена быстро и в очень удобном формате, в виде отчёта.",
  },
  {
    author: "Покупатель, 1-к. квартира, 36,8 м²",
    source: "Авито",
    text: "Очень приятный молодой человек, всё рассказал, показал, объяснил тонкости оформления.",
  },
  {
    author: "Анастасия П.",
    source: "Домклик",
    text: "Андрей Владимирович - первоклассный профессионал, которого буду рекомендовать своим знакомым! Всегда был на связи, оперативно отвечал на все вопросы, сделка прошла легко и быстро! Огромное спасибо за помощь!!!",
  },
  {
    author: "Екатерина Ш.",
    source: "Домклик",
    text: "Отличный профессионал в своем деле.",
  },
  {
    author: "Надежда М.",
    source: "Домклик",
    text: "Хочу выразить огромную благодарность Осипову Андрею, очень грамотный специалист помог в оформлении ипотеки, проконсультировал, все быстро и четко. Однозначно буду рекомендовать! Спасибо за вашу работу.",
  },
];

export default function ReviewsPage() {
  return (
    <>
      {/* Блок 1. Hero */}
      <PageBannerHero
        eyebrow="Отзывы"
        title="Отзывы клиентов — с Авито, Яндекса и Домклик, без купленных пятёрок"
        subtitle="Рейтинг 5,0 на Авито, 4,5 на Яндексе и 5,0 на Домклик — здесь и на самих площадках, можно перейти и проверить."
        photoSrc="/images/andrey-otzyvy-hero-banner.jpg"
        photoAlt="Андрей Осипов улыбается на фоне жилых домов"
        photoPosition="50% 55%"
      />

      {/* Блок 2. Сводка по площадкам */}
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="https://www.avito.ru/brands/i73345155"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[4px] border border-line bg-surface p-6 transition-colors hover:bg-surface-2"
          >
            <div>
              <div className="text-[15px] font-bold">Авито</div>
              <div className="text-[13px] text-ink-secondary">
                Отзывы покупателей и продавцов
              </div>
            </div>
            <div className="text-[22px] font-extrabold">5,0 ★</div>
          </a>
          <a
            href="https://yandex.com/maps/org/city_keys/60917118951/reviews/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[4px] border border-line bg-surface p-6 transition-colors hover:bg-surface-2"
          >
            <div>
              <div className="text-[15px] font-bold">Яндекс</div>
              <div className="text-[13px] text-ink-secondary">10 оценок</div>
            </div>
            <div className="text-[22px] font-extrabold">4,5 ★</div>
          </a>
          <a
            href="https://agencies.domclick.ru/agent/27328?from=%2Fagent%2F27328%2Fbusiness-card"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[4px] border border-line bg-surface p-6 transition-colors hover:bg-surface-2"
          >
            <div>
              <div className="text-[15px] font-bold">Домклик</div>
              <div className="text-[13px] text-ink-secondary">6 оценок</div>
            </div>
            <div className="text-[22px] font-extrabold">5,0 ★</div>
          </a>
        </div>
        <p className="mt-4 text-[12.5px] text-ink-secondary">
          Живые виджеты рейтинга подключим отдельно — как только получим
          embed-код площадок; пока карточки выше ведут напрямую на профили.
        </p>
      </Section>

      {/* Блок 3. Отобранные истории */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <Quote key={r.author} author={r.author} source={r.source}>
              {r.text}
            </Quote>
          ))}
        </div>
      </Section>

      {/* Блок 4. Переход к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Хотите стать следующей историей успеха?
          </h2>
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
