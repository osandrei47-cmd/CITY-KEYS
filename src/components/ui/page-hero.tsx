import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "./button";
import { Eyebrow } from "./eyebrow";
import { PhotoPlaceholder } from "./photo-placeholder";

type Cta = { label: string; href: string; variant?: "primary" | "ghost" };

function HeroText({
  eyebrow,
  title,
  subtitle,
  ctas,
  maxWidth = "640px",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctas?: Cta[];
  maxWidth?: string;
}) {
  return (
    <div className="flex flex-col gap-5" style={{ maxWidth }}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-balance text-[32px] font-extrabold leading-[1.15] md:text-[42px]">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-secondary">
          {subtitle}
        </p>
      ) : null}
      {ctas?.length ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Button key={cta.label} href={cta.href} variant={cta.variant ?? "primary"}>
              {cta.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  ctas,
  photoAssetHint,
  photoSrc,
  photoAlt,
  photoPosition = "50% 50%",
  layout = "overlay",
  photoAspect = "3/2",
  photoSide = "right",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctas?: Cta[];
  photoAssetHint?: string;
  photoSrc?: string;
  photoAlt?: string;
  photoPosition?: string;
  /** "overlay" — фото на весь экран, текст поверх с градиентом (по умолчанию).
   *  "split" — фото в контейнере со своими пропорциями, рядом с текстом. */
  layout?: "overlay" | "split";
  /** Соотношение сторон контейнера фото для layout="split", напр. "3/2", "4/5". */
  photoAspect?: string;
  photoSide?: "left" | "right";
}) {
  if (layout === "split" && (photoSrc || photoAssetHint)) {
    return (
      <section className="pb-4 pt-28 md:pt-36">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div
              className={`relative overflow-hidden rounded-[4px] ${
                photoSide === "left" ? "md:order-1" : "md:order-2"
              }`}
              style={{ aspectRatio: photoAspect }}
            >
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt={photoAlt ?? ""}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: photoPosition }}
                />
              ) : (
                <PhotoPlaceholder className="absolute inset-0" assetHint={photoAssetHint} />
              )}
            </div>
            <div className={photoSide === "left" ? "md:order-2" : "md:order-1"}>
              <HeroText eyebrow={eyebrow} title={title} subtitle={subtitle} ctas={ctas} maxWidth="560px" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (photoSrc || photoAssetHint) {
    return (
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={photoAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: photoPosition }}
          />
        ) : (
          <PhotoPlaceholder className="absolute inset-0" assetHint={photoAssetHint} />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 15%, rgba(13,15,18,0.75) 55%, transparent 100%)",
          }}
        />
        <Container className="relative z-10 pb-16 pt-32">
          <HeroText eyebrow={eyebrow} title={title} subtitle={subtitle} ctas={ctas} />
        </Container>
      </section>
    );
  }

  return (
    <section className="pb-4 pt-28 md:pt-36">
      <Container>
        <HeroText eyebrow={eyebrow} title={title} subtitle={subtitle} ctas={ctas} maxWidth="720px" />
      </Container>
    </section>
  );
}
