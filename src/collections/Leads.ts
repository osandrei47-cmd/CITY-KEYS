import type { CollectionConfig } from "payload";
import { sendLeadNotification } from "@/lib/send-lead-email";
import { DEAL_STAGES } from "@/lib/lead-deal-stages";
import { LEAD_SOURCES } from "@/lib/lead-sources";

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "source", "dealStage", "createdAt"],
  },
  access: {
    // Публичная форма на сайте создаёт заявки без авторизации
    create: () => true,
    // Смотреть заявки может любой вошедший пользователь — и администратор, и будущий "наблюдатель"
    read: ({ req }) => Boolean(req.user),
    // Менять статус и удалять заявки — только администратор
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      label: "Имя",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      label: "Телефон",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
    },
    {
      name: "source",
      label: "Источник заявки",
      type: "select",
      required: true,
      options: LEAD_SOURCES.map(({ value, label }) => ({ value, label })),
    },
    {
      name: "message",
      label: "Комментарий / сообщение от клиента",
      type: "textarea",
    },
    {
      name: "notesPanel",
      label: "Заметки",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/LeadNotesPanel#LeadNotesPanel",
        },
      },
    },
    {
      // Журнал того, что уже произошло по заявке ("звонил, обсудили бюджет") —
      // не путать с полем "tasks" ниже, которое про предстоящие дела.
      // Собственный интерфейс — see LeadNotesPanel; сама таблица скрыта из
      // формы (admin.hidden), дату и автора всегда проставляет beforeChange.
      name: "notes",
      label: "Заметки",
      type: "array",
      admin: { hidden: true },
      fields: [
        {
          name: "text",
          label: "Текст",
          type: "textarea",
          required: true,
        },
        {
          name: "createdAt",
          label: "Дата и время",
          type: "date",
          admin: { readOnly: true },
        },
        {
          name: "authorEmail",
          label: "Автор",
          type: "text",
          admin: { readOnly: true },
        },
      ],
    },
    {
      // Необязательная связь — проставляется автоматически, когда заявка
      // отправлена со страницы конкретного объекта каталога (см. ContactForm).
      // Заявки по ипотеке/страхованию/общим «Контактам» её не имеют — это ок.
      name: "listing",
      label: "Объект из каталога",
      type: "relationship",
      relationTo: "listings",
    },
    {
      name: "listingPreview",
      label: "",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/LeadListingPreview#LeadListingPreview",
        },
      },
    },
    {
      name: "dealStage",
      label: "Этап сделки",
      type: "select",
      required: true,
      defaultValue: "new-lead",
      options: DEAL_STAGES.map(({ value, label }) => ({ value, label })),
      admin: {
        components: {
          Cell: "@/components/admin/DealStageCell#DealStageCell",
        },
      },
    },
    {
      name: "tasks",
      label: "Задачи",
      type: "join",
      collection: "tasks",
      on: "lead",
      defaultSort: "dueDate",
      admin: {
        allowCreate: true,
        defaultColumns: ["description", "dueDate", "done"],
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "consentGiven",
          label: "Согласие на обработку ПДн получено",
          type: "checkbox",
          required: true,
          defaultValue: false,
          admin: { width: "50%" },
        },
        {
          name: "consentDate",
          label: "Дата согласия",
          type: "date",
          admin: {
            width: "50%",
            readOnly: true,
            description: "Проставляется автоматически при получении согласия",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.consentGiven && !data.consentDate) {
          data.consentDate = new Date().toISOString();
        }
        return data;
      },
      ({ data, req }) => {
        if (Array.isArray(data?.notes)) {
          const now = new Date().toISOString();
          data.notes = data.notes.map((note: Record<string, unknown>) => ({
            ...note,
            createdAt: note.createdAt || now,
            authorEmail: note.authorEmail || req.user?.email || null,
          }));
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation !== "create") return;
        // Не await'им — письмо уходит в фоне, чтобы форма на сайте не ждала
        // ответа SMTP (может занимать до минуты). Заявка к этому моменту уже
        // сохранена в базе, так что сбой отправки почты на неё не влияет.
        sendLeadNotification(doc).catch((error) => {
          console.error("[Leads afterChange] не удалось отправить email-уведомление", error);
        });
      },
    ],
  },
};
