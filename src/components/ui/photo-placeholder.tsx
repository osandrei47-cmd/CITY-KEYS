"use client";

import { useId } from "react";

/**
 * Стенд-ин для фото/видео до получения реальных ассетов.
 * assetHint виден только в dev-режиме — подсказка, какой файл сюда встанет.
 */
export function PhotoPlaceholder({
  assetHint,
  className = "",
  children,
}: {
  assetHint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const filterId = useId();

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(120% 90% at 30% 20%, #23262B 0%, #0D0F12 62%)",
      }}
    >
      <svg width="0" height="0" className="absolute">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0"
          />
        </filter>
      </svg>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ filter: `url(#${filterId})` }}
      />
      {process.env.NODE_ENV === "development" && assetHint ? (
        <div className="absolute left-3 top-3 right-3 text-[10px] leading-tight text-ink/40">
          ФОТО-ПЛЕЙСХОЛДЕР — {assetHint}
        </div>
      ) : null}
      {children}
    </div>
  );
}
