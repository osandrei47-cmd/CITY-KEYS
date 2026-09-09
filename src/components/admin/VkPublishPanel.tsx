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

export const VkPublishPanel: UIFieldServerComponent = ({ data }) => {
  const listingId = data?.id as number | string | undefined;
  const vkPublishedAt = (data?.vkPublishedAt as string | null | undefined) ?? null;
  const vkPostId = (data?.vkPostId as string | null | undefined) ?? null;

  if (!listingId) {
    return <p style={{ fontSize: 13, opacity: 0.6 }}>Сохраните объект, чтобы опубликовать в ВК.</p>;
  }

  const groupId = process.env.VK_GROUP_ID;
  const postUrl = groupId && vkPostId ? `https://vk.com/wall-${groupId}_${vkPostId}` : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
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
    </div>
  );
};
