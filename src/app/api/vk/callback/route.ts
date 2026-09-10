// Шаги 4-5 флоу VK ID (auth-without-sdk). VK редиректит сюда с
// code/state/device_id в query после того, как администратор разрешил
// доступ на id.vk.ru (см. src/app/api/vk/authorize/route.ts). Здесь мы:
// сверяем state с тем, что сохранили в cookie при старте, обмениваем code
// на access_token/refresh_token, сохраняем их вместе с device_id в глобал
// vk-oauth (src/globals/VkOAuth.ts) — device_id обязателен на все будущие
// refresh-запросы (см. src/lib/vk.ts).
//
// ВАЖНО (требование самого VK ID к redirect_uri): страница обмена кода не
// должна содержать скриптов/картинок/стилей/встроенного контента — иначе
// эти данные можно увести через встроенный скрипт или заголовок Referer.
// Поэтому это голый Route Handler с текстовым ответом, без HTML/JS/CSS.
import { NextResponse, type NextRequest } from "next/server";
import { getPayloadClient } from "@/lib/payload-client";
import { exchangeVkAuthCode, VK_OAUTH_PKCE_COOKIE, VK_OAUTH_REDIRECT_URI } from "@/lib/vk";

export const dynamic = "force-dynamic";

function plainTextResponse(body: string, status: number): NextResponse {
  const response = new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  response.cookies.delete({ name: VK_OAUTH_PKCE_COOKIE, path: "/api/vk" });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const deviceId = searchParams.get("device_id");
  const vkError = searchParams.get("error");

  if (vkError) {
    return plainTextResponse(
      `VK вернул ошибку авторизации: ${vkError} ${searchParams.get("error_description") ?? ""}`,
      400,
    );
  }
  if (!code || !state || !deviceId) {
    return plainTextResponse(
      "В ответе VK не хватает code/state/device_id — начните заново через /api/vk/authorize.",
      400,
    );
  }

  const cookieRaw = request.cookies.get(VK_OAUTH_PKCE_COOKIE)?.value;
  if (!cookieRaw) {
    return plainTextResponse(
      "Не найдена сохранённая сессия авторизации (cookie истекла или отсутствует). Начните заново через /api/vk/authorize.",
      400,
    );
  }

  let saved: { codeVerifier: string; state: string };
  try {
    saved = JSON.parse(cookieRaw);
  } catch {
    return plainTextResponse("Повреждённая cookie авторизации. Начните заново через /api/vk/authorize.", 400);
  }

  if (saved.state !== state) {
    return plainTextResponse(
      "Параметр state не совпадает с ожидаемым — похоже на подмену запроса. Начните заново через /api/vk/authorize.",
      400,
    );
  }

  try {
    const tokens = await exchangeVkAuthCode({
      code,
      codeVerifier: saved.codeVerifier,
      deviceId,
      redirectUri: VK_OAUTH_REDIRECT_URI,
      state,
    });

    const payload = await getPayloadClient();
    await payload.updateGlobal({
      slug: "vk-oauth",
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        deviceId,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope ?? null,
      },
    });

    return plainTextResponse(
      "Готово — ВКонтакте авторизован. Можно закрыть эту вкладку и вернуться в админку.",
      200,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "неизвестная ошибка";
    return plainTextResponse(`Не удалось обменять код на токен: ${message}`, 502);
  }
}
