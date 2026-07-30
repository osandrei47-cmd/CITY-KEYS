import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { PhotoTextSplit } from "@/components/ui/photo-text-split";
import { StatRow } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { contacts } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Андрей Осипов — CITY KEYS",
};

export default function AndreyPage() {
  return (
    <>
      {/* Блок 1. Hero */}
      <PageHero
        eyebrow="Агент по недвижимости в Кингисеппе с 2000 года"
        title="Андрей Осипов"
        subtitle="Я работаю с недвижимостью с тех пор, когда сделки ещё вели через пейджер. За 25 лет ничего не изменилось в главном — я всё так же лично веду каждую сделку от первого звонка до ключей."
        photoSrc="/images/hero-tower-color.jpg"
        photoAlt="Андрей Осипов — низкий ракурс на фоне новостроек, цветной кадр"
        layout="split"
        photoAspect="3/2"
        photoSide="left"
        ctas={[
          { label: "Обсудить сделку", href: "/kontakty" },
          { label: "Смотреть объекты", href: "/katalog", variant: "ghost" },
        ]}
      />

      {/* Блок 2. История — фото в контейнере, текст рядом */}
      <PhotoTextSplit
        src="/images/new-tower-color.png"
        alt="Андрей на металлической конструкции, цветной кадр"
        aspect="4/5"
        photoSide="right"
      >
        <p className="text-balance text-[22px] font-extrabold leading-snug md:text-[28px]">
          «Я работаю с недвижимостью с тех пор, когда сделки ещё вели через
          пейджер»
        </p>
      </PhotoTextSplit>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">Как всё начиналось</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                Мне не было ещё 18, когда в 2000 году я пришёл в недвижимость.
                Моим наставником стал Сергей Николаевич — человек, который на
                своём примере показал, что в этой профессии нет мелочей, а
                есть либо забота о клиенте, либо её отсутствие. Со временем
                наставник стал другом, и это, наверное, лучшее, что может
                дать профессия.
              </p>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                Тогда сделки вели через пейджер. Потом я купил первый
                радиотелефон — пришлось ставить антенну на крыше
                девятиэтажки, чтобы связь вообще ловила. После был телефон от
                «Дельта Телеком» — по тем временам почти роскошь.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">Почему это важно сегодня</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                Я рассказываю это не для ностальгии. За 25 лет в профессии
                сменилось всё — связь, документы, банки, технологии показа
                объектов. Сегодня я снимаю объекты с дрона и монтирую видео,
                которое показывает квартиру или дом честнее, чем десять
                фотографий. Но суть работы риелтора не изменилась ни на день:
                разобраться в ситуации клиента лучше, чем он сам, и провести
                сделку так, чтобы за неё не было тревожно.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px]">
            <Image
              src="/images/andrey-phone.jpg"
              alt="Андрей на телефоне во дворе жилого дома, живой рабочий момент"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Блок 3. Цифры — без прикрас */}
      <Section>
        <StatRow
          stats={[
            { value: "25 лет", label: "в недвижимости — с 2000 года" },
            {
              value: "~400",
              label: "объектов оформлено в Кингисеппе, Ленобласти и СПб",
            },
            { value: "10+", label: "банков-партнёров" },
            { value: "100+", label: "квартир продано в одном ЖК" },
          ]}
        />
      </Section>

      {/* Блок 4. Экспертиза — ипотека и сделки */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] md:order-2">
            <Image
              src="/images/andrey-blue-building.jpg"
              alt="Андрей на связи на фоне синего жилого дома"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "60% 35%" }}
            />
          </div>
          <div className="flex flex-col gap-8 md:order-1">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">
                Ипотека — не формальность, а расчёт в пользу клиента
              </h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                Я работаю более чем с 10 банками и не отправляю заявку в
                первый попавшийся — я сравниваю условия и нахожу ставку,
                которая реально выгодна именно вам, с учётом вашей ситуации:
                дохода, региона, типа объекта.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-extrabold">Сделка, которая не пугает</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-secondary">
                За 400 с лишним объектов я видел все сценарии, которые могут
                пойти не так — от проблем с документами до сорванных цепочек
                альтернатив. Моя задача — предусмотреть это заранее, а не
                разбираться по факту.
              </p>
            </div>
            <Link href="/uslugi" className="text-[14px] font-semibold text-accent underline">
              Подробнее о том, как проходит сделка →
            </Link>
          </div>
        </div>
      </Section>

      {/* Блок 5. Личный штрих */}
      <Section>
        <div className="max-w-[640px]">
          <h2 className="mb-3 text-[20px] font-extrabold">Личный штрих</h2>
          <p className="text-[14.5px] leading-relaxed text-ink-secondary">
            Кроме недвижимости, я увлекаюсь съёмкой с дрона — это началось
            как хобби, а стало ещё одним способом показывать объекты
            по-настоящему честно: с высоты видно то, что не передаст ни одна
            фотография с телефона. Живу в Кингисеппе, здесь же воспитываю
            двоих детей — это тоже город, в котором я не просто работаю, а
            живу.
          </p>
        </div>
      </Section>

      {/* Блок 6. Переход к действию */}
      <Section className="pb-24">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[36ch] text-[26px] font-extrabold leading-tight">
            Остались вопросы по сделке или ипотеке?
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-ink-secondary">
            Расскажите о своей ситуации — отвечу лично, не через шаблон.
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
