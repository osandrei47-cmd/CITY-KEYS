import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Quote } from "@/components/ui/quote";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { BlogCard } from "@/components/ui/blog-card";
import { blogPosts } from "@/lib/blog-posts";
import { contacts } from "@/lib/nav";

const directions = [
  { label: "Купить", href: "/katalog" },
  { label: "Продать", href: "/kontakty" },
  { label: "Снять / Сдать", href: "/katalog?deal=rent" },
  { label: "Новостройки", href: "/novostroyki" },
];

export default function HomePage() {
  return (
    <>
      {/* Блок 1. Hero */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden">
        <Image
          src="/images/hero-tower-color.jpg"
          alt="Силуэт на фоне башни, цветной кадр"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 15%, rgba(13,15,18,0.75) 55%, transparent 100%)",
          }}
        />
        <Container className="relative z-10 flex justify-end pb-16 pt-32">
          <div className="flex max-w-[640px] flex-col gap-5">
            <h1 className="text-balance text-[34px] font-extrabold leading-[1.15] md:text-[46px]">
              Купить или продать недвижимость — без риска, что сделку сорвут
              или оспорят
            </h1>
            <p className="max-w-[52ch] text-[16px] leading-relaxed text-ink-secondary">
              25 лет в недвижимости. Одну сделку веду от первого звонка до
              ключей лично — сам, а не через сменяющихся менеджеров.
            </p>
            <div className="mt-2">
              <Button href="/kontakty">Обсудить сделку</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Блок 2. Направления */}
      <Section>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] bg-line md:grid-cols-4">
          {directions.map((d) => (
            <Link
              key={d.label}
              href={d.href}
              className="group flex min-h-[120px] flex-col justify-end bg-surface p-5 transition-colors hover:bg-surface-2"
            >
              <span className="text-[16px] font-bold group-hover:text-accent">
                {d.label}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Блок 3. Топ-объекты */}
      <Section>
        <div className="mb-10">
          <Eyebrow>Каталог</Eyebrow>
          <h2 className="mt-2 text-[26px] font-extrabold">
            Актуальные объекты
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <PhotoPlaceholder
                className="aspect-[4/3] rounded-[4px]"
                assetHint="видео-превью объекта — подключится вместе с каталогом"
              />
              <div className="h-3 w-2/3 rounded bg-surface" />
              <div className="h-3 w-1/3 rounded bg-surface" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12.5px] text-ink-secondary">
          Витрина объектов подключится к данным каталога на следующем этапе —
          сейчас показана только вёрстка карточки.
        </p>
        <div className="mt-8">
          <Button href="/katalog" variant="ghost">
            Смотреть все объекты
          </Button>
        </div>
      </Section>

      {/* Блок 4. Андрей за 30 секунд */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] md:order-2">
            <Image
              src="/images/new-tower-color.png"
              alt="Андрей Осипов на фоне башни, цветной кадр"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <div className="flex flex-col gap-4 md:order-1">
            <Eyebrow>Андрей за 30 секунд</Eyebrow>
            <h2 className="text-[24px] font-extrabold leading-tight">
              25 лет в недвижимости. Один человек, который отвечает за вашу
              сделку от начала до конца — а не передаёт её между менеджерами.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-ink-secondary">
              Работаю в Кингисеппе, Ленинградской области и Санкт-Петербурге.
              ~400 объектов оформлено, работаю с 10+ банками и страховыми
              компаниями.
            </p>
            <div className="mt-2">
              <Button href="/andrey-osipov" variant="ghost">
                Узнать больше об Андрее
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Блок 5. Ипотека и страхование — в цифрах */}
      <Section>
        <div className="flex flex-col gap-5">
          <Eyebrow>Ипотека и страхование</Eyebrow>
          <h2 className="max-w-[46ch] text-[24px] font-extrabold leading-tight">
            10+ банков-партнёров. Сравниваю условия и нахожу ставку, которая
            выгодна вам — не банку.
          </h2>
          <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Скидки на страхование до 50% от действующих полисов при сделках
            через CITY KEYS.
          </p>
          <div>
            <Button href="/ipoteka">Рассчитать ипотеку</Button>
          </div>
        </div>
      </Section>

      {/* Блок 6. Отзывы */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-4">
            <Eyebrow>Отзывы</Eyebrow>
            <Quote author="Марина С." source="Яндекс">
              На расстоянии этот добрый, отзывчивый и, главное, грамотный
              специалист помог мне продать квартиру в Кингисеппе.
            </Quote>
          </div>
          <div className="flex flex-col gap-5 md:pt-9">
            <p className="text-[18px] font-bold">
              5,0 ★ на Авито · 4,5 ★ на Яндексе
            </p>
            <div>
              <Button href="/otzyvy" variant="ghost">
                Все отзывы
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Блок 7. Из блога */}
      <Section>
        <div className="mb-10">
          <Eyebrow>Блог</Eyebrow>
          <h2 className="mt-2 text-[26px] font-extrabold">Из блога</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
        <div className="mt-10">
          <Button href="/blog" variant="ghost">
            Читать блог
          </Button>
        </div>
      </Section>

      {/* Блок 8. Финальный призыв к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Есть вопрос по сделке, ипотеке или объекту?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Отвечаю лично — без колл-центра и переключения между
            сотрудниками.
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
