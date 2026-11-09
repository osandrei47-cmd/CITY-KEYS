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
  dealTypeLabels,
  formatPrice,
  isMediaDoc,
  propertyTypeLabels,
  rentalPeriodLabels,
  richTextToPlainText,
  roomsLabels,
  truncateAtWord,
  type Listing,
} from "@/lib/listing-types";
import { buildFullAddress } from "@/lib/feed/address";
import type { Media } from "@/payload-types";
import { absoluteUrl, listingUrl } from "@/lib/feed/helpers";
import { SITE_URL } from "@/lib/feed/constants";

const VK_API_VERSION = "5.199";
const VK_API_BASE = "https://api.vk.com/method";
export const VK_OAUTH_AUTHORIZE_URL = "https://id.vk.ru/authorize";
const VK_OAUTH_TOKEN_URL = "https://id.vk.ru/oauth2/auth";
const POST_DESCRIPTION_MAX_LENGTH = 400;

// Сколько первых фото из галереи объекта прикреплять к посту — поменять
// при необходимости в одном месте.
const MAX_WALL_PHOTOS = 4;

// Требования VK к фото для wall-вложений (photos.saveWallPhoto) — см.
// https://dev.vk.com/ru/method/photos.saveWallPhoto: JPG/PNG/GIF, не
// больше 50 МБ. Проверяем это ДО похода в VK, чтобы показать понятную
// причину пропуска вместо общей ошибки API.
const ALLOWED_WALL_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_WALL_PHOTO_FILESIZE_BYTES = 50 * 1024 * 1024;

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

// Различаем причины отказа, чтобы в админке показывать не общую ошибку, а
// понятную подсказку: VkReauthRequiredError — нужна переавторизация через
// /api/vk/authorize (нет/истёк/отозван refresh_token, либо токен выдан не
// тому IP — код 5 у VK); VkPermissionError — токен рабочий, но у него не
// хватает прав (scope) на сам метод — переавторизация это не починит, нужно
// проверять права приложения в кабинете VK.
export class VkReauthRequiredError extends Error {}
export class VkPermissionError extends Error {}

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
    throw new VkReauthRequiredError(
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

  // Любая ошибка обновления (invalid_grant/invalid_token и т.п.) означает,
  // что старая пара токенов уже недействительна — починить это может только
  // новая авторизация, поэтому всегда перебрасываем как VkReauthRequiredError.
  let tokens: VkTokenResponse;
  try {
    tokens = await requestVkOAuthToken(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "неизвестная ошибка";
    throw new VkReauthRequiredError(`Не удалось обновить токен ВК: ${message}`);
  }

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
    throw new VkReauthRequiredError(
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
    const message = `VK API (${method}): ${json.error.error_msg} [код ${json.error.error_code}]`;
    // Код 5 — "User authorization failed" (токен истёк/отозван/выдан не
    // тому IP): лечится только переавторизацией. Коды 7 и 15 — "Permission
    // to perform this action is denied"/"Access denied": токен рабочий, но
    // ему не хватает scope на сам метод — переавторизация это не починит,
    // нужно разбираться с правами приложения в кабинете VK (см. docs/vk-id-oauth.md).
    if (json.error.error_code === 5) {
      throw new VkReauthRequiredError(message);
    }
    if (json.error.error_code === 7 || json.error.error_code === 15) {
      throw new VkPermissionError(message);
    }
    throw new Error(message);
  }
  return json.response as T;
}

// Двухшаговая загрузка фото для attachment поста на стене — см.
// https://dev.vk.com/ru/method/photos.saveWallPhoto. Требует user-токен
// (см. заголовок файла) — с токеном сообщества photos.getWallUploadServer
// падает с "method is unavailable with group auth".
export async function uploadWallPhoto(photoUrl: string, accessToken: string): Promise<string> {
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
  const uploadJson = (await uploadRes.json().catch(() => null)) as {
    photo?: string;
    server?: number;
    hash?: string;
    error?: string;
  } | null;
  if (!uploadJson || !uploadJson.photo || uploadJson.photo === "[]") {
    // Точный ответ сервера загрузки ВК — не придумываем причину, если сам
    // VK её не называет явно (например error: "mask error", "failed").
    throw new Error(
      `Сервер ВКонтакте не принял загруженное фото — ответ: ${JSON.stringify(uploadJson)}`,
    );
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

export type VkSkippedPhoto = { filename: string; reason: string };

// Проверяем формат/размер ДО запроса к VK — отдельно от самого API, чтобы
// причина пропуска была понятной ("не тот формат"/"слишком большой файл"),
// а не общей ошибкой VK. Видео сюда никогда не попадает — droneVideo это
// отдельное поле, а само поле "Фотографии" ограничено relationTo: media без
// проверки mimeType на уровне схемы, так что страховка нужна именно тут.
function checkWallPhotoCandidate(doc: Media): string | null {
  if (!doc.url) return "у файла нет URL (не загрузился в S3?)";
  if (!doc.mimeType || !ALLOWED_WALL_PHOTO_MIME_TYPES.includes(doc.mimeType)) {
    return `неподходящий формат файла (${doc.mimeType ?? "неизвестен"}) — ВК принимает только JPG/PNG/GIF`;
  }
  if (doc.filesize && doc.filesize > MAX_WALL_PHOTO_FILESIZE_BYTES) {
    return `файл больше 50 МБ (${Math.round(doc.filesize / 1024 / 1024)} МБ) — ограничение ВК`;
  }
  return null;
}

// Загружает до MAX_WALL_PHOTOS первых фото из галереи ПОСЛЕДОВАТЕЛЬНО (не
// параллельно — чтобы не упереться в лимиты VK на одновременные запросы).
// Если фото не подошло по формату/размеру или VK отказал — весь пост всё
// равно публикуется с оставшимися фото, а причина пропуска возвращается
// отдельно (без замены пропущенного следующим фото из галереи — кандидатов
// всегда ровно первые MAX_WALL_PHOTOS, как в галерее).
async function uploadWallPhotos(
  photos: Media[],
  accessToken: string,
): Promise<{ attachments: string[]; skipped: VkSkippedPhoto[] }> {
  const candidates = photos.slice(0, MAX_WALL_PHOTOS);
  const attachments: string[] = [];
  const skipped: VkSkippedPhoto[] = [];

  for (const doc of candidates) {
    const label = doc.filename ?? `id=${doc.id}`;
    const precheckReason = checkWallPhotoCandidate(doc);
    if (precheckReason) {
      skipped.push({ filename: label, reason: precheckReason });
      continue;
    }

    try {
      const attachment = await uploadWallPhoto(absoluteUrl(doc.url as string), accessToken);
      attachments.push(attachment);
    } catch (error) {
      skipped.push({
        filename: label,
        reason: error instanceof Error ? error.message : "неизвестная ошибка загрузки",
      });
    }
  }

  return { attachments, skipped };
}

// Пост публичный — номер квартиры и кадастровый номер туда не идут (это
// личные данные собственника). Кадастровый номер и так не участвует в
// тексте поста; номер квартиры вырезаем из свободного текста address
// (отдельного поля под него в схеме нет — агенты иногда дописывают "кв. N"
// прямо в адрес). Эвристика над свободным текстом, как и в
// src/lib/feed/address.ts — не гарантия для любых формулировок.
function stripApartmentNumber(address: string): string {
  return address
    .replace(/,?\s*(?:кв\.?|квартира)\s*№?\s*\d+[а-яё]?\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "");
}

// Полный адрес одной строкой — те же поля и та же логика дедупликации
// региона/населённого пункта, что в фидах (buildFullAddress), чтобы не
// получить "Ленинградская область, ... Ленинградская область" и в посте
// ВК. Для квартир — адрес до дома, без номера квартиры (см. выше).
function buildVkPostAddress(listing: Listing): string {
  const address = listing.propertyType === "kvartiry" ? stripApartmentNumber(listing.address ?? "") : listing.address;
  return buildFullAddress({ address, locality: listing.locality });
}

export function buildVkPostMessage(listing: Listing): string {
  const lines: string[] = [];

  lines.push(dealTypeLabels[listing.dealType]);

  const typeLabel = propertyTypeLabels[listing.propertyType];
  const roomsLabel = listing.rooms ? roomsLabels[listing.rooms] : null;
  lines.push([typeLabel, roomsLabel].filter(Boolean).join(", "));

  const priceLine =
    listing.dealType === "rent" && listing.rentalPeriod
      ? `${formatPrice(listing.price)} ${rentalPeriodLabels[listing.rentalPeriod].toLowerCase()}`
      : formatPrice(listing.price);
  lines.push(priceLine);

  if (listing.areaTotal) lines.push(`${listing.areaTotal} м²`);
  else if (listing.areaLot) lines.push(`${listing.areaLot} сот.`);

  const address = buildVkPostAddress(listing);
  if (address) lines.push(address);

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
): Promise<{ postId: number; groupId: string; skippedPhotos: VkSkippedPhoto[] }> {
  const groupId = getGroupId();
  const accessToken = await getValidVkAccessToken(payload);

  const photoDocs = (listing.photos ?? []).filter(isMediaDoc);
  const { attachments, skipped } =
    photoDocs.length > 0 ? await uploadWallPhotos(photoDocs, accessToken) : { attachments: [], skipped: [] };

  const message = buildVkPostMessage(listing);

  const result = await vkApi<{ post_id: number }>(
    "wall.post",
    {
      owner_id: String(-Math.abs(Number(groupId))),
      from_group: "1",
      message,
      ...(attachments.length > 0 ? { attachments: attachments.join(",") } : {}),
    },
    accessToken,
  );

  return { postId: result.post_id, groupId, skippedPhotos: skipped };
}
