import { NextResponse, type NextRequest } from "next/server";

const BYPASS_COOKIE = "bypass_maintenance";
const PREVIEW_PATH = "/preview-ck2026";
const MAINTENANCE_PATH = "/maintenance";
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

// Пути, которые всегда доступны, даже когда включён режим реконструкции.
const ALLOWED_PREFIXES = [MAINTENANCE_PATH, PREVIEW_PATH, "/staff-x7k2", "/api", "/feed"];

// Статические файлы по расширению — регистронезависимо (в отличие от
// matcher-регэкспа ниже, где нет флага /i). Важно: файлы в public/ иногда
// имеют расширение в верхнем регистре (например, .JPG) — исходники с
// камеры/телефона часто так называются, и без /i такие запросы уходили бы
// в proxy() наравне с обычными страницами, включая внутренний self-fetch
// Next.js для /_next/image.
const STATIC_FILE_PATTERN = /\.(ico|png|jpe?g|gif|webp|svg|xml|txt|webmanifest)$/i;

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_FILE_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  // Секретный обход: ставим cookie на 30 дней и уводим на главную.
  if (pathname === PREVIEW_PATH) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(BYPASS_COOKIE, "true", {
      maxAge: BYPASS_COOKIE_MAX_AGE,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  if (process.env.MAINTENANCE_MODE !== "true") {
    return NextResponse.next();
  }

  if (request.cookies.get(BYPASS_COOKIE)?.value === "true") {
    return NextResponse.next();
  }

  if (isAllowedPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(MAINTENANCE_PATH, request.url));
}

export const config = {
  // Внутренние ассеты Next.js исключаем на уровне matcher (это безопасно —
  // регистр здесь всегда фиксированный). Статику по расширению — уже внутри
  // proxy(), через STATIC_FILE_PATTERN с флагом /i.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
