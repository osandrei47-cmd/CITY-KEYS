import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "./button";
import { Eyebrow } from "./eyebrow";

type Cta = { label: string; href: string; variant?: "primary" | "ghost" };

export function PageBannerHero({
  eyebrow,
  title,
  subtitle,
  ctas,
  photoSrc,
  photoAlt,
  photoPosition = "50% 50%",
  overlayOpacity = 65,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctas?: Cta[];
  photoSrc: string;
  photoAlt: string;
  photoPosition?: string;
  /** Затемнение фото, % — по умолчанию 65, для ч/б фото может понадобиться другое значение */
  overlayOpacity?: number;
}) {
  return (
    <section className="relative flex min-h-[360px] items-end overflow-hidden sm:min-h-[400px]">
      <Image
        src={photoSrc}
        alt={photoAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: photoPosition }}
      />
      {/* Затемнение — фото остаётся узнаваемым, но текст поверх читается */}
      <div className="absolute inset-0 bg-bg" style={{ opacity: overlayOpacity / 100 }} />
      <Container className="relative z-10 py-10">
        <div className="flex max-w-[560px] flex-col gap-3">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="text-balance text-[28px] font-extrabold leading-[1.15] md:text-[36px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-[52ch] text-[14.5px] font-medium leading-relaxed text-ink/85">
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
      </Container>
    </section>
  );
}
