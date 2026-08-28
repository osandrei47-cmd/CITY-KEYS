import type { CollectionConfig } from "payload";
import { DEAL_PIPELINE_STAGES } from "@/lib/deal-pipeline-stages";
import { DEAL_PARTICIPANT_ROLES } from "@/lib/deal-participant-roles";

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  DEAL_PARTICIPANT_ROLES.map(({ value, label }) => [value, label]),
);

// Если название сделки не задано вручную — собираем его из первых
// участников ("Иванов (Покупатель) → Петров (Продавец)"). Хук трогает title
// только когда он пустой — если staff однажды что-то впишет сам, автогенерация
// на этом навсегда останавливается (title больше не пуст).
async function generateDealTitle(
  participants: Array<{ lead?: number | { id: number; name?: string } | null; role?: string | null }> | undefined,
  payload: { findByID: (args: { collection: "leads"; id: number }) => Promise<{ name?: string } | null> },
): Promise<string> {
  const list = participants ?? [];
  if (!list.length) {
    return `Сделка от ${new Date().toLocaleDateString("ru-RU")}`;
  }

  const parts = await Promise.all(
    list.slice(0, 2).map(async (p) => {
      const leadRef = p.lead;
      if (!leadRef) return null;
      const leadId = typeof leadRef === "object" ? leadRef.id : leadRef;
      const name =
        typeof leadRef === "object" && leadRef.name
          ? leadRef.name
          : await payload
              .findByID({ collection: "leads", id: leadId })
              .then((doc) => doc?.name)
              .catch(() => null);
      if (!name) return null;
      const roleLabel = p.role ? ROLE_LABELS[p.role] : null;
      return roleLabel ? `${name} (${roleLabel})` : name;
    }),
  );

  const joined = parts.filter(Boolean).join(" → ");
  return joined || `Сделка от ${new Date().toLocaleDateString("ru-RU")}`;
}

export const Deals: CollectionConfig = {
  slug: "deals",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "stage", "dealType", "amount"],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      label: "Название сделки",
      type: "text",
      admin: {
        description:
          "Можно оставить пустым — при сохранении сгенерируется автоматически по участникам. Если вписать своё название, оно больше не будет перезаписываться.",
      },
    },
    {
      name: "participants",
      label: "Участники",
      type: "array",
      labels: { singular: "Участник", plural: "Участники" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "lead",
              label: "Контакт",
              type: "relationship",
              relationTo: "leads",
              required: true,
              admin: { width: "60%" },
            },
            {
              name: "role",
              label: "Роль",
              type: "select",
              required: true,
              options: DEAL_PARTICIPANT_ROLES.map(({ value, label }) => ({ value, label })),
              admin: { width: "40%" },
            },
          ],
        },
      ],
    },
    {
      name: "listing",
      label: "Объект недвижимости",
      type: "relationship",
      relationTo: "listings",
    },
    {
      name: "dealType",
      label: "Тип сделки",
      type: "select",
      required: true,
      options: [
        { label: "Ипотека", value: "mortgage" },
        { label: "Купля-продажа за наличные", value: "cash" },
        { label: "Аренда", value: "rent" },
        { label: "Сопровождение", value: "support" },
      ],
    },
    {
      name: "stage",
      label: "Этап сделки",
      type: "select",
      required: true,
      defaultValue: DEAL_PIPELINE_STAGES[0].value,
      options: DEAL_PIPELINE_STAGES.map(({ value, label }) => ({ value, label })),
      admin: {
        components: {
          Cell: "@/components/admin/DealPipelineStageCell#DealPipelineStageCell",
        },
      },
    },
    {
      name: "documentsChecklist",
      label: "Чек-лист документов",
      type: "array",
      labels: { singular: "Документ", plural: "Документы" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "name",
              label: "Документ",
              type: "text",
              required: true,
              admin: { width: "50%" },
            },
            {
              name: "received",
              label: "Получено",
              type: "checkbox",
              defaultValue: false,
              admin: { width: "20%" },
            },
            {
              name: "comment",
              label: "Комментарий",
              type: "text",
              admin: { width: "30%" },
            },
          ],
        },
      ],
    },
    {
      name: "amount",
      label: "Сумма сделки / комиссия, ₽",
      type: "number",
      min: 0,
    },
    {
      name: "notes",
      label: "Заметки",
      type: "richText",
    },
    {
      name: "checklistLinks",
      label: "Ссылки на чек-лист для участников",
      type: "join",
      collection: "deal-checklist-links",
      on: "deal",
      admin: {
        allowCreate: true,
        defaultColumns: ["participant", "createdAt"],
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data && !data.title) {
          data.title = await generateDealTitle(data.participants, req.payload);
        }
        return data;
      },
    ],
  },
};
