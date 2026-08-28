import type { CollectionConfig } from "payload";
import { randomUUID } from "crypto";

// Отдельная коллекция вместо токена внутри массива participants у Deals —
// так публичная страница чек-листа ищет сделку простым where по обычному
// верхнеуровневому полю (token), а не query по вложенному array-полю.
// Создаётся из карточки сделки через join-поле checklistLinks (см. Deals.ts,
// admin.allowCreate — тот же приём, что и join "tasks" у Leads).
export const DealChecklistLinks: CollectionConfig = {
  slug: "deal-checklist-links",
  admin: {
    defaultColumns: ["deal", "participant", "createdAt"],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "deal",
      label: "Сделка",
      type: "relationship",
      relationTo: "deals",
      required: true,
    },
    {
      name: "participant",
      label: "Участник (кому отправляем ссылку)",
      type: "relationship",
      relationTo: "leads",
      required: true,
    },
    {
      name: "token",
      label: "Ссылка на чек-лист",
      type: "text",
      admin: {
        readOnly: true,
        description: "Генерируется автоматически при сохранении — скопируйте ссылку и отправьте участнику вручную (WhatsApp/Telegram).",
        components: {
          Field: "@/components/admin/ChecklistLinkField#ChecklistLinkField",
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && !data.token) {
          data.token = randomUUID();
        }
        return data;
      },
    ],
  },
};
