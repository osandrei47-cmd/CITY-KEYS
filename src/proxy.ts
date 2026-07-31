import { NextResponse, type NextRequest } from "next/server";

const BYPASS_COOKIE = "bypass_maintenance";
const PREVIEW_PATH = "/preview-ck2026";
const MAINTENANCE_PATH = "/maintenance";
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

// Пути, которые всегда доступны, даже когда включён режим реконструкции.
const ALLOWED_PREFIXES = [MAINTENANCE_PATH, PREVIEW_PATH, "/staff-x7k2", "/api", "/feed"];

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  // Пропускаем внутренние ассеты Next.js и любые статические файлы по
  // расширению (изображения, favicon, XML-фиды и т.п.) — им незачем
  // проходить через логику редиректа на /maintenance.
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|xml|txt|webmanifest)$).*)",
  ],
};
