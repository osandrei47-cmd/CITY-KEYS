// Публикация объекта каталога на стену группы ВКонтакте — см. кнопку
// «Опубликовать в ВК» в карточке объекта (src/components/admin/VkPublishPanel.tsx).
// Токен сообщества и ID группы берутся только из переменных окружения
// (VK_COMMUNITY_TOKEN, VK_GROUP_ID) — не хардкодить.

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

// Двухшаговая загрузка фото для attachment поста на стене — см.
// https://dev.vk.com/ru/method/photos.saveWallPhoto
async function uploadWallPhoto(photoUrl: string): Promise<string> {
  const { groupId } = getVkCredentials();

  const uploadServer = await vkApi<{ upload_url: string }>("photos.getWallUploadServer", {
    group_id: groupId,
  });

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

  const saved = await vkApi<Array<{ id: number; owner_id: number }>>("photos.saveWallPhoto", {
    group_id: groupId,
    photo: uploadJson.photo,
    server: String(uploadJson.server ?? ""),
    hash: uploadJson.hash ?? "",
  });

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
): Promise<{ postId: number; groupId: string }> {
  const { groupId } = getVkCredentials();

  const coverPhoto = (listing.photos ?? []).find(isMediaDoc);
  const attachment = coverPhoto?.url ? await uploadWallPhoto(absoluteUrl(coverPhoto.url)) : null;

  const message = buildVkPostMessage(listing);

  const result = await vkApi<{ post_id: number }>("wall.post", {
    owner_id: String(-Math.abs(Number(groupId))),
    from_group: "1",
    message,
    ...(attachment ? { attachments: attachment } : {}),
  });

  return { postId: result.post_id, groupId };
}
