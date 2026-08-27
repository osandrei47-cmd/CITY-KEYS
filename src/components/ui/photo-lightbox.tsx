"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxPhoto = {
  id: number | string;
  url?: string | null;
  alt?: string | null;
};

// Сетка фото + полноэкранный просмотр по клику/тапу. Используется на
// странице объекта (/katalog/obyekt/[id]) и в галерее ЖК (/zhk/[slug]) —
// вёрстку самой сетки (классы контейнера, соотношение сторон плитки)
// задаёт вызывающая сторона через пропсы, этот компонент только добавляет
// клик-обработчик и модалку поверх неё.
export function PhotoLightbox({
  photos,
  containerClassName,
  itemClassName = "aspect-[4/3]",
  sizes,
  fallbackAlt,
}: {
  photos: LightboxPhoto[];
  containerClassName: string;
  itemClassName?: string;
  sizes: string;
  fallbackAlt: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpenIndex(null);
  const showPrev = () =>
    setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  const showNext = () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  if (!photos.length) return null;

  const active = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className={containerClassName}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Увеличить фото: ${photo.alt || fallbackAlt}`}
            className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-[4px] p-0 text-left ${itemClassName}`}
          >
            <Image
              src={photo.url!}
              alt={photo.alt || fallbackAlt}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt || fallbackAlt}
          onClick={close}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 print:hidden"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Предыдущее фото"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Следующее фото"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={active.url!}
              alt={active.alt || fallbackAlt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {photos.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[12px] text-white">
              {openIndex! + 1} / {photos.length}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
