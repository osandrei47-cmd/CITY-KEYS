import type { CollectionConfig } from "payload";

export const Tasks: CollectionConfig = {
  slug: "tasks",
  admin: {
    useAsTitle: "description",
    defaultColumns: ["description", "lead", "dueDate", "done"],
  },
  defaultSort: "dueDate",
  access: {
    // Читать задачи может любой вошедший — и администратор, и будущий "наблюдатель"
    read: ({ req }) => Boolean(req.user),
    // Заводить, менять и удалять задачи — только администратор
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "lead",
      label: "Заявка",
      type: "relationship",
      relationTo: "leads",
      required: true,
    },
    {
      name: "description",
      label: "Задача",
      type: "text",
      required: true,
    },
    {
      name: "dueDate",
      label: "Срок выполнения",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
          displayFormat: "d MMM yyyy, HH:mm",
        },
        components: {
          Cell: "@/components/admin/TaskDueDateCell#TaskDueDateCell",
        },
      },
    },
    {
      name: "done",
      label: "Выполнена",
      type: "checkbox",
      defaultValue: false,
      admin: {
        components: {
          Cell: "@/components/admin/TaskDoneCell#TaskDoneCell",
        },
      },
    },
    {
      // Служебное поле — фиксирует, что письмо-напоминание по задаче уже
      // отправлено, чтобы cron-проверка не слала дубли при повторных запусках.
      name: "reminderSentAt",
      label: "Напоминание отправлено",
      type: "date",
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
};
