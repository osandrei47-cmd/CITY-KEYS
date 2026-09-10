import type { UIFieldServerComponent } from "payload";
import { VkPublishButton } from "./VkPublishButton";

function formatPublishedDate(iso?: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(iso));
}

export const VkPublishPanel: UIFieldServerComponent = async ({ data, payload }) => {
  const listingId = data?.id as number | string | undefined;
  const vkPublishedAt = (data?.vkPublishedAt as string | null | undefined) ?? null;
  const vkPostId = (data?.vkPostId as string | null | undefined) ?? null;

  if (!listingId) {
    return <p style={{ fontSize: 13, opacity: 0.6 }}>Сохраните объект, чтобы опубликовать в ВК.</p>;
  }

  const groupId = process.env.VK_GROUP_ID;
  const postUrl = groupId && vkPostId ? `https://vk.com/wall-${groupId}_${vkPostId}` : null;

  // publishListingToVk сам обновляет access_token через refresh_token перед
  // публикацией (см. src/lib/vk.ts) — здесь просто показываем админу, нужна
  // ли вообще первичная/повторная авторизация через /api/vk/authorize, чтобы
  // не пришлось узнавать об этом только по ошибке после клика на кнопку.
  const oauthState = await payload.findGlobal({ slug: "vk-oauth" }).catch(() => null);
  const oauthReady = Boolean(oauthState?.accessToken && oauthState?.refreshToken);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
      {!oauthReady ? (
        <p style={{ fontSize: 13, color: "#991b1b" }}>
          ВК не авторизован —{" "}
          <a href="/api/vk/authorize" target="_blank" rel="noreferrer">
            пройти авторизацию
          </a>{" "}
          (нужны права администратора группы).
        </p>
      ) : null}
      <VkPublishButton listingId={listingId} alreadyPublished={Boolean(vkPublishedAt)} />
      {vkPublishedAt ? (
        <p style={{ fontSize: 13, opacity: 0.75 }}>
          Опубликовано в ВК {formatPublishedDate(vkPublishedAt)}
          {postUrl ? (
            <>
              {" · "}
              <a href={postUrl} target="_blank" rel="noreferrer">
                открыть пост
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {oauthReady ? (
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          <a href="/api/vk/authorize" target="_blank" rel="noreferrer">
            Переавторизовать ВК
          </a>{" "}
          (если публикация начнёт падать с ошибкой авторизации)
        </p>
      ) : null}
    </div>
  );
};
