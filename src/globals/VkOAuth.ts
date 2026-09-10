import type { GlobalConfig } from "payload";

// Служебное хранилище VK ID OAuth-токенов для публикации в ВК от имени
// админа группы (см. src/lib/vk.ts, src/app/api/vk/authorize,
// src/app/api/vk/callback). access_token живёт всего 1 час — vk.ts сам
// обновляет его через refresh_token перед каждой публикацией и пишет
// новые значения сюда. Руками эти поля не редактируются, отсюда
// admin.hidden на глобале целиком и readOnly на каждом поле.
export const VkOAuth: GlobalConfig = {
  slug: "vk-oauth",
  label: "VK OAuth (служебное)",
  access: {
    read: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    hidden: true,
  },
  fields: [
    { name: "accessToken", label: "Access token", type: "text", admin: { readOnly: true } },
    { name: "refreshToken", label: "Refresh token", type: "text", admin: { readOnly: true } },
    {
      name: "deviceId",
      label: "Device ID",
      type: "text",
      admin: {
        readOnly: true,
        description:
          "Выдаётся VK при первой авторизации (шаг 4 их флоу) и должен оставаться неизменным во всех последующих refresh-запросах — не путать со state, который каждый раз новый.",
      },
    },
    { name: "expiresAt", label: "Access token истекает", type: "date", admin: { readOnly: true } },
    { name: "scope", label: "Выданные права (scope)", type: "text", admin: { readOnly: true } },
  ],
};
