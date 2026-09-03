import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: "Проект",
    plural: "Проекты",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "isPublished"],
  },
  access: {
    // Каталог проектов виден на публичном сайте без авторизации
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      label: "Название проекта",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "URL-слаг",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Латиницей, без пробелов — например «ust-luga-izhs». Страница проекта должна существовать по адресу /proekty/slug (создаётся разработчиком отдельно от карточки)",
      },
    },
    {
      name: "coverPhoto",
      label: "Обложка карточки",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "gallery",
      label: "Галерея (фото территории)",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description:
          "Фото для блока «Территория» на вручную свёрстанной странице проекта (напр. /proekty/luga-park): дороги, электричество, вид на реку. Порядок — как в списке. Для проектов без своей страницы не используется.",
      },
    },
    {
      name: "shortDescription",
      label: "Краткое описание",
      type: "textarea",
      required: true,
      admin: {
        description: "1-2 предложения для карточки в каталоге /proekty",
      },
    },
    {
      name: "status",
      label: "Статус",
      type: "select",
      required: true,
      defaultValue: "development",
      options: [
        { label: "Идёт продажа", value: "sale" },
        { label: "В разработке", value: "development" },
        { label: "Завершён", value: "completed" },
      ],
    },
    {
      name: "metric",
      label: "Дополнительная метрика",
      type: "text",
      admin: {
        description:
          "Необязательно — короткий текст рядом со статусом на карточке, например «Доходность 18–22%»",
      },
    },
    {
      name: "isPublished",
      label: "Показывать на сайте",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Выключите, если карточка проекта ещё не готова к публикации",
      },
    },
  ],
};
