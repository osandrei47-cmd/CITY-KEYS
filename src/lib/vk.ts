// Публикация объекта каталога на стену группы ВКонтакте — см. кнопку
// «Опубликовать в ВК» в карточке объекта (src/components/admin/VkPublishPanel.tsx).
// Токен сообщества и ID группы берутся только из переменных окружения
// (VK_COMMUNITY_TOKEN, VK_GROUP_ID) — не хардкодить.

import {
  formatPrice,
  propertyTypeLabels,
  richTextToPlainText,
  roomsLabels,
  truncateAtWord,
  type Listing,
} from "@/lib/listing-types";
import { listingUrl } from "@/lib/feed/helpers";

const VK_API_VERSION = "5.199";
const VK_API_BASE = "https://api.vk.com/method";
const POST_DESCRIPTION_MAX_LENGTH = 400;

function getVkCredentials(): { token: string; groupId: string } {
  const token = process.env.VK_COMMUNITY_TOKEN;
  const groupId = process.env.VK_GROUP_ID;
  if (!token || !groupId) {
    throw new Error("VK_COMMUNITY_TOKEN и/или VK_GROUP_ID не заданы в переменных окружения");
  }
  return { token, groupId };
}

async function vkApi<T>(method: string, params: Record<string, string>): Promise<T> {
  const { token } = getVkCredentials();
  const url = new URL(`${VK_API_BASE}/${method}`);
  url.searchParams.set("access_token", token);
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

// ВРЕМЕННО ОТКЛЮЧЕНО: двухшаговая загрузка фото для attachment поста на
// стене (photos.getWallUploadServer + photos.saveWallPhoto, см.
// https://dev.vk.com/ru/method/photos.saveWallPhoto). photos.getWallUploadServer
// не работает с токеном сообщества, а получение токена пользователя теперь
// требует отдельной верификации через VK ID — пока публикуем только
// message со ссылкой на объект, ВК сам подтягивает превью по og:image
// страницы (см. generateMetadata в katalog/obyekt/[id]/page.tsx). Если
// решим доделать загрузку фото — раскомментировать и вернуть вызов в
// publishListingToVk ниже.
//
// async function uploadWallPhoto(photoUrl: string): Promise<string> {
//   const { groupId } = getVkCredentials();
//
//   const uploadServer = await vkApi<{ upload_url: string }>("photos.getWallUploadServer", {
//     group_id: groupId,
//   });
//
//   const photoRes = await fetch(photoUrl);
//   if (!photoRes.ok) {
//     throw new Error(`Не удалось скачать фото объекта (${photoRes.status})`);
//   }
//   const photoBlob = await photoRes.blob();
//
//   const form = new FormData();
//   form.append("photo", photoBlob, "photo.jpg");
//
//   const uploadRes = await fetch(uploadServer.upload_url, { method: "POST", body: form });
//   const uploadJson = (await uploadRes.json()) as { photo?: string; server?: number; hash?: string };
//   if (!uploadJson.photo || uploadJson.photo === "[]") {
//     throw new Error("Сервер ВКонтакте не принял загруженное фото");
//   }
//
//   const saved = await vkApi<Array<{ id: number; owner_id: number }>>("photos.saveWallPhoto", {
//     group_id: groupId,
//     photo: uploadJson.photo,
//     server: String(uploadJson.server ?? ""),
//     hash: uploadJson.hash ?? "",
//   });
//
//   const photo = saved[0];
//   return `photo${photo.owner_id}_${photo.id}`;
// }

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
): Promise<{ postId: number; groupId: string }> {
  const { groupId } = getVkCredentials();

  // ПРОВЕРЕНО НАПРЯМУЮ через VK API (2026-09-09): передача ссылки на объект
  // через attachments (без attachments это работает, см. комментарий у
  // закомментированного uploadWallPhoto выше) стабильно возвращает ошибку
  // "link_photo_sizing_rule. No photo given" — и это не связано с нашей
  // страницей: та же ошибка воспроизводится на заведомо рабочей чужой
  // странице (ru.wikipedia.org) и на прямой ссылке на файл картинки.
  // Причина — жёсткое ограничение VK API для токена СООБЩЕСТВА: как и
  // photos.getWallUploadServer (падает с "method is unavailable with group
  // auth"), автоген превью по ссылке в attachments токену сообщества
  // недоступен ни в каком виде. Нужен user-токен админа группы (VK ID)
  // с правами wall+photos — тогда можно будет вернуть либо загрузку фото,
  // либо attachments-ссылку. До тех пор — только текст со ссылкой внутри
  // message, без attachments (иначе wall.post падает с ошибкой на каждый
  // вызов).
  const message = buildVkPostMessage(listing);

  const result = await vkApi<{ post_id: number }>("wall.post", {
    owner_id: String(-Math.abs(Number(groupId))),
    from_group: "1",
    message,
  });

  return { postId: result.post_id, groupId };
}
