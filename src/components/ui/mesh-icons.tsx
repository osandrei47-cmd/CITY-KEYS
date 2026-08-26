import type { ComponentType } from "react";
import { House, ArrowUpRight, ArrowLeftRight, CalendarDays, Settings, TreePine, Handshake } from "lucide-react";

// Составные и кастомные иконки для MeshGradientCard — используются там, где
// в lucide-react нет готового подходящего значка (кран, «дом + …»).

type IconProps = { size?: number; strokeWidth?: number; className?: string };

function HouseBadgeIcon({
  Badge,
  corner = "bottom-right",
  size = 24,
  strokeWidth = 1.75,
  className = "",
}: IconProps & {
  Badge: ComponentType<IconProps>;
  corner?: "top-right" | "bottom-right";
}) {
  const badgeSize = Math.round(size * 0.55);
  const cornerClass = corner === "top-right" ? "-right-1 -top-1" : "-bottom-1 -right-1";
  return (
    <span className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <House size={size} strokeWidth={strokeWidth} className="absolute inset-0" />
      <Badge size={badgeSize} strokeWidth={strokeWidth + 0.25} className={`absolute ${cornerClass}`} />
    </span>
  );
}

// Продать — дом со стрелкой вверх
export function HouseUpIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={ArrowUpRight} corner="top-right" />;
}

// Продажа и покупка — дом с двусторонней стрелкой
export function HouseArrowsIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={ArrowLeftRight} corner="bottom-right" />;
}

// Аренда — календарь с домом
export function HouseCalendarIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={CalendarDays} corner="bottom-right" />;
}

// Управление недвижимостью — шестерёнка на фоне дома
export function HouseGearIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={Settings} corner="bottom-right" />;
}

// Сопровождение сделки — дом с рукопожатием
export function HouseHandshakeIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={Handshake} corner="bottom-right" />;
}

// Дачи — небольшой домик с деревом
export function HouseTreeIcon(props: IconProps) {
  return <HouseBadgeIcon {...props} Badge={TreePine} corner="bottom-right" />;
}

// Строительный кран — в lucide-react готовой иконки нет, рисуем в том же
// stroke-стиле (viewBox 24×24, скруглённые концы линий).
export function CraneIcon({ size = 24, strokeWidth = 1.75, className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 21V3" />
      <path d="M5 3h16" />
      <path d="M5 3 2 5" />
      <path d="M5 8 18 3" />
      <path d="M18 3v6" />
      <path d="M16.5 9h3" />
      <path d="M2 21h9" />
    </svg>
  );
}
