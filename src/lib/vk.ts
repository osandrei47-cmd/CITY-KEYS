// Публикация объекта каталога на стену группы ВКонтакте — см. кнопку
// «Опубликовать в ВК» в карточке объекта (src/components/admin/VkPublishPanel.tsx).
//
// ВАЖНО (2026-09-09/10): токен СООБЩЕСТВА для этого не подходит —
// photos.getWallUploadServer возвращает "Group authorization failed: method
// is unavailable with group auth" (код 27), и это жёсткое ограничение VK API,
// а не вопрос выданных прав. Публикуем от имени пользователя-админа группы
// через VK ID OAuth 2.1 + PKCE (id.vk.ru) — см. src/app/api/vk/authorize и
// src/app/api/vk/callback для первичной авторизации. access_token живёт 1
// час, поэтому перед каждым вызовом API получаем его через
// getValidVkAccessToken(), которая сама обновляет токен через refresh_token,
// если он скоро истечёт — см. глобал "vk-oauth" (src/globals/VkOAuth.ts) для
// хранения текущих токенов.
//
// ID группы и клиентские данные приложения VK ID — только через переменные
// окружения (VK_GROUP_ID, VK_OAUTH_CLIENT_ID, VK_OAUTH_CLIENT_SECRET), не
// хардкодить.

import type { Payload } from "payload";
import { randomBytes } from "crypto";
import {
  formatPrice,
  isMediaDoc,
  propertyTypeLabels,
  richTextToPlainText,
  roomsLabels,
  truncateAtWord,
  type Listing,
} from "@/lib/listing-types";
import { absoluteUrl, listingUrl } from "@/lib/feed/helpers";
import { SITE_URL } from "@/lib/feed/constants";

const VK_API_VERSION = "5.199";
const VK_API_BASE = "https://api.vk.com/method";
export const VK_OAUTH_AUTHORIZE_URL = "https://id.vk.ru/authorize";
const VK_OAUTH_TOKEN_URL = "https://id.vk.ru/oauth2/auth";
const POST_DESCRIPTION_MAX_LENGTH = 400;

// offline — обязателен, иначе VK не выдаёт refresh_token и токен умирает
// через час без возможности продления.
export const VK_OAUTH_SCOPE = "wall photos groups offline";
export const VK_OAUTH_REDIRECT_URI = `${SITE_URL}/api/vk/callback`;
export const VK_OAUTH_PKCE_COOKIE = "vk_oauth_pkce";

// Обновляем access_token заранее, за 5 минут до истечения — с запасом на
// время самого запроса публикации (загрузка фото + wall.post).
const REFRESH_SAFETY_MARGIN_MS = 5 * 60 * 1000;

function getGroupId(): string {
  const groupId = process.env.VK_GROUP_ID;
  if (!groupId) {
    throw new Error("VK_GROUP_ID не задан в переменных окружения");
  }
  return groupId;
}

export function getVkOAuthAppCredentials(): { clientId: string; clientSecret: string | undefined } {
  const clientId = process.env.VK_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("VK_OAUTH_CLIENT_ID не задан в переменных окружения");
  }
  return { clientId, clientSecret: process.env.VK_OAUTH_CLIENT_SECRET };
}

type VkTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user_id?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

async function requestVkOAuthToken(body: URLSearchParams): Promise<VkTokenResponse> {
  const res = await fetch(VK_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as VkTokenResponse;
  if (json.error) {
    throw new Error(`VK ID OAuth: ${json.error_description ?? json.error}`);
  }
  return json;
}

// Шаг 5 флоу VK ID (auth-without-sdk) — обмен кода авторизации на первую
// пару access_token/refresh_token. code/deviceId приходят на redirect_uri
// от VK, codeVerifier — та же строка, что породила code_challenge на шаге 2.
export async function exchangeVkAuthCode(params: {
  code: string;
  codeVerifier: string;
  deviceId: string;
  redirectUri: string;
  state: string;
}): Promise<VkTokenResponse> {
  const { clientId, clientSecret } = getVkOAuthAppCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    code_verifier: params.codeVerifier,
    client_id: clientId,
    device_id: params.deviceId,
    redirect_uri: params.redirectUri,
    state: params.state,
  });
  if (clientSecret) body.set("client_secret", clientSecret);

  return requestVkOAuthToken(body);
}

// Шаг 6 флоу VK ID — обновление access_token через refresh_token. device_id
// здесь ОБЯЗАН быть тем же, что был выдан при первичной авторизации (шаг 4)
// — это не разовый идентификатор запроса, а идентификатор устройства на всё
// время жизни refresh_token.
async function refreshVkAccessToken(payload: Payload): Promise<string> {
  const state = await payload.findGlobal({ slug: "vk-oauth" });
  if (!state.refreshToken || !state.deviceId) {
    throw new Error(
      "ВК не авторизован (нет refresh_token) — пройдите авторизацию через /api/vk/authorize",
    );
  }

  const { clientId, clientSecret } = getVkOAuthAppCredentials();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: state.refreshToken,
    client_id: clientId,
    device_id: state.deviceId,
    // Требование VK ID — уникальная строка на каждый запрос, не для сверки.
    state: randomBytes(16).toString("base64url"),
  });
  if (clientSecret) body.set("client_secret", clientSecret);

  const tokens = await requestVkOAuthToken(body);

  await payload.updateGlobal({
    slug: "vk-oauth",
    data: {
      accessToken: tokens.access_token,
      // VK не всегда присылает новый refresh_token при обновлении — если не
      // прислал, старый остаётся действительным.
      refreshToken: tokens.refresh_token ?? state.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope ?? state.scope,
    },
  });

  return tokens.access_token;
}

// Возвращает рабочий access_token, обновляя его через refresh_token, если
// он истёк или истекает в ближайшие 5 минут. Вызывается перед каждой
// публикацией — так кнопка не падает через час после последнего входа.
export async function getValidVkAccessToken(payload: Payload): Promise<string> {
  const state = await payload.findGlobal({ slug: "vk-oauth" });
  if (!state.accessToken || !state.refreshToken) {
    throw new Error(
      "ВК не авторизован — откройте /api/vk/authorize под администратором и разрешите доступ",
    );
  }

  const expiresAt = state.expiresAt ? new Date(state.expiresAt).getTime() : 0;
  if (Date.now() < expiresAt - REFRESH_SAFETY_MARGIN_MS) {
    return state.accessToken;
  }

  return refreshVkAccessToken(payload);
}

async function vkApi<T>(method: string, params: Record<string, string>, accessToken: string): Promise<T> {
  const url = new URL(`${VK_API_BASE}/${method}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("v", VK_API_VERSION);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { method: "POST" });
  const json = (await res.json()) as { error?: { error_code: number; error_msg: string }; response?: T };
  if (json.error) {
    throw new Error(`VK API (${method}): ${json.error.error_msg} [код ${json.error.error_code}]`);
  }
  return json.response as T;
}

// Двухшаговая загрузка фото для attachment поста на стене — см.
// https://dev.vk.com/ru/method/photos.saveWallPhoto. Требует user-токен
// (см. заголовок файла) — с токеном сообщества photos.getWallUploadServer
// падает с "method is unavailable with group auth".
async function uploadWallPhoto(photoUrl: string, accessToken: string): Promise<string> {
  const groupId = getGroupId();

  const uploadServer = await vkApi<{ upload_url: string }>(
    "photos.getWallUploadServer",
    { group_id: groupId },
    accessToken,
  );

  const photoRes = await fetch(photoUrl);
  if (!photoRes.ok) {
    throw new Error(`Не удалось скачать фото объекта (${photoRes.status})`);
  }
  const photoBlob = await photoRes.blob();

  const form = new FormData();
  form.append("photo", photoBlob, "photo.jpg");

  const uploadRes = await fetch(uploadServer.upload_url, { method: "POST", body: form });
  const uploadJson = (await uploadRes.json()) as { photo?: string; server?: number; hash?: string };
  if (!uploadJson.photo || uploadJson.photo === "[]") {
    throw new Error("Сервер ВКонтакте не принял загруженное фото");
  }

  const saved = await vkApi<Array<{ id: number; owner_id: number }>>(
    "photos.saveWallPhoto",
    {
      group_id: groupId,
      photo: uploadJson.photo,
      server: String(uploadJson.server ?? ""),
      hash: uploadJson.hash ?? "",
    },
    accessToken,
  );

  const photo = saved[0];
  return `photo${photo.owner_id}_${photo.id}`;
}

export function buildVkPostMessage(listing: Listing): string {
  const lines: string[] = [];

  const typeLabel = propertyTypeLabels[listing.propertyType];
  const roomsLabel = listing.rooms ? roomsLabels[listing.rooms] : null;
  lines.push([typeLabel, roomsLabel].filter(Boolean).join(", "));
  lines.push(formatPrice(listing.price));

  const details: string[] = [];
  if (listing.areaTotal) details.push(`${listing.areaTotal} м²`);
  else if (listing.areaLot) details.push(`${listing.areaLot} сот.`);
  const place = listing.locality || listing.address;
  if (place) details.push(place);
  if (details.length) lines.push(details.join(", "));

  const description = truncateAtWord(
    richTextToPlainText(listing.description).replace(/\s+/g, " "),
    POST_DESCRIPTION_MAX_LENGTH,
  );
  if (description) {
    lines.push("");
    lines.push(description);
  }

  lines.push("");
  lines.push(listingUrl(listing));

  return lines.join("\n");
}

export async function publishListingToVk(
  listing: Listing,
  payload: Payload,
): Promise<{ postId: number; groupId: string }> {
  const groupId = getGroupId();
  const accessToken = await getValidVkAccessToken(payload);

  const coverPhoto = (listing.photos ?? []).find(isMediaDoc);
  const attachment = coverPhoto?.url
    ? await uploadWallPhoto(absoluteUrl(coverPhoto.url), accessToken)
    : null;

  const message = buildVkPostMessage(listing);

  const result = await vkApi<{ post_id: number }>(
    "wall.post",
    {
      owner_id: String(-Math.abs(Number(groupId))),
      from_group: "1",
      message,
      ...(attachment ? { attachments: attachment } : {}),
    },
    accessToken,
  );

  return { postId: result.post_id, groupId };
}
