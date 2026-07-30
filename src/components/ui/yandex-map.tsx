"use client";

import { useEffect, useRef } from "react";

export type MapMarker = {
  lat: number;
  lng: number;
  hint?: string;
  balloonContent?: string;
};

interface YMapsPlacemarkOptions {
  preset?: string;
}

interface YMapsPlacemarkProperties {
  hintContent?: string;
  balloonContent?: string;
}

interface YMapsGeoObjects {
  add(geoObject: unknown): void;
}

interface YMapsMapState {
  center: [number, number];
  zoom: number;
  controls?: string[];
}

interface YMapsMap {
  geoObjects: YMapsGeoObjects;
  container: { fitToViewport(): void };
  destroy(): void;
}

interface YMapsNamespace {
  ready(callback: () => void): void;
  Map: new (element: HTMLElement, state: YMapsMapState) => YMapsMap;
  Placemark: new (
    coordinates: [number, number],
    properties?: YMapsPlacemarkProperties,
    options?: YMapsPlacemarkOptions,
  ) => unknown;
}

declare global {
  interface Window {
    ymaps?: YMapsNamespace;
  }
}

const SCRIPT_ID = "yandex-maps-api-script";

function loadYandexMapsScript(apiKey: string): Promise<YMapsNamespace> {
  if (window.ymaps) return Promise.resolve(window.ymaps);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.ymaps!));
      existing.addEventListener("error", () => reject(new Error("Yandex Maps script failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => resolve(window.ymaps!);
    script.onerror = () => reject(new Error("Yandex Maps script failed to load"));
    document.head.appendChild(script);
  });
}

export function YandexMap({
  center,
  zoom = 16,
  markers,
  className = "",
}: {
  /** [широта, долгота] центра карты */
  center: [number, number];
  zoom?: number;
  /**
   * Метки на карте. Сейчас — только офис, но структура одна и та же для
   * объектов из Listings: см. listingToMapMarker в src/lib/listing-types.ts —
   * можно собрать markers из каталога объектов (lat/lng уже есть в схеме)
   * и передать сюда без изменений компонента.
   */
  markers: MapMarker[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let map: YMapsMap | undefined;
    let cancelled = false;
    let resizeCleanup: (() => void) | undefined;

    loadYandexMapsScript(apiKey)
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;
        ymaps.ready(() => {
          if (cancelled || !containerRef.current) return;
          map = new ymaps.Map(containerRef.current, {
            center,
            zoom,
            controls: ["zoomControl"],
          });
          // На момент создания карты контейнер иногда ещё не принял свой
          // финальный размер по CSS (aspect-ratio и т.п.) — без этого карта
          // рендерится только в части контейнера. fitToViewport сразу не
          // всегда помогает, пока браузер не закончил layout — поэтому
          // дублируем вызов через таймаут.
          map.container.fitToViewport();
          setTimeout(() => map?.container.fitToViewport(), 200);
          for (const marker of markers) {
            const placemark = new ymaps.Placemark(
              [marker.lat, marker.lng],
              { hintContent: marker.hint, balloonContent: marker.balloonContent },
              { preset: "islands#redDotIcon" },
            );
            map.geoObjects.add(placemark);
          }

          const handleResize = () => map?.container.fitToViewport();
          window.addEventListener("resize", handleResize);
          resizeCleanup = () => window.removeEventListener("resize", handleResize);
        });
      })
      .catch((error) => {
        console.error("[YandexMap]", error);
      });

    return () => {
      cancelled = true;
      resizeCleanup?.();
      map?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, zoom]);

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-[4px] border border-line bg-surface p-6 text-center text-[13px] text-ink-secondary ${className}`}
      >
        Карта появится после подключения API-ключа Яндекс.Карт
      </div>
    );
  }

  return <div ref={containerRef} className={`overflow-hidden rounded-[4px] ${className}`} />;
}
