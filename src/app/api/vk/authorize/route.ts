// Шаги 2-3 флоу VK ID (auth-without-sdk): генерируем PKCE-пару и state,
// прячем их в httpOnly-cookie на время редиректа через id.vk.ru, и уводим
// администратора на страницу разрешения доступа. Колбэк — см.
// src/app/api/vk/callback/route.ts.
//
// Открывается вручную один раз (и повторно, если понадобится
// переавторизация — см. ссылку в src/components/admin/VkPublishPanel.tsx),
// администратором, залогиненным в /staff-x7k2 — сессионная cookie Payload
// уже есть в браузере на момент захода сюда.
import { createHash, randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getPayloadClient } from "@/lib/payload-client";
import {
  VK_OAUTH_AUTHORIZE_URL,
  VK_OAUTH_PKCE_COOKIE,
  VK_OAUTH_REDIRECT_URI,
  VK_OAUTH_SCOPE,
} from "@/lib/vk";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (user?.role !== "admin") {
    return new Response("Доступ только для администратора — войдите в /staff-x7k2.", {
      status: 403,
    });
  }

  const clientId = process.env.VK_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response("VK_OAUTH_CLIENT_ID не задан в переменных окружения.", { status: 500 });
  }

  // RFC 7636: code_verifier — 43-128 символов из [A-Za-z0-9-._~].
  // base64url без паддинга даёт ровно такой алфавит.
  const codeVerifier = randomBytes(64).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  // Требование VK ID: state длиной не менее 32 символов из [a-zA-Z0-9_-].
  const state = randomBytes(24).toString("base64url");

  const authorizeUrl = new URL(VK_OAUTH_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", VK_OAUTH_REDIRECT_URI);
  authorizeUrl.searchParams.set("scope", VK_OAUTH_SCOPE);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(VK_OAUTH_PKCE_COOKIE, JSON.stringify({ codeVerifier, state }), {
    httpOnly: true,
    secure: true,
    // lax — нужен именно так: cookie должна дожить до top-level GET-редиректа
    // обратно с id.vk.ru на наш callback.
    sameSite: "lax",
    maxAge: 600,
    path: "/api/vk",
  });
  return response;
}
