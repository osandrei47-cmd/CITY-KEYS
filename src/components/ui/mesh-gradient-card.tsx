import type { ComponentType, ReactNode } from "react";

export type MeshGradientIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type Blob = { x: number; y: number; size: number; opacity: number };

// Пять уникальных раскладок пятен в одной палитре акцента (#D79A55) —
// переиспользуются для карточек направлений на главной и карточек блога,
// чтобы соседние карточки визуально отличались друг от друга.
const GRADIENT_VARIANTS: Blob[][] = [
  [
    { x: 18, y: 22, size: 65, opacity: 0.4 },
    { x: 88, y: 18, size: 45, opacity: 0.22 },
    { x: 55, y: 95, size: 55, opacity: 0.15 },
  ],
  [
    { x: 85, y: 25, size: 60, opacity: 0.38 },
    { x: 12, y: 65, size: 50, opacity: 0.24 },
    { x: 55, y: 100, size: 40, opacity: 0.15 },
  ],
  [
    { x: 50, y: 5, size: 55, opacity: 0.35 },
    { x: 8, y: 85, size: 60, opacity: 0.2 },
    { x: 92, y: 80, size: 40, opacity: 0.17 },
  ],
  [
    { x: 25, y: 95, size: 65, opacity: 0.4 },
    { x: 80, y: 55, size: 42, opacity: 0.2 },
    { x: 15, y: 10, size: 35, opacity: 0.18 },
  ],
  [
    { x: 75, y: 90, size: 58, opacity: 0.36 },
    { x: 20, y: 35, size: 50, opacity: 0.22 },
    { x: 92, y: 8, size: 32, opacity: 0.16 },
  ],
];

export const MESH_GRADIENT_VARIANT_COUNT = GRADIENT_VARIANTS.length;

// Требует className="group" на предке (обычно на Link) — эффект наведения
// (усиление яркости пятен + едва заметное увеличение карточки) завязан на
// group-hover.
export function MeshGradientCard({
  icon: Icon,
  variant = 0,
  iconSize = 28,
  align = "center",
  className = "",
  children,
}: {
  icon: MeshGradientIcon;
  variant?: number;
  iconSize?: number;
  align?: "center" | "start";
  className?: string;
  children?: ReactNode;
}) {
  const blobs = GRADIENT_VARIANTS[variant % GRADIENT_VARIANTS.length];

  return (
    <div
      className={`relative overflow-hidden bg-[#0a0a0a] transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
    >
      <div className="absolute inset-0 transition-[filter] duration-300 group-hover:brightness-125">
        {blobs.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}%`,
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(215,154,85,${b.opacity}) 0%, rgba(215,154,85,0) 70%)`,
            }}
          />
        ))}
      </div>
      <div
        className={`relative flex h-full flex-col p-5 ${
          align === "center" ? "items-center justify-center" : "justify-start"
        }`}
      >
        <Icon size={iconSize} strokeWidth={1.75} className="text-accent" />
        {children}
      </div>
    </div>
  );
}
